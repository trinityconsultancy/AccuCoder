import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from './jwt'
import connectDB from '../mongodb'
import User from '../models/User'
import Session from '../models/Session'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export async function requireAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get token from cookie or authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please log in again.' },
        { status: 401 }
      )
    }

    // Connect to database
    await connectDB()

    // Verify session exists in database
    const session = await Session.findOne({
      token,
      userId: decoded.userId,
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      )
    }

    // Verify user still exists and is not deleted
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 401 }
      )
    }

    // Call the handler with authenticated user
    return await handler(request, decoded)
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function requireAdmin(
  request: NextRequest,
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(request, async (req, user) => {
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      )
    }
    return handler(req, user)
  })
}

export async function requireSuperAdmin(
  request: NextRequest,
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(request, async (req, user) => {
    if (user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden. Super admin access required.' },
        { status: 403 }
      )
    }
    return handler(req, user)
  })
}
