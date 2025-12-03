import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  return requireAuth(request, async (req, user) => {
    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
    })
  })
}
