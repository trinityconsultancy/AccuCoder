// Enhanced Login API with all enterprise features
// Demonstrates: schema validation, rate limiting, logging, error handling, input sanitization

import { NextRequest } from 'next/server'
import { withSchemaValidation, CommonSchemas } from '@/lib/validation/schema-validator'
import { withRequestLogging } from '@/lib/middleware/request-logger'
import { withInputSanitization } from '@/lib/security/input-sanitization'
import { rateLimiters } from '@/lib/rate-limiter'
import { AuthenticationError } from '@/lib/api-error-handler'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Session from '@/lib/models/Session'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Response schema
const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.string(),
  }),
})

// Handler with all enterprise features
const handler = withRequestLogging(
  withInputSanitization(
    withSchemaValidation(
      {
        body: CommonSchemas.userLogin,
        response: LoginResponseSchema,
      },
      async (req: Request, validated) => {
        await connectDB()

        const { email, password } = validated.body!

        // Rate limiting
        const rateLimitResult = await rateLimiters.auth.check(email)
        if (!rateLimitResult.allowed) {
          throw new AuthenticationError(
            `Too many login attempts. Please try again in ${Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000)} minutes`
          )
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
          throw new AuthenticationError('Invalid email or password')
        }

        // Verify password
        const isValid = await bcryptjs.compare(password, user.password)
        if (!isValid) {
          throw new AuthenticationError('Invalid email or password')
        }

        // Generate JWT
        const token = jwt.sign(
          { userId: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET!,
          { expiresIn: '7d' }
        )

        // Create session
        await Session.create({
          userId: user._id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })

        // Set cookie
        const response = {
          success: true,
          message: 'Login successful',
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.email.split('@')[0],
            role: user.role,
          },
        }

        const headers = new Headers()
        headers.set(
          'Set-Cookie',
          `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`
        )

        return new Response(JSON.stringify(response), {
          status: 200,
          headers,
        })
      }
    )
  )
)

export { handler as POST }
