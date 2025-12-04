// Authentication Service
// Business logic for authentication operations

import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthenticationError, ValidationError } from '@/lib/api-error-handler'
import { logger } from '@/lib/middleware/request-logger'
import { UserRepository } from '@/lib/database/transactions'
import { sessionCache } from '@/lib/cache/cache-manager'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface AuthResult {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

/**
 * Authentication Service
 */
export class AuthService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { email, password } = credentials

      // Find user
      const user = await this.userRepository.findOne({ email: email.toLowerCase() })
      if (!user) {
        throw new AuthenticationError('Invalid email or password')
      }

      // Verify password
      const isValid = await bcryptjs.compare(password, user.password)
      if (!isValid) {
        throw new AuthenticationError('Invalid email or password')
      }

      // Generate JWT
      const token = this.generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      })

      // Cache session
      await sessionCache.set(`session:${user._id}`, token, 7 * 24 * 60 * 60 * 1000) // 7 days

      logger.info('User logged in', { userId: user._id, email: user.email })

      return {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.email.split('@')[0], // Use email prefix as name
          role: user.role,
        },
      }
    } catch (error) {
      logger.error('Login error', error)
      throw error
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      const { email, password, name } = data

      // Check if user exists
      const existingUser = await this.userRepository.findOne({ email: email.toLowerCase() })
      if (existingUser) {
        throw new ValidationError('User with this email already exists')
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 10)

      // Create user
      const user = await this.userRepository.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user',
        emailVerified: false,
      })

      // Generate JWT
      const token = this.generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      })

      // Cache session
      await sessionCache.set(`session:${user._id}`, token, 7 * 24 * 60 * 60 * 1000)

      logger.info('User registered', { userId: user._id, email: user.email })

      return {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.email.split('@')[0], // Use email prefix as name
          role: user.role,
        },
      }
    } catch (error) {
      logger.error('Registration error', error)
      throw error
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    try {
      // Remove from cache
      await sessionCache.delete(`session:${userId}`)

      logger.info('User logged out', { userId })
    } catch (error) {
      logger.error('Logout error', error)
      throw error
    }
  }

  /**
   * Verify token
   */
  async verifyToken(token: string): Promise<{
    userId: string
    email: string
    role: string
  }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

      // Check cache
      const cachedToken = await sessionCache.get(`session:${decoded.userId}`)
      if (!cachedToken) {
        throw new AuthenticationError('Session expired')
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      }
    } catch (error) {
      logger.error('Token verification error', error)
      throw new AuthenticationError('Invalid or expired token')
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: {
    userId: string
    email: string
    role: string
  }): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    })
  }
}
