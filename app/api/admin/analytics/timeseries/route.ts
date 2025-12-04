// Admin Time Series Data API
// GET /api/admin/analytics/timeseries?metric=users&days=30

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { asyncHandler, AuthorizationError, ValidationError } from '@/lib/api-error-handler'
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

  // Parse query parameters
  const url = new URL(request.url)
  const metric = url.searchParams.get('metric') as 'users' | 'reviews' | 'sessions'
  const days = parseInt(url.searchParams.get('days') || '30')

  // Validate parameters
  if (!metric || !['users', 'reviews', 'sessions'].includes(metric)) {
    throw new ValidationError('Invalid metric. Must be: users, reviews, or sessions')
  }

  if (days < 1 || days > 365) {
    throw new ValidationError('Days must be between 1 and 365')
  }

  // Get time series data
  const data = await analyticsService.getTimeSeriesData(metric, days)

  return NextResponse.json({
    success: true,
    metric,
    days,
    data,
  }, { status: 200 })
})

export const dynamic = 'force-dynamic'
