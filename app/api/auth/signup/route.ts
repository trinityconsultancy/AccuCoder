import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Profile from '@/lib/models/Profile'
import { hashPassword } from '@/lib/auth/password'
import { generateRandomToken, getTokenExpiry } from '@/lib/auth/jwt'
import { sendVerificationEmail } from '@/lib/email/brevo'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      certificationType,
      certificationTitle,
      customCertification,
      certificationId,
      organization,
      position,
    } = body

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    if (!certificationType || !certificationTitle || !certificationId) {
      return NextResponse.json(
        { error: 'Please select certification body, title, and provide your certification ID' },
        { status: 400 }
      )
    }

    if (certificationTitle === 'Other' && !customCertification) {
      return NextResponse.json(
        { error: 'Please specify your certification title' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Strong password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      )
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one lowercase letter' },
        { status: 400 }
      )
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      )
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one special character (!@#$%^&*...)' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate verification token
    const verificationToken = generateRandomToken()
    const verificationTokenExpiry = getTokenExpiry(48) // 48 hours

    // Create user (email NOT verified yet - security fix!)
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
      role: 'user',
    })

    // Note: Profile will be created AFTER email verification, not now!
    // Store profile data temporarily in session or require re-entry after verification
    // For now, we'll just send verification email

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail signup if email fails, user can request resend
    }

    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      userId: user._id,
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
