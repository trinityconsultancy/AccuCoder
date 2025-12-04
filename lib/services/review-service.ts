// Review Service Layer
// Business logic for review operations

import { Types } from 'mongoose'
import { NotFoundError, ValidationError, AuthorizationError } from '@/lib/api-error-handler'
import { logger } from '@/lib/middleware/request-logger'
import Review from '@/lib/models/Review'
import { databaseCache, CacheKeyBuilder } from '@/lib/cache/cache-manager'

export interface ReviewData {
  name: string
  email: string
  role: string
  location: string
  country: string
  rating: number
  comment: string
}

export interface ReviewUpdateData {
  rating?: number
  comment?: string
  reviewerName?: string
  reviewerTitle?: string
}

export interface ReviewFilters {
  status?: 'pending' | 'approved' | 'rejected'
  minRating?: number
  userId?: string
}

/**
 * Review Service
 */
export class ReviewService {
  /**
   * Create review
   */
  async createReview(data: ReviewData): Promise<any> {
    try {
      const { name, email, role, location, country, rating, comment } = data

      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new ValidationError('Rating must be between 1 and 5')
      }

      // Create review
      const review = await Review.create({
        name,
        email,
        role,
        location,
        country,
        rating,
        comment,
        status: 'pending',
      })

      // Invalidate reviews cache
      await databaseCache.deletePattern('reviews:*')

      logger.info('Review created', { reviewId: review._id, email })
      return review
    } catch (error) {
      logger.error('Create review error', error)
      throw error
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<any> {
    try {
      // Check cache
      const cacheKey = CacheKeyBuilder.generic('review', reviewId)
      const cached = await databaseCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // Query database
      const review = await Review.findById(reviewId).populate('userId', 'name email')
      if (!review) {
        throw new NotFoundError('Review not found')
      }

      // Cache result
      await databaseCache.set(cacheKey, review, 15 * 60 * 1000)

      return review
    } catch (error) {
      logger.error('Get review error', error)
      throw error
    }
  }

  /**
   * Get reviews with filters and pagination
   */
  async getReviews(
    filters: ReviewFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    reviews: any[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      const { status, minRating, userId } = filters

      // Build cache key based on filters
      const cacheKey = CacheKeyBuilder.generic(
        'reviews',
        `${status || 'all'}_${minRating || 0}_${userId || 'all'}_${page}_${limit}`
      )

      // Check cache
      const cached = await databaseCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // Build query
      const query: any = {}
      if (status) query.status = status
      if (minRating) query.rating = { $gte: minRating }
      if (userId) query.userId = new Types.ObjectId(userId)

      const skip = (page - 1) * limit

      // Query database
      const [reviews, total] = await Promise.all([
        Review.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email'),
        Review.countDocuments(query),
      ])

      const result = {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }

      // Cache result
      await databaseCache.set(cacheKey, result, 5 * 60 * 1000) // 5 minutes

      logger.info('Reviews retrieved', { filters, page, limit, total })
      return result
    } catch (error) {
      logger.error('Get reviews error', error)
      throw error
    }
  }

  /**
   * Update review (Admin only - authorization checked at controller level)
   */
  async updateReview(
    reviewId: string,
    updates: ReviewUpdateData
  ): Promise<any> {
    try {
      // Get review
      const review = await Review.findById(reviewId)
      if (!review) {
        throw new NotFoundError('Review not found')
      }

      // Update review
      Object.assign(review, updates)
      await review.save()

      // Invalidate caches
      await Promise.all([
        databaseCache.delete(CacheKeyBuilder.generic('review', reviewId)),
        databaseCache.deletePattern('reviews:*'),
      ])

      logger.info('Review updated', { reviewId })
      return review
    } catch (error) {
      logger.error('Update review error', error)
      throw error
    }
  }

  /**
   * Update review status (admin only)
   */
  async updateReviewStatus(
    reviewId: string,
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<any> {
    try {
      const review = await Review.findByIdAndUpdate(
        reviewId,
        { status },
        { new: true, runValidators: true }
      )

      if (!review) {
        throw new NotFoundError('Review not found')
      }

      // Invalidate caches
      await Promise.all([
        databaseCache.delete(CacheKeyBuilder.generic('review', reviewId)),
        databaseCache.deletePattern('reviews:*'),
      ])

      logger.info('Review status updated', { reviewId, status })
      return review
    } catch (error) {
      logger.error('Update review status error', error)
      throw error
    }
  }

  /**
   * Delete review (Admin only - authorization checked at controller level)
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      // Get review
      const review = await Review.findById(reviewId)
      if (!review) {
        throw new NotFoundError('Review not found')
      }

      // Delete review
      await review.deleteOne()

      // Invalidate caches
      await Promise.all([
        databaseCache.delete(CacheKeyBuilder.generic('review', reviewId)),
        databaseCache.deletePattern('reviews:*'),
      ])

      logger.info('Review deleted', { reviewId })
    } catch (error) {
      logger.error('Delete review error', error)
      throw error
    }
  }

  /**
   * Get review statistics
   */
  async getReviewStats(): Promise<{
    total: number
    approved: number
    pending: number
    rejected: number
    averageRating: number
    ratingDistribution: Record<number, number>
  }> {
    try {
      // Check cache
      const cacheKey = 'review:stats'
      const cached = await databaseCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // Aggregate statistics
      const [counts, avgResult, distribution] = await Promise.all([
        Review.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
        Review.aggregate([
          {
            $group: {
              _id: null,
              average: { $avg: '$rating' },
            },
          },
        ]),
        Review.aggregate([
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 },
            },
          },
        ]),
      ])

      // Process results
      const statusCounts = counts.reduce((acc: Record<string, number>, item: any) => {
        acc[item._id] = item.count
        return acc
      }, {} as Record<string, number>)

      const ratingDist = distribution.reduce((acc: Record<number, number>, item: any) => {
        acc[item._id] = item.count
        return acc
      }, {} as Record<number, number>)

      const stats = {
        total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
        approved: statusCounts.approved || 0,
        pending: statusCounts.pending || 0,
        rejected: statusCounts.rejected || 0,
        averageRating: avgResult[0]?.average || 0,
        ratingDistribution: ratingDist,
      }

      // Cache result
      await databaseCache.set(cacheKey, stats, 10 * 60 * 1000) // 10 minutes

      logger.info('Review stats retrieved', stats)
      return stats
    } catch (error) {
      logger.error('Get review stats error', error)
      throw error
    }
  }
}
