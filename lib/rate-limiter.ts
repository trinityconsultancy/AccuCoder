// Advanced In-Memory Rate Limiter with Sliding Window Algorithm
// No external dependencies required - production ready

interface RateLimitEntry {
  timestamps: number[]
  blockUntil?: number
}

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  blockDuration?: number // Duration to block after limit exceeded (ms)
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(private config: RateLimitConfig) {
    // Cleanup old entries every minute
    this.startCleanup()
  }

  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      const cutoff = now - this.config.windowMs

      for (const [key, entry] of this.store.entries()) {
        // Remove timestamps outside the window
        entry.timestamps = entry.timestamps.filter(ts => ts > cutoff)
        
        // Remove entry if no timestamps and not blocked
        if (entry.timestamps.length === 0 && (!entry.blockUntil || entry.blockUntil < now)) {
          this.store.delete(key)
        }
      }
    }, 60000) // Run every minute

    // Ensure cleanup stops when process exits
    if (typeof process !== 'undefined') {
      process.on('exit', () => this.stopCleanup())
    }
  }

  private stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  async check(identifier: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    let entry = this.store.get(identifier)

    if (!entry) {
      entry = { timestamps: [] }
      this.store.set(identifier, entry)
    }

    // Check if currently blocked
    if (entry.blockUntil && entry.blockUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockUntil,
      }
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter(ts => ts > windowStart)

    // Check if limit exceeded
    if (entry.timestamps.length >= this.config.maxRequests) {
      const blockDuration = this.config.blockDuration || this.config.windowMs
      entry.blockUntil = now + blockDuration

      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockUntil,
      }
    }

    // Add current timestamp
    entry.timestamps.push(now)

    const remaining = this.config.maxRequests - entry.timestamps.length
    const oldestTimestamp = entry.timestamps[0] || now
    const resetAt = oldestTimestamp + this.config.windowMs

    return {
      allowed: true,
      remaining,
      resetAt,
    }
  }

  reset(identifier: string) {
    this.store.delete(identifier)
  }

  clear() {
    this.store.clear()
  }

  getStats() {
    return {
      totalKeys: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        requestCount: entry.timestamps.length,
        blocked: entry.blockUntil ? entry.blockUntil > Date.now() : false,
      })),
    }
  }
}

// Rate limit configurations for different endpoints
export const rateLimiters = {
  // Strict limits for authentication endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
    blockDuration: 60 * 60 * 1000, // Block for 1 hour after limit
  }),

  // Medium limits for API endpoints
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    blockDuration: 5 * 60 * 1000, // Block for 5 minutes
  }),

  // Lenient limits for chat/AI endpoints (they're slower)
  chat: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    blockDuration: 2 * 60 * 1000, // Block for 2 minutes
  }),

  // Very strict for email operations
  email: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 emails per hour
    blockDuration: 24 * 60 * 60 * 1000, // Block for 24 hours
  }),
}

// Helper to get client identifier from request
export function getClientIdentifier(req: Request): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfConnectingIp = req.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown'
  
  // Optionally include user agent for better tracking
  const userAgent = req.headers.get('user-agent') || 'unknown'
  
  return `${ip}:${userAgent.slice(0, 50)}`
}

// Middleware wrapper for rate limiting
export async function withRateLimit(
  req: Request,
  limiter: RateLimiter = rateLimiters.api
): Promise<Response | null> {
  const identifier = getClientIdentifier(req)
  const result = await limiter.check(identifier)

  if (!result.allowed) {
    const resetDate = new Date(result.resetAt)
    
    return Response.json(
      {
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'You have exceeded the rate limit. Please try again later.',
        resetAt: resetDate.toISOString(),
        timestamp: new Date().toISOString(),
      },
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetDate.toISOString(),
        },
      }
    )
  }

  // Add rate limit headers to all responses (will be added by caller)
  return null // null means allowed, caller should add headers
}

// Helper to add rate limit headers to response
export function addRateLimitHeaders(
  response: Response,
  limiter: RateLimiter,
  result: { remaining: number; resetAt: number }
): Response {
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Limit', limiter['config'].maxRequests.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString())

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
