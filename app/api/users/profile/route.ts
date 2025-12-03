import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Profile from '@/lib/models/Profile'
import { requireAuth } from '@/lib/auth/middleware'

// GET user profile
export async function GET(request: NextRequest) {
  return requireAuth(request, async (req, user) => {
    try {
      await connectDB()

      const profile = await Profile.findOne({ userId: user.userId })

      if (!profile) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        profile: {
          id: profile._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: user.email,
          certificationBody: profile.certificationBody,
          certificationTitle: profile.certificationTitle,
          aapcId: profile.aapcId,
          ahimaId: profile.ahimaId,
          organization: profile.organization,
          position: profile.position,
          role: user.role,
        },
      })

    } catch (error) {
      console.error('Get profile error:', error)
      return NextResponse.json(
        { error: 'Failed to get profile' },
        { status: 500 }
      )
    }
  })
}

// POST/PUT create or update profile
export async function POST(request: NextRequest) {
  return requireAuth(request, async (req, user) => {
    try {
      await connectDB()

      const body = await request.json()
      const {
        firstName,
        lastName,
        certificationBody,
        certificationTitle,
        aapcId,
        ahimaId,
        organization,
        position,
      } = body

      // Validation
      if (!firstName || !lastName || !certificationBody || !certificationTitle) {
        return NextResponse.json(
          { error: 'Please fill in all required fields' },
          { status: 400 }
        )
      }

      // Check if profile exists
      let profile = await Profile.findOne({ userId: user.userId })

      if (profile) {
        // Update existing profile
        profile.firstName = firstName
        profile.lastName = lastName
        profile.certificationBody = certificationBody
        profile.certificationTitle = certificationTitle
        profile.aapcId = aapcId
        profile.ahimaId = ahimaId
        profile.organization = organization
        profile.position = position
        await profile.save()
      } else {
        // Create new profile
        profile = await Profile.create({
          userId: user.userId,
          firstName,
          lastName,
          certificationBody,
          certificationTitle,
          aapcId,
          ahimaId,
          organization,
          position,
        })
      }

      return NextResponse.json({
        success: true,
        message: profile ? 'Profile updated successfully' : 'Profile created successfully',
        profile: {
          id: profile._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          certificationBody: profile.certificationBody,
          certificationTitle: profile.certificationTitle,
          aapcId: profile.aapcId,
          ahimaId: profile.ahimaId,
          organization: profile.organization,
          position: profile.position,
        },
      })

    } catch (error) {
      console.error('Create/update profile error:', error)
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      )
    }
  })
}
