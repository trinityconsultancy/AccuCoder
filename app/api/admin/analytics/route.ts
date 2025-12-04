// Admin Analytics Dashboard API
// GET /api/admin/analytics - Get complete dashboard summary

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { asyncHandler, AuthorizationError } from '@/lib/api-error-handler'
import { analyticsService } from '@/lib/services/analytics-service'
import { verifyToken } from '@/lib/auth/jwt'

export const GET = asyncHandler(async (request: Request) => {
  await connectDB()

  // Verify admin authentication
  const authHeader = request.headers.get('authorization')
  const cookieHeader = request.headers.get('cookie')
  
  let token: string | null = null
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    token = cookies['auth-token']
  }

  if (!token) {
    throw new AuthorizationError('Admin authentication required')
  }

  const decoded = verifyToken(token)
  
  if (!decoded || decoded.role !== 'admin') {
    throw new AuthorizationError('Admin access required')
  }

  // Get dashboard summary
  const summary = await analyticsService.getDashboardSummary()

  return NextResponse.json({
    success: true,
    data: summary,
  }, { status: 200 })
})

export const dynamic = 'force-dynamic'
