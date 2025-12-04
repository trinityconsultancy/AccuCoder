// Admin Review Batch Moderation API
// POST /api/admin/reviews/moderate/batch - Approve or reject multiple reviews

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { asyncHandler, AuthorizationError, ValidationError } from '@/lib/api-error-handler'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'
import Review from '@/lib/models/Review'
import { logger } from '@/lib/middleware/request-logger'
import { sanitizeInput } from '@/lib/security/input-sanitization'

// Validation schema
const batchModerateSchema = z.object({
  reviewIds: z.array(z.string()).min(1, 'At least one review ID is required').max(50, 'Maximum 50 reviews per batch'),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Action must be approve or reject' })
  }),
  moderatorNotes: z.string().max(500).optional(),
})

export const POST = asyncHandler(async (request: Request) => {
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
  
  const validatedData = batchModerateSchema.parse(body)
  
  // Sanitize inputs
  const sanitizedData = {
    reviewIds: validatedData.reviewIds.map(id => sanitizeInput(id)),
    action: validatedData.action,
    moderatorNotes: validatedData.moderatorNotes ? sanitizeInput(validatedData.moderatorNotes) : undefined,
  }

  // Update review status
  const newStatus = sanitizedData.action === 'approve' ? 'approved' : 'rejected'
  
  const updateData: any = {
    status: newStatus,
    moderatedBy: decoded.userId,
    moderatedAt: new Date(),
  }
  
  if (sanitizedData.moderatorNotes) {
    updateData.moderatorNotes = sanitizedData.moderatorNotes
  }

  const result = await Review.updateMany(
    { _id: { $in: sanitizedData.reviewIds } },
    { $set: updateData }
  )

  // Log admin action
  logger.info('Batch review moderation', {
    reviewCount: result.modifiedCount,
    action: sanitizedData.action,
    moderatorId: decoded.userId,
    moderatorEmail: decoded.email,
  })

  return NextResponse.json({
    success: true,
    message: `${result.modifiedCount} review(s) ${sanitizedData.action}d successfully`,
    data: {
      processed: sanitizedData.reviewIds.length,
      modified: result.modifiedCount,
      status: newStatus,
    },
  }, { status: 200 })
})

export const dynamic = 'force-dynamic'
