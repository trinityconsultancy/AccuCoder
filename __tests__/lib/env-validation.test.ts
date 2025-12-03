import { validateEnv, getEnv } from '@/lib/env-validation'

describe('Environment Validation', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset modules and environment before each test
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should validate correct environment variables', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb'
    process.env.JWT_SECRET = 'a'.repeat(32) // 32 characters
    process.env.BREVO_API_KEY = 'test-brevo-key'
    process.env.GROQ_API_KEY = 'test-groq-key'
    process.env.NODE_ENV = 'development'

    expect(() => validateEnv()).not.toThrow()
    
    const env = getEnv()
    expect(env.MONGODB_URI).toBe('mongodb://localhost:27017/testdb')
    expect(env.JWT_SECRET).toHaveLength(32)
    expect(env.BREVO_API_KEY).toBe('test-brevo-key')
    expect(env.GROQ_API_KEY).toBe('test-groq-key')
  })

  it('should throw error for missing MONGODB_URI', () => {
    delete process.env.MONGODB_URI
    process.env.JWT_SECRET = 'a'.repeat(32)
    process.env.BREVO_API_KEY = 'test-brevo-key'
    process.env.GROQ_API_KEY = 'test-groq-key'

    expect(() => validateEnv()).toThrow('MONGODB_URI')
  })

  it('should throw error for invalid MONGODB_URI format', () => {
    process.env.MONGODB_URI = 'not-a-valid-url'
    process.env.JWT_SECRET = 'a'.repeat(32)
    process.env.BREVO_API_KEY = 'test-brevo-key'
    process.env.GROQ_API_KEY = 'test-groq-key'

    expect(() => validateEnv()).toThrow()
  })

  it('should throw error for short JWT_SECRET', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb'
    process.env.JWT_SECRET = 'short' // Less than 32 characters
    process.env.BREVO_API_KEY = 'test-brevo-key'
    process.env.GROQ_API_KEY = 'test-groq-key'

    expect(() => validateEnv()).toThrow('JWT_SECRET')
    expect(() => validateEnv()).toThrow('at least 32 characters')
  })

  it('should throw error for missing BREVO_API_KEY', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb'
    process.env.JWT_SECRET = 'a'.repeat(32)
    delete process.env.BREVO_API_KEY
    process.env.GROQ_API_KEY = 'test-groq-key'

    expect(() => validateEnv()).toThrow('BREVO_API_KEY')
  })

  it('should throw error for missing GROQ_API_KEY', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb'
    process.env.JWT_SECRET = 'a'.repeat(32)
    process.env.BREVO_API_KEY = 'test-brevo-key'
    delete process.env.GROQ_API_KEY

    expect(() => validateEnv()).toThrow('GROQ_API_KEY')
  })

  it('should accept optional environment variables', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb'
    process.env.JWT_SECRET = 'a'.repeat(32)
    process.env.BREVO_API_KEY = 'test-brevo-key'
    process.env.GROQ_API_KEY = 'test-groq-key'
    process.env.BREVO_FROM_EMAIL = 'test@example.com'
    process.env.BREVO_FROM_NAME = 'Test Sender'
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token'
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

    const env = validateEnv()
    
    expect(env.BREVO_FROM_EMAIL).toBe('test@example.com')
    expect(env.BREVO_FROM_NAME).toBe('Test Sender')
    expect(env.UPSTASH_REDIS_REST_URL).toBe('https://redis.upstash.io')
    expect(env.NEXT_PUBLIC_APP_URL).toBe('https://example.com')
  })

  it('should validate NODE_ENV enum', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb'
    process.env.JWT_SECRET = 'a'.repeat(32)
    process.env.BREVO_API_KEY = 'test-brevo-key'
    process.env.GROQ_API_KEY = 'test-groq-key'
    process.env.NODE_ENV = 'invalid-env'

    expect(() => validateEnv()).toThrow()
  })

  it('should default NODE_ENV to development', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb'
    process.env.JWT_SECRET = 'a'.repeat(32)
    process.env.BREVO_API_KEY = 'test-brevo-key'
    process.env.GROQ_API_KEY = 'test-groq-key'
    delete process.env.NODE_ENV

    const env = validateEnv()
    expect(env.NODE_ENV).toBe('development')
  })

  it('should cache validated environment', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb'
    process.env.JWT_SECRET = 'a'.repeat(32)
    process.env.BREVO_API_KEY = 'test-brevo-key'
    process.env.GROQ_API_KEY = 'test-groq-key'

    const env1 = getEnv()
    const env2 = getEnv()
    
    expect(env1).toBe(env2) // Same reference
  })
})
