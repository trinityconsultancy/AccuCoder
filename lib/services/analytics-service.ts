// Analytics Service
// Aggregates metrics for admin dashboard

import User from '@/lib/models/User'
import Review from '@/lib/models/Review'
import Session from '@/lib/models/Session'
import AlphabeticalIndex from '@/lib/models/AlphabeticalIndex'
import { logger } from '@/lib/middleware/request-logger'
import { staticCache, CacheKeyBuilder } from '@/lib/cache/cache-manager'
import mongoose from 'mongoose'

export interface UserStats {
  total: number
  active: number
  newToday: number
  newThisWeek: number
  newThisMonth: number
  byRole: Record<string, number>
  verificationRate: number
}

export interface ReviewStats {
  total: number
  pending: number
  approved: number
  rejected: number
  averageRating: number
  todaySubmissions: number
  approvalRate: number
  byRating: Record<string, number>
}

export interface ApiUsageStats {
  totalRequests: number
  requestsByEndpoint: Record<string, number>
  averageResponseTime: number
  errorRate: number
  cacheHitRate: number
}

export interface SystemMetrics {
  databaseSize: number
  activeConnections: number
  memoryUsage: {
    heapUsed: number
    heapTotal: number
    external: number
  }
  uptime: number
}

export interface EngagementMetrics {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  averageSessionDuration: number
  topFeatures: Array<{ feature: string; usage: number }>
}

export interface DashboardSummary {
  users: UserStats
  reviews: ReviewStats
  api: ApiUsageStats
  system: SystemMetrics
  engagement: EngagementMetrics
  timestamp: Date
}

/**
 * Analytics Service
 */
export class AnalyticsService {
  /**
   * Get complete dashboard summary
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      // Check cache (5 min TTL)
      const cacheKey = 'analytics:dashboard:summary'
      const cached = await staticCache.get(cacheKey)
      if (cached) {
        logger.info('Dashboard summary retrieved from cache')
        return cached as DashboardSummary
      }

      // Aggregate all metrics in parallel
      const [users, reviews, system, engagement] = await Promise.all([
        this.getUserStats(),
        this.getReviewStats(),
        this.getSystemMetrics(),
        this.getEngagementMetrics(),
      ])

      const summary: DashboardSummary = {
        users,
        reviews,
        api: await this.getApiUsageStats(),
        system,
        engagement,
        timestamp: new Date(),
      }

      // Cache for 5 minutes
      await staticCache.set(cacheKey, summary, 5 * 60 * 1000)

      logger.info('Dashboard summary generated')
      return summary
    } catch (error) {
      logger.error('Get dashboard summary error', error)
      throw error
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [
        total,
        verified,
        newToday,
        newThisWeek,
        newThisMonth,
        roleDistribution,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ emailVerified: true }),
        User.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments({ createdAt: { $gte: weekAgo } }),
        User.countDocuments({ createdAt: { $gte: monthAgo } }),
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ]),
      ])

      const byRole: Record<string, number> = {}
      roleDistribution.forEach((item: { _id: string; count: number }) => {
        byRole[item._id] = item.count
      })

      return {
        total,
        active: verified,
        newToday,
        newThisWeek,
        newThisMonth,
        byRole,
        verificationRate: total > 0 ? (verified / total) * 100 : 0,
      }
    } catch (error) {
      logger.error('Get user stats error', error)
      throw error
    }
  }

  /**
   * Get review statistics
   */
  async getReviewStats(): Promise<ReviewStats> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [
        total,
        pending,
        approved,
        rejected,
        todaySubmissions,
        ratingStats,
        ratingDistribution,
      ] = await Promise.all([
        Review.countDocuments(),
        Review.countDocuments({ status: 'pending' }),
        Review.countDocuments({ status: 'approved' }),
        Review.countDocuments({ status: 'rejected' }),
        Review.countDocuments({ createdAt: { $gte: today } }),
        Review.aggregate([
          { $match: { status: 'approved' } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]),
        Review.aggregate([
          { $group: { _id: '$rating', count: { $sum: 1 } } },
        ]),
      ])

      const byRating: Record<string, number> = {}
      ratingDistribution.forEach((item: { _id: number; count: number }) => {
        byRating[item._id.toString()] = item.count
      })

      const averageRating = ratingStats[0]?.avgRating || 0
      const approvalRate =
        total > 0 ? (approved / (approved + rejected)) * 100 : 0

      return {
        total,
        pending,
        approved,
        rejected,
        averageRating: Math.round(averageRating * 10) / 10,
        todaySubmissions,
        approvalRate: Math.round(approvalRate * 10) / 10,
        byRating,
      }
    } catch (error) {
      logger.error('Get review stats error', error)
      throw error
    }
  }

  /**
   * Get API usage statistics (mock for now - would use logging data)
   */
  async getApiUsageStats(): Promise<ApiUsageStats> {
    try {
      // In production, this would aggregate from request logs
      // For now, returning mock data structure
      return {
        totalRequests: 0,
        requestsByEndpoint: {},
        averageResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
      }
    } catch (error) {
      logger.error('Get API usage stats error', error)
      throw error
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const memoryUsage = process.memoryUsage()

      // Get database stats
      let databaseSize = 0
      let activeConnections = 0

      if (mongoose.connection.db) {
        const stats = await mongoose.connection.db.stats()
        databaseSize = stats.dataSize || 0
      }

      return {
        databaseSize,
        activeConnections,
        memoryUsage: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
        },
        uptime: process.uptime(),
      }
    } catch (error) {
      logger.error('Get system metrics error', error)
      throw error
    }
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(): Promise<EngagementMetrics> {
    try {
      const now = new Date()
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [dailyActive, weeklyActive, monthlyActive, avgSessionDuration] =
        await Promise.all([
          Session.distinct('userId', { createdAt: { $gte: dayAgo } }).then(
            (users) => users.length
          ),
          Session.distinct('userId', { createdAt: { $gte: weekAgo } }).then(
            (users) => users.length
          ),
          Session.distinct('userId', { createdAt: { $gte: monthAgo } }).then(
            (users) => users.length
          ),
          Session.aggregate([
            {
              $match: {
                createdAt: { $gte: dayAgo },
                expiresAt: { $exists: true },
              },
            },
            {
              $project: {
                duration: {
                  $subtract: ['$expiresAt', '$createdAt'],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgDuration: { $avg: '$duration' },
              },
            },
          ]),
        ])

      return {
        dailyActiveUsers: dailyActive,
        weeklyActiveUsers: weeklyActive,
        monthlyActiveUsers: monthlyActive,
        averageSessionDuration:
          avgSessionDuration[0]?.avgDuration || 0,
        topFeatures: [], // Would aggregate from usage logs
      }
    } catch (error) {
      logger.error('Get engagement metrics error', error)
      throw error
    }
  }

  /**
   * Get time-series data for charts
   */
  async getTimeSeriesData(
    metric: 'users' | 'reviews' | 'sessions',
    days: number = 30
  ): Promise<Array<{ date: string; count: number }>> {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

      let Model
      switch (metric) {
        case 'users':
          Model = User
          break
        case 'reviews':
          Model = Review
          break
        case 'sessions':
          Model = Session
          break
        default:
          throw new Error(`Unknown metric: ${metric}`)
      }

      const data = await Model.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])

      return data.map((item: { _id: string; count: number }) => ({
        date: item._id,
        count: item.count,
      }))
    } catch (error) {
      logger.error('Get time series data error', error)
      throw error
    }
  }

  /**
   * Get pending reviews for moderation queue
   */
  async getPendingReviews(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit

      const [reviews, total] = await Promise.all([
        Review.find({ status: 'pending' })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Review.countDocuments({ status: 'pending' }),
      ])

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error('Get pending reviews error', error)
      throw error
    }
  }

  /**
   * Clear analytics cache
   */
  async clearCache(): Promise<void> {
    try {
      await staticCache.deletePattern('analytics:*')
      logger.info('Analytics cache cleared')
    } catch (error) {
      logger.error('Clear analytics cache error', error)
      throw error
    }
  }
}

export const analyticsService = new AnalyticsService()
