// Authentication Controller
// Handles HTTP requests for authentication endpoints

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth-service'
import { withSchemaValidation, CommonSchemas } from '@/lib/validation/schema-validator'
import { withRequestLogging } from '@/lib/middleware/request-logger'
import { withInputSanitization } from '@/lib/security/input-sanitization'
import { rateLimiters } from '@/lib/rate-limiter'
import { AuthenticationError } from '@/lib/api-error-handler'
import connectDB from '@/lib/mongodb'
import { z } from 'zod'

const authService = new AuthService()

/**
 * Login controller
 */
export const loginController = withRequestLogging(
  withInputSanitization(
    withSchemaValidation(
      {
        body: CommonSchemas.userLogin,
        response: z.object({
          success: z.boolean(),
          message: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string(),
            name: z.string(),
            role: z.string(),
          }),
        }),
      },
      async (req: Request, validated) => {
        await connectDB()

        const { email, password } = validated.body!

        // Rate limiting
        const rateLimitResult = await rateLimiters.auth.check(email)
        if (!rateLimitResult.allowed) {
          throw new AuthenticationError(
            `Too many login attempts. Please try again in ${Math.ceil(
              (rateLimitResult.resetAt - Date.now()) / 60000
            )} minutes`
          )
        }

        // Call service
        const result = await authService.login({ email, password })

        // Set cookie
        const response = {
          success: true,
          message: 'Login successful',
          user: result.user,
        }

        const headers = new Headers()
        headers.set(
          'Set-Cookie',
          `token=${result.token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`
        )

        return new Response(JSON.stringify(response), {
          status: 200,
          headers,
        })
      }
    )
  )
)

/**
 * Register controller
 */
export const registerController = withRequestLogging(
  withInputSanitization(
    withSchemaValidation(
      {
        body: CommonSchemas.userRegistration,
        response: z.object({
          success: z.boolean(),
          message: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string(),
            name: z.string(),
            role: z.string(),
          }),
        }),
      },
      async (req: Request, validated) => {
        await connectDB()

        const { email, password, name } = validated.body!

        // Rate limiting
        const rateLimitResult = await rateLimiters.auth.check(email)
        if (!rateLimitResult.allowed) {
          throw new AuthenticationError(
            `Too many registration attempts. Please try again in ${Math.ceil(
              (rateLimitResult.resetAt - Date.now()) / 60000
            )} minutes`
          )
        }

        // Call service
        const result = await authService.register({ email, password, name })

        // Set cookie
        const response = {
          success: true,
          message: 'Registration successful',
          user: result.user,
        }

        const headers = new Headers()
        headers.set(
          'Set-Cookie',
          `token=${result.token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`
        )

        return new Response(JSON.stringify(response), {
          status: 201,
          headers,
        })
      }
    )
  )
)

/**
 * Logout controller
 */
export const logoutController = withRequestLogging(
  async (req: Request): Promise<Response> => {
    await connectDB()

    // Get token from cookie
    const cookies = req.headers.get('cookie') || ''
    const tokenMatch = cookies.match(/token=([^;]+)/)
    const token = tokenMatch ? tokenMatch[1] : null

    if (token) {
      try {
        const decoded = await authService.verifyToken(token)
        await authService.logout(decoded.userId)
      } catch {
        // Ignore errors during logout
      }
    }

    // Clear cookie
    const headers = new Headers()
    headers.set(
      'Set-Cookie',
      'token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Logout successful',
      }),
      {
        status: 200,
        headers,
      }
    )
  }
)

/**
 * Verify token controller
 */
export const verifyTokenController = withRequestLogging(
  async (req: Request): Promise<Response> => {
    await connectDB()

    // Get token from cookie or Authorization header
    const cookies = req.headers.get('cookie') || ''
    const tokenMatch = cookies.match(/token=([^;]+)/)
    const cookieToken = tokenMatch ? tokenMatch[1] : null

    const authHeader = req.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    const token = cookieToken || bearerToken

    if (!token) {
      throw new AuthenticationError('No token provided')
    }

    const user = await authService.verifyToken(token)

    return NextResponse.json({
      success: true,
      user,
    })
  }
)
