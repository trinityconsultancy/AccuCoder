import { rateLimiters, getClientIdentifier } from '@/lib/rate-limiter'

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear all rate limiters before each test
    rateLimiters.api.clear()
    rateLimiters.auth.clear()
    rateLimiters.chat.clear()
  })

  describe('API Rate Limiter', () => {
    it('should allow requests within limit', async () => {
      const identifier = 'test-client-1'
      
      for (let i = 0; i < 60; i++) {
        const result = await rateLimiters.api.check(identifier)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(60 - i - 1)
      }
    })

    it('should block requests after limit exceeded', async () => {
      const identifier = 'test-client-2'
      
      // Make 60 requests (the limit)
      for (let i = 0; i < 60; i++) {
        await rateLimiters.api.check(identifier)
      }
      
      // 61st request should be blocked
      const result = await rateLimiters.api.check(identifier)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.resetAt).toBeGreaterThan(Date.now())
    })

    it('should reset after window expires', async () => {
      const identifier = 'test-client-3'
      
      // Mock Date.now to control time
      const originalNow = Date.now
      let mockTime = originalNow()
      
      jest.spyOn(Date, 'now').mockImplementation(() => mockTime)
      
      // Make max requests
      for (let i = 0; i < 60; i++) {
        await rateLimiters.api.check(identifier)
      }
      
      // Should be blocked
      let result = await rateLimiters.api.check(identifier)
      expect(result.allowed).toBe(false)
      
      // Move time forward past the window
      mockTime += 61 * 1000 // 61 seconds
      
      // Should be allowed again
      result = await rateLimiters.api.check(identifier)
      expect(result.allowed).toBe(true)
      
      // Restore original Date.now
      jest.spyOn(Date, 'now').mockRestore()
    })
  })

  describe('Auth Rate Limiter', () => {
    it('should have stricter limits for auth endpoints', async () => {
      const identifier = 'test-auth-1'
      
      // Auth limiter allows only 5 requests per 15 minutes
      for (let i = 0; i < 5; i++) {
        const result = await rateLimiters.auth.check(identifier)
        expect(result.allowed).toBe(true)
      }
      
      // 6th request should be blocked
      const result = await rateLimiters.auth.check(identifier)
      expect(result.allowed).toBe(false)
    })
  })

  describe('getClientIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const req = new Request('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
          'user-agent': 'test-agent'
        }
      })
      
      const identifier = getClientIdentifier(req)
      expect(identifier).toContain('192.168.1.1')
      expect(identifier).toContain('test-agent')
    })

    it('should fall back to x-real-ip if x-forwarded-for not present', () => {
      const req = new Request('http://localhost:3000', {
        headers: {
          'x-real-ip': '192.168.1.2',
          'user-agent': 'test-agent'
        }
      })
      
      const identifier = getClientIdentifier(req)
      expect(identifier).toContain('192.168.1.2')
    })

    it('should handle missing headers gracefully', () => {
      const req = new Request('http://localhost:3000')
      
      const identifier = getClientIdentifier(req)
      expect(identifier).toContain('unknown')
    })
  })
})
