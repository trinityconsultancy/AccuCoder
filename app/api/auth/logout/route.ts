import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Session from '@/lib/models/Session'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      // Delete session from database
      await Session.deleteOne({ token })
    }

    // Clear cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    response.cookies.delete('auth-token')

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to log out' },
      { status: 500 }
    )
  }
}
