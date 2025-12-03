import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Session from '@/lib/models/Session'
import { verifyPassword } from '@/lib/auth/password'
import { generateToken, getTokenExpiry } from '@/lib/auth/jwt'
import { asyncHandler, ValidationError, AuthenticationError, AuthorizationError } from '@/lib/api-error-handler'
import { withRateLimit, rateLimiters, getClientIdentifier, addRateLimitHeaders } from '@/lib/rate-limiter'

export const POST = asyncHandler(async (request: NextRequest) => {
  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(request, rateLimiters.auth)
  if (rateLimitResponse) return rateLimitResponse

  await connectDB()

  const body = await request.json()
  const { email, password, rememberMe } = body

  if (!email || !password) {
    throw new ValidationError('Please enter email and password')
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    throw new AuthenticationError('Invalid email or password')
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password')
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw new AuthorizationError('Please verify your email before logging in')
  }

  // Generate JWT token
  const token = generateToken(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    rememberMe
  )

  // Create session in database
  const expiresAt = getTokenExpiry(rememberMe ? 24 * 7 : 24) // 7 days or 24 hours
  await Session.create({
    userId: user._id,
    token,
    expiresAt,
    rememberMe,
  })

  // Get rate limit info for headers
  const identifier = getClientIdentifier(request)
  const rateLimitInfo = await rateLimiters.auth.check(identifier)

  // Set cookie
  const response = NextResponse.json({
    success: true,
    message: 'Logged in successfully',
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  })

  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24, // 7 days or 24 hours
    path: '/',
  })

  return addRateLimitHeaders(response, rateLimiters.auth, rateLimitInfo)
})