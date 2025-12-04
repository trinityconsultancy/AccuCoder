// Admin Authentication Middleware
// Protect admin routes with role-based access control (RBAC)

import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { AuthorizationError } from '@/lib/api-error-handler'
import { logger } from '@/lib/middleware/request-logger'

export interface AdminAuthOptions {
  allowedRoles?: string[]
  requireEmailVerification?: boolean
}

const DEFAULT_OPTIONS: AdminAuthOptions = {
  allowedRoles: ['admin'],
  requireEmailVerification: true,
}

/**
 * Admin authentication middleware
 * Verifies JWT token and checks for admin role
 * 
 * @param request - Incoming request
 * @param options - Authentication options
 * @returns Decoded token payload with user info
 * @throws AuthorizationError if unauthorized
 */
export async function requireAdmin(
  request: Request,
  options: AdminAuthOptions = {}
): Promise<{ userId: string; email: string; role: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Extract token from Authorization header or cookies
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
    logger.warn('Admin authentication failed: No token provided', {
      path: new URL(request.url).pathname,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    })
    throw new AuthorizationError('Admin authentication required')
  }

  // Verify token
  let decoded: { userId: string; email: string; role: string; emailVerified?: boolean } | null = null
  
  try {
    decoded = verifyToken(token)
  } catch (error) {
    logger.warn('Admin authentication failed: Invalid token', {
      path: new URL(request.url).pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw new AuthorizationError('Invalid authentication token')
  }

  if (!decoded) {
    throw new AuthorizationError('Invalid authentication token')
  }

  // Check role
  if (!opts.allowedRoles?.includes(decoded.role)) {
    logger.warn('Admin authorization failed: Insufficient permissions', {
      path: new URL(request.url).pathname,
      userId: decoded.userId,
      userRole: decoded.role,
      requiredRoles: opts.allowedRoles,
    })
    throw new AuthorizationError('Admin access required')
  }

  // Check email verification if required
  if (opts.requireEmailVerification && !decoded.emailVerified) {
    logger.warn('Admin authorization failed: Email not verified', {
      path: new URL(request.url).pathname,
      userId: decoded.userId,
      email: decoded.email,
    })
    throw new AuthorizationError('Email verification required')
  }

  // Log successful admin access
  logger.info('Admin access granted', {
    path: new URL(request.url).pathname,
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  })

  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  }
}

/**
 * Check if user has admin role
 * 
 * @param request - Incoming request
 * @returns True if user is admin, false otherwise
 */
export async function isAdmin(request: Request): Promise<boolean> {
  try {
    await requireAdmin(request)
    return true
  } catch {
    return false
  }
}

/**
 * Admin authentication middleware for Next.js route handlers
 * Use as a wrapper for admin API routes
 * 
 * @param handler - Route handler function
 * @param options - Authentication options
 * @returns Wrapped handler with admin authentication
 */
export function withAdminAuth(
  handler: (
    request: Request,
    context: { params: any; admin: { userId: string; email: string; role: string } }
  ) => Promise<NextResponse>,
  options: AdminAuthOptions = {}
) {
  return async (request: Request, context: { params: any }) => {
    try {
      const admin = await requireAdmin(request, options)
      return handler(request, { ...context, admin })
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'AUTHORIZATION_ERROR',
              message: error.message,
            },
          },
          { status: 403 }
        )
      }
      throw error
    }
  }
}
