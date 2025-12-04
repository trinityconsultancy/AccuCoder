// Next.js Edge Middleware
// Rate limiting and CORS protection for API routes

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limit configuration per endpoint
const RATE_LIMITS = {
  '/api/auth/signup': { max: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 min
  '/api/auth/login': { max: 10, windowMs: 15 * 60 * 1000 }, // 10 requests per 15 min
  '/api/auth/login-v2': { max: 10, windowMs: 15 * 60 * 1000 }, // 10 requests per 15 min
  '/api/reviews': { max: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour (POST only)
  '/api/chat': { max: 20, windowMs: 60 * 60 * 1000 }, // 20 requests per hour
  '/api/drugs': { max: 100, windowMs: 60 * 1000 }, // 100 requests per minute
} as const

// CORS allowed origins
const ALLOWED_ORIGINS = [
  'https://accucoder.app',
  'https://www.accucoder.app',
  ...(process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://127.0.0.1:3000'] 
    : []
  ),
]

// In-memory rate limit store (consider Redis for production with multiple instances)
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function getRateLimitKey(request: NextRequest, path: string): string {
  // Use IP address as identifier (NextRequest doesn't have .ip property)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 
    request.headers.get('x-real-ip') ?? 
    'unknown'
  
  return `${path}:${ip}`
}

function checkRateLimit(key: string, max: number, windowMs: number): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // Create new entry
    const resetAt = now + windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: max - 1, resetAt }
  }

  if (entry.count >= max) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt }
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')

  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()

    // Check origin
    if (origin) {
      if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV === 'development') {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      } else {
        // Blocked origin
        return new NextResponse('Forbidden', { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        })
      }
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // Apply rate limiting
    for (const [path, config] of Object.entries(RATE_LIMITS)) {
      if (pathname === path || pathname.startsWith(path + '/')) {
        // For /api/reviews, only rate limit POST requests
        if (path === '/api/reviews' && request.method !== 'POST') {
          continue
        }

        const key = getRateLimitKey(request, path)
        const result = checkRateLimit(key, config.max, config.windowMs)

        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', config.max.toString())
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
        response.headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString())

        if (!result.allowed) {
          const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
          return new NextResponse(
            JSON.stringify({
              error: 'Too many requests',
              message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
              retryAfter,
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': config.max.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
              },
            }
          )
        }

        break // Only apply one rate limit per request
      }
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
