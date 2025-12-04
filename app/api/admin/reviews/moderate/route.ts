// Admin Review Moderation Actions API
// PUT /api/admin/reviews/moderate - Approve or reject reviews

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { asyncHandler, AuthorizationError, ValidationError, NotFoundError } from '@/lib/api-error-handler'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'
import Review from '@/lib/models/Review'
import { logger } from '@/lib/middleware/request-logger'
import { sanitizeInput } from '@/lib/security/input-sanitization'

// Validation schema
const moderateSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Action must be approve or reject' })
  }),
  moderatorNotes: z.string().max(500).optional(),
})

export const PUT = asyncHandler(async (request: Request) => {
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

  // Parse and validate request body
  const body = await request.json()
  
  const validatedData = moderateSchema.parse(body)
  
  // Sanitize inputs
  const sanitizedData = {
    reviewId: sanitizeInput(validatedData.reviewId),
    action: validatedData.action,
    moderatorNotes: validatedData.moderatorNotes ? sanitizeInput(validatedData.moderatorNotes) : undefined,
  }

  // Find review
  const review = await Review.findById(sanitizedData.reviewId)
  
  if (!review) {
    throw new NotFoundError('Review not found')
  }

  // Update review status
  const newStatus = sanitizedData.action === 'approve' ? 'approved' : 'rejected'
  
  review.status = newStatus
  review.moderatedBy = decoded.userId
  review.moderatedAt = new Date()
  
  if (sanitizedData.moderatorNotes) {
    review.moderatorNotes = sanitizedData.moderatorNotes
  }

  await review.save()

  // Log admin action
  logger.info('Review moderated', {
    reviewId: review._id,
    action: sanitizedData.action,
    moderatorId: decoded.userId,
    moderatorEmail: decoded.email,
  })

  return NextResponse.json({
    success: true,
    message: `Review ${sanitizedData.action}d successfully`,
    data: {
      reviewId: review._id,
      status: review.status,
      moderatedAt: review.moderatedAt,
    },
  }, { status: 200 })
})

export const dynamic = 'force-dynamic'
