// Tests for Schema Validation
// Comprehensive testing of request/response validation

import { SchemaValidator, CommonSchemas } from '@/lib/validation/schema-validator'
import { z } from 'zod'

describe('SchemaValidator', () => {
  describe('validateRequest', () => {
    it('should validate valid body data', async () => {
      const schema = {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }),
      }

      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })

      const result = await SchemaValidator.validateRequest(req, schema)

      expect(result.success).toBe(true)
      expect(result.data?.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should return errors for invalid body data', async () => {
      const schema = {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }),
      }

      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'short',
        }),
      })

      const result = await SchemaValidator.validateRequest(req, schema)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })

    it('should validate query parameters', async () => {
      const schema = {
        query: z.object({
          page: z.coerce.number().int().min(1),
          limit: z.coerce.number().int().max(100),
        }),
      }

      const req = new Request('http://localhost/api/test?page=2&limit=20', {
        method: 'GET',
      })

      const result = await SchemaValidator.validateRequest(req, schema)

      expect(result.success).toBe(true)
      expect(result.data?.query).toEqual({
        page: 2,
        limit: 20,
      })
    })

    it('should handle missing query parameters with defaults', async () => {
      const schema = {
        query: z.object({
          page: z.coerce.number().int().default(1),
          limit: z.coerce.number().int().default(20),
        }),
      }

      const req = new Request('http://localhost/api/test', {
        method: 'GET',
      })

      const result = await SchemaValidator.validateRequest(req, schema)

      expect(result.success).toBe(true)
      expect(result.data?.query).toEqual({
        page: 1,
        limit: 20,
      })
    })
  })

  describe('validateResponse', () => {
    it('should validate valid response data', () => {
      const schema = z.object({
        success: z.boolean(),
        data: z.object({
          id: z.string(),
        }),
      })

      const data = {
        success: true,
        data: { id: '123' },
      }

      const result = SchemaValidator.validateResponse(data, schema)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(data)
    })

    it('should return errors for invalid response data', () => {
      const schema = z.object({
        success: z.boolean(),
        data: z.object({
          id: z.string(),
        }),
      })

      const data = {
        success: 'yes', // Should be boolean
        data: { id: 123 }, // Should be string
      }

      const result = SchemaValidator.validateResponse(data, schema)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })
})

describe('CommonSchemas', () => {
  describe('email', () => {
    it('should accept valid email', () => {
      const result = CommonSchemas.email.safeParse('test@example.com')
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = CommonSchemas.email.safeParse('invalid-email')
      expect(result.success).toBe(false)
    })
  })

  describe('password', () => {
    it('should accept strong password', () => {
      const result = CommonSchemas.password.safeParse('StrongPass123')
      expect(result.success).toBe(true)
    })

    it('should reject short password', () => {
      const result = CommonSchemas.password.safeParse('Short1')
      expect(result.success).toBe(false)
    })

    it('should reject password without uppercase', () => {
      const result = CommonSchemas.password.safeParse('password123')
      expect(result.success).toBe(false)
    })

    it('should reject password without lowercase', () => {
      const result = CommonSchemas.password.safeParse('PASSWORD123')
      expect(result.success).toBe(false)
    })

    it('should reject password without number', () => {
      const result = CommonSchemas.password.safeParse('PasswordOnly')
      expect(result.success).toBe(false)
    })
  })

  describe('mongoId', () => {
    it('should accept valid MongoDB ObjectId', () => {
      const result = CommonSchemas.mongoId.safeParse('507f1f77bcf86cd799439011')
      expect(result.success).toBe(true)
    })

    it('should reject invalid ObjectId', () => {
      const result = CommonSchemas.mongoId.safeParse('invalid-id')
      expect(result.success).toBe(false)
    })
  })

  describe('rating', () => {
    it('should accept rating 1-5', () => {
      for (let i = 1; i <= 5; i++) {
        const result = CommonSchemas.rating.safeParse(i)
        expect(result.success).toBe(true)
      }
    })

    it('should reject rating below 1', () => {
      const result = CommonSchemas.rating.safeParse(0)
      expect(result.success).toBe(false)
    })

    it('should reject rating above 5', () => {
      const result = CommonSchemas.rating.safeParse(6)
      expect(result.success).toBe(false)
    })
  })

  describe('pagination', () => {
    it('should apply defaults', () => {
      const result = CommonSchemas.pagination.safeParse({})
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ page: 1, limit: 20 })
    })

    it('should accept custom values', () => {
      const result = CommonSchemas.pagination.safeParse({ page: 5, limit: 50 })
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ page: 5, limit: 50 })
    })

    it('should reject invalid page number', () => {
      const result = CommonSchemas.pagination.safeParse({ page: 0 })
      expect(result.success).toBe(false)
    })

    it('should reject limit above 100', () => {
      const result = CommonSchemas.pagination.safeParse({ limit: 150 })
      expect(result.success).toBe(false)
    })
  })
})
