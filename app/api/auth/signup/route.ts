import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { hashPassword } from '@/lib/auth/password'
import { generateRandomToken, getTokenExpiry } from '@/lib/auth/jwt'
import { sendVerificationEmail } from '@/lib/email/brevo'
import { sanitizeInput } from '@/lib/security/input-sanitization'
import { validateSchema } from '@/lib/validation/schema-validator'
import { logger } from '@/lib/middleware/request-logger'
import { ValidationError } from '@/lib/api-error-handler'

// Signup schema with comprehensive validation
const signupSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .max(100, 'Email too long'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  
  certificationType: z.string()
    .min(1, 'Certification type is required')
    .max(100, 'Certification type too long'),
  
  certificationTitle: z.string()
    .min(1, 'Certification title is required')
    .max(100, 'Certification title too long'),
  
  customCertification: z.string()
    .max(100, 'Custom certification too long')
    .optional(),
  
  certificationId: z.string()
    .min(1, 'Certification ID is required')
    .max(50, 'Certification ID too long'),
  
  organization: z.string()
    .max(100, 'Organization name too long')
    .optional(),
  
  position: z.string()
    .max(100, 'Position too long')
    .optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine(data => {
  if (data.certificationTitle === 'Other' && !data.customCertification) {
    return false
  }
  return true
}, {
  message: 'Please specify your certification title',
  path: ['customCertification'],
})

export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID()
  
  try {
    console.log('[SIGNUP] Starting signup process', { correlationId })
    
    await connectDB()
    console.log('[SIGNUP] Database connected', { correlationId })

    // Parse and sanitize input
    const rawBody = await request.json()
    console.log('[SIGNUP] Request body parsed', { correlationId, hasEmail: !!rawBody.email })
    
    const sanitizedBody = sanitizeInput(rawBody)
    console.log('[SIGNUP] Input sanitized', { correlationId })

    logger.info('Signup attempt', {
      correlationId,
      email: sanitizedBody.email,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    })

    // Validate request data
    const validationResult = await validateSchema(signupSchema, sanitizedBody)
    if (!validationResult.success) {
      console.error('[SIGNUP] Validation failed', {
        correlationId,
        errors: validationResult.errors,
      })
      logger.warn('Signup validation failed', {
        correlationId,
        errors: validationResult.errors,
      })
      
      return NextResponse.json({
        error: validationResult.errors[0]?.message || 'Invalid input',
        errors: validationResult.errors,
      }, { status: 400 })
    }

    const data = validationResult.data
    console.log('[SIGNUP] Validation passed', { correlationId, email: data.email })

    // Check if user already exists
    console.log('[SIGNUP] Checking for existing user', { correlationId, email: data.email })
    const existingUser = await User.findOne({ email: data.email })
    if (existingUser) {
      console.log('[SIGNUP] Email already registered', { correlationId, email: data.email })
      logger.warn('Signup failed: Email already registered', {
        correlationId,
        email: data.email,
      })
      
      return NextResponse.json({
        error: 'Email already registered',
      }, { status: 400 })
    }

    // Hash password
    console.log('[SIGNUP] Hashing password', { correlationId })
    const hashedPassword = await hashPassword(data.password)
    console.log('[SIGNUP] Password hashed', { correlationId })

    // Generate verification token
    const verificationToken = generateRandomToken()
    const verificationTokenExpiry = getTokenExpiry(48) // 48 hours

    // Create user (email NOT verified yet)
    console.log('[SIGNUP] Creating user', { correlationId, email: data.email })
    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      certificationType: data.certificationType,
      certificationTitle: data.certificationTitle === 'Other' ? data.customCertification : data.certificationTitle,
      certificationId: data.certificationId,
      organization: data.organization,
      position: data.position,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
      role: 'user',
    })

    console.log('[SIGNUP] User created successfully', {
      correlationId,
      userId: user._id.toString(),
      email: user.email,
    })
    logger.info('User account created', {
      correlationId,
      userId: user._id.toString(),
      email: user.email,
    })

    // Send verification email
    try {
      await sendVerificationEmail(data.email, verificationToken)
      
      logger.info('Verification email sent', {
        correlationId,
        userId: user._id.toString(),
        email: user.email,
      })
    } catch (emailError) {
      logger.error('Failed to send verification email', {
        correlationId,
        userId: user._id.toString(),
        email: user.email,
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
      })
      // Don't fail signup if email fails, user can request resend
    }

    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      userId: user._id,
    }, { status: 201 })

  } catch (error) {
    console.error('[SIGNUP] Error occurred', {
      correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
    })
    
    logger.error('Signup error', {
      correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof ValidationError) {
      return NextResponse.json({
        error: error.message,
      }, { status: 400 })
    }

    // Return detailed error message for debugging
    return NextResponse.json({
      error: 'Failed to create account. Please try again.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    }, { status: 500 })
  }
}
