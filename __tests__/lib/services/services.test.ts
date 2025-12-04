// Tests for Services
// Integration tests for service layer

import { AuthService } from '@/lib/services/auth-service'
import { ProfileService } from '@/lib/services/profile-service'
import { ReviewService } from '@/lib/services/review-service'
import { ICDSearchService } from '@/lib/services/icd-search-service'

// Mock dependencies
jest.mock('@/lib/middleware/request-logger')
jest.mock('@/lib/cache/cache-manager')
jest.mock('@/models/User')
jest.mock('@/models/Profile')
jest.mock('@/models/Review')
jest.mock('@/models/AlphabeticalIndex')

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService()
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Mock User.findOne to return a user
      const User = require('@/models/User').default
      User.findOne = jest.fn().mockResolvedValue({
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        password: '$2b$10$...' // Mocked bcrypt hash
      })

      // Mock bcrypt.compare
      const bcrypt = require('bcrypt')
      bcrypt.compare = jest.fn().mockResolvedValue(true)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toHaveProperty('token')
      expect(result.user).toEqual({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      })
    })

    it('should throw error for invalid email', async () => {
      const User = require('@/models/User').default
      User.findOne = jest.fn().mockResolvedValue(null)

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email or password')
    })

    it('should throw error for invalid password', async () => {
      const User = require('@/models/User').default
      User.findOne = jest.fn().mockResolvedValue({
        _id: '123',
        email: 'test@example.com',
        password: '$2b$10$...',
      })

      const bcrypt = require('bcrypt')
      bcrypt.compare = jest.fn().mockResolvedValue(false)

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password')
    })
  })

  describe('register', () => {
    it('should successfully register new user', async () => {
      const User = require('@/models/User').default
      User.findOne = jest.fn().mockResolvedValue(null)

      const mockCreate = jest.fn().mockResolvedValue({
        _id: '123',
        email: 'new@example.com',
        name: 'New User',
        role: 'user',
      })

      // Mock repository create
      jest.spyOn(authService['userRepository'], 'create').mockImplementation(mockCreate)

      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      })

      expect(result).toHaveProperty('token')
      expect(result.user.email).toBe('new@example.com')
    })

    it('should throw error if user already exists', async () => {
      const User = require('@/models/User').default
      User.findOne = jest.fn().mockResolvedValue({
        _id: '123',
        email: 'existing@example.com',
      })

      const mockFindOne = jest.fn().mockResolvedValue({ email: 'existing@example.com' })
      jest.spyOn(authService['userRepository'], 'findOne').mockImplementation(mockFindOne)

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test',
        })
      ).rejects.toThrow('User with this email already exists')
    })
  })
})

describe('ProfileService', () => {
  let profileService: ProfileService

  beforeEach(() => {
    profileService = new ProfileService()
    jest.clearAllMocks()
  })

  describe('getProfileByUserId', () => {
    it('should retrieve profile from cache', async () => {
      const { databaseCache } = require('@/lib/cache/cache-manager')
      databaseCache.get = jest.fn().mockResolvedValue({
        userId: '123',
        credentials: 'MD',
      })

      const result = await profileService.getProfileByUserId('123')

      expect(result).toHaveProperty('userId', '123')
      expect(databaseCache.get).toHaveBeenCalled()
    })

    it('should query database if not in cache', async () => {
      const { databaseCache } = require('@/lib/cache/cache-manager')
      databaseCache.get = jest.fn().mockResolvedValue(null)
      databaseCache.set = jest.fn()

      const Profile = require('@/models/Profile').default
      Profile.findOne = jest.fn().mockResolvedValue({
        userId: '123',
        credentials: 'MD',
      })

      const result = await profileService.getProfileByUserId('123')

      expect(result).toHaveProperty('userId', '123')
      expect(Profile.findOne).toHaveBeenCalled()
      expect(databaseCache.set).toHaveBeenCalled()
    })
  })

  describe('createProfile', () => {
    it('should create new profile', async () => {
      const Profile = require('@/models/Profile').default
      Profile.findOne = jest.fn().mockResolvedValue(null)
      Profile.create = jest.fn().mockResolvedValue({
        _id: 'profile123',
        userId: 'user123',
        credentials: 'MD',
      })

      const result = await profileService.createProfile({
        userId: 'user123',
        credentials: 'MD',
      })

      expect(result).toHaveProperty('_id', 'profile123')
      expect(Profile.create).toHaveBeenCalled()
    })

    it('should throw error if profile already exists', async () => {
      const Profile = require('@/models/Profile').default
      Profile.findOne = jest.fn().mockResolvedValue({ userId: 'user123' })

      await expect(
        profileService.createProfile({
          userId: 'user123',
          credentials: 'MD',
        })
      ).rejects.toThrow('Profile already exists')
    })
  })
})

describe('ReviewService', () => {
  let reviewService: ReviewService

  beforeEach(() => {
    reviewService = new ReviewService()
    jest.clearAllMocks()
  })

  describe('createReview', () => {
    it('should create review with valid data', async () => {
      const Review = require('@/models/Review').default
      Review.create = jest.fn().mockResolvedValue({
        _id: 'review123',
        userId: 'user123',
        rating: 5,
        status: 'pending',
      })

      const result = await reviewService.createReview({
        userId: 'user123',
        rating: 5,
        comment: 'Great!',
        reviewerName: 'John Doe',
      })

      expect(result).toHaveProperty('_id', 'review123')
      expect(Review.create).toHaveBeenCalled()
    })

    it('should reject invalid rating', async () => {
      await expect(
        reviewService.createReview({
          userId: 'user123',
          rating: 6, // Invalid
          comment: 'Test',
          reviewerName: 'John',
        })
      ).rejects.toThrow('Rating must be between 1 and 5')
    })
  })

  describe('getReviews', () => {
    it('should retrieve reviews with filters', async () => {
      const { databaseCache } = require('@/lib/cache/cache-manager')
      databaseCache.get = jest.fn().mockResolvedValue(null)
      databaseCache.set = jest.fn()

      const Review = require('@/models/Review').default
      Review.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([
          { rating: 5, status: 'approved' },
        ]),
      })
      Review.countDocuments = jest.fn().mockResolvedValue(1)

      const result = await reviewService.getReviews({ status: 'approved' }, 1, 20)

      expect(result).toHaveProperty('reviews')
      expect(result).toHaveProperty('total', 1)
    })
  })
})

describe('ICDSearchService', () => {
  let icdService: ICDSearchService

  beforeEach(() => {
    icdService = new ICDSearchService()
    jest.clearAllMocks()
  })

  describe('searchCodes', () => {
    it('should search ICD codes', async () => {
      const { staticCache } = require('@/lib/cache/cache-manager')
      staticCache.get = jest.fn().mockResolvedValue(null)
      staticCache.set = jest.fn()

      const AlphabeticalIndex = require('@/models/AlphabeticalIndex').default
      AlphabeticalIndex.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { code: 'A00', description: 'Cholera' },
        ]),
      })
      AlphabeticalIndex.countDocuments = jest.fn().mockResolvedValue(1)

      const result = await icdService.searchCodes({ query: 'cholera' })

      expect(result).toHaveProperty('results')
      expect(result.results.length).toBe(1)
    })
  })

  describe('getSuggestions', () => {
    it('should return autocomplete suggestions', async () => {
      const { staticCache } = require('@/lib/cache/cache-manager')
      staticCache.get = jest.fn().mockResolvedValue(null)
      staticCache.set = jest.fn()

      const AlphabeticalIndex = require('@/models/AlphabeticalIndex').default
      AlphabeticalIndex.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { mainTerm: 'Diabetes' },
          { mainTerm: 'Diabetic' },
        ]),
      })

      const result = await icdService.getSuggestions('diab', 10)

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return empty array for short queries', async () => {
      const result = await icdService.getSuggestions('a', 10)
      expect(result).toEqual([])
    })
  })
})
