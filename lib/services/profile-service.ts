// Profile Service Layer
// Business logic for user profile operations

import { Types } from 'mongoose'
import { NotFoundError, ValidationError } from '@/lib/api-error-handler'
import { logger } from '@/lib/middleware/request-logger'
import Profile from '@/lib/models/Profile'
import { databaseCache, CacheKeyBuilder } from '@/lib/cache/cache-manager'

export interface ProfileData {
  userId: string
  credentials?: string
  specialty?: string
  certifications?: string[]
  yearsOfExperience?: number
  bio?: string
}

export interface ProfileUpdateData {
  credentials?: string
  specialty?: string
  certifications?: string[]
  yearsOfExperience?: number
  bio?: string
}

/**
 * Profile Service
 */
export class ProfileService {
  /**
   * Get profile by user ID
   */
  async getProfileByUserId(userId: string): Promise<any> {
    try {
      // Check cache first
      const cacheKey = CacheKeyBuilder.profile(userId)
      const cached = await databaseCache.get(cacheKey)
      if (cached) {
        logger.debug('Profile cache hit', { userId })
        return cached
      }

      // Query database
      const profile = await Profile.findOne({ userId: new Types.ObjectId(userId) })
      if (!profile) {
        throw new NotFoundError('Profile not found')
      }

      // Cache result
      await databaseCache.set(cacheKey, profile, 15 * 60 * 1000) // 15 minutes

      logger.info('Profile retrieved', { userId })
      return profile
    } catch (error) {
      logger.error('Get profile error', error)
      throw error
    }
  }

  /**
   * Create profile
   */
  async createProfile(data: ProfileData): Promise<any> {
    try {
      const { userId, ...profileData } = data

      // Check if profile exists
      const existing = await Profile.findOne({ userId: new Types.ObjectId(userId) })
      if (existing) {
        throw new ValidationError('Profile already exists for this user')
      }

      // Create profile
      const profile = await Profile.create({
        userId: new Types.ObjectId(userId),
        ...profileData,
      })

      // Cache profile
      const cacheKey = CacheKeyBuilder.profile(userId)
      await databaseCache.set(cacheKey, profile, 15 * 60 * 1000)

      logger.info('Profile created', { userId, profileId: profile._id })
      return profile
    } catch (error) {
      logger.error('Create profile error', error)
      throw error
    }
  }

  /**
   * Update profile
   */
  async updateProfile(userId: string, updates: ProfileUpdateData): Promise<any> {
    try {
      // Update profile
      const profile = await Profile.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: updates },
        { new: true, runValidators: true }
      )

      if (!profile) {
        throw new NotFoundError('Profile not found')
      }

      // Invalidate cache
      const cacheKey = CacheKeyBuilder.profile(userId)
      await databaseCache.delete(cacheKey)

      logger.info('Profile updated', { userId, profileId: profile._id })
      return profile
    } catch (error) {
      logger.error('Update profile error', error)
      throw error
    }
  }

  /**
   * Delete profile
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      const result = await Profile.deleteOne({ userId: new Types.ObjectId(userId) })

      if (result.deletedCount === 0) {
        throw new NotFoundError('Profile not found')
      }

      // Invalidate cache
      const cacheKey = CacheKeyBuilder.profile(userId)
      await databaseCache.delete(cacheKey)

      logger.info('Profile deleted', { userId })
    } catch (error) {
      logger.error('Delete profile error', error)
      throw error
    }
  }

  /**
   * Get all profiles with pagination
   */
  async getAllProfiles(page: number = 1, limit: number = 20): Promise<{
    profiles: any[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      const skip = (page - 1) * limit

      const [profiles, total] = await Promise.all([
        Profile.find().skip(skip).limit(limit).populate('userId', 'name email'),
        Profile.countDocuments(),
      ])

      logger.info('Profiles retrieved', { page, limit, total })

      return {
        profiles,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      logger.error('Get all profiles error', error)
      throw error
    }
  }
}
