// Review Controller
// Handles HTTP requests for review endpoints

import { NextResponse } from 'next/server'
import { ReviewService } from '@/lib/services/review-service'
import { withSchemaValidation, CommonSchemas } from '@/lib/validation/schema-validator'
import { withRequestLogging } from '@/lib/middleware/request-logger'
import { withInputSanitization } from '@/lib/security/input-sanitization'
import { AuthenticationError } from '@/lib/api-error-handler'
import connectDB from '@/lib/mongodb'
import { z } from 'zod'

const reviewService = new ReviewService()

/**
 * Extract user from request (helper function)
 */
async function getUserFromRequest(req: Request): Promise<{ userId: string; role: string }> {
  // This is a simplified implementation
  // In production, use proper JWT verification
  const cookies = req.headers.get('cookie') || ''
  const tokenMatch = cookies.match(/token=([^;]+)/)
  const token = tokenMatch ? tokenMatch[1] : null

  if (!token) {
    throw new AuthenticationError('Authentication required')
  }

  // Decode token (simplified - use proper JWT verification in production)
  const jwt = require('jsonwebtoken')
  const decoded = jwt.verify(token, process.env.JWT_SECRET!)

  return {
    userId: decoded.userId,
    role: decoded.role,
  }
}

/**
 * Create review controller
 */
export const createReviewController = withRequestLogging(
  withInputSanitization(
    withSchemaValidation(
      {
        body: CommonSchemas.reviewCreation,
        response: z.object({
          success: z.boolean(),
          review: z.any(),
        }),
      },
      async (req: Request, validated) => {
        await connectDB()

        const { name, email, role, location, country, rating, comment } = validated.body!

        const review = await reviewService.createReview({
          name,
          email,
          role,
          location,
          country,
          rating,
          comment,
        })

        return {
          success: true,
          review,
        }
      }
    )
  )
)

/**
 * Get reviews controller
 */
export const getReviewsController = withRequestLogging(
  withSchemaValidation(
    {
      query: z.object({
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        minRating: z.coerce.number().int().min(1).max(5).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
      }),
      response: z.object({
        reviews: z.array(z.any()),
        total: z.number(),
        page: z.number(),
        totalPages: z.number(),
      }),
    },
    async (req: Request, validated) => {
      await connectDB()

      const { status, minRating, page, limit } = validated.query!

      const result = await reviewService.getReviews(
        { status, minRating },
        page,
        limit
      )

      return result
    }
  )
)

/**
 * Get review stats controller
 */
export const getReviewStatsController = withRequestLogging(
  async (req: Request): Promise<Response> => {
    await connectDB()

    const stats = await reviewService.getReviewStats()

    return NextResponse.json(stats)
  }
)

/**
 * Update review status controller (admin only)
 */
export const updateReviewStatusController = withRequestLogging(
  withInputSanitization(
    withSchemaValidation(
      {
        body: z.object({
          reviewId: z.string().regex(/^[0-9a-fA-F]{24}$/),
          status: z.enum(['pending', 'approved', 'rejected']),
        }),
        response: z.object({
          success: z.boolean(),
          review: z.any(),
        }),
      },
      async (req: Request, validated) => {
        await connectDB()

        const user = await getUserFromRequest(req)

        // Check admin role
        if (user.role !== 'admin') {
          throw new AuthenticationError('Admin access required')
        }

        const { reviewId, status } = validated.body!

        const review = await reviewService.updateReviewStatus(reviewId, status)

        return {
          success: true,
          review,
        }
      }
    )
  )
)
