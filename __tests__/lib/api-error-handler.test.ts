import { 
  ApiError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  formatErrorResponse,
  handleMongoError
} from '@/lib/api-error-handler'

describe('API Error Handler', () => {
  describe('Error Classes', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError(500, 'Test error', 'TEST_CODE', { detail: 'test' })
      
      expect(error.statusCode).toBe(500)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_CODE')
      expect(error.details).toEqual({ detail: 'test' })
      expect(error.name).toBe('ApiError')
    })

    it('should create ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input')
      
      expect(error.statusCode).toBe(400)
      expect(error.message).toBe('Invalid input')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.name).toBe('ValidationError')
    })

    it('should create AuthenticationError with 401 status', () => {
      const error = new AuthenticationError()
      
      expect(error.statusCode).toBe(401)
      expect(error.message).toBe('Authentication required')
      expect(error.code).toBe('AUTHENTICATION_ERROR')
    })

    it('should create AuthorizationError with 403 status', () => {
      const error = new AuthorizationError()
      
      expect(error.statusCode).toBe(403)
      expect(error.message).toBe('Insufficient permissions')
      expect(error.code).toBe('AUTHORIZATION_ERROR')
    })

    it('should create NotFoundError with 404 status', () => {
      const error = new NotFoundError('User')
      
      expect(error.statusCode).toBe(404)
      expect(error.message).toBe('User not found')
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should create ConflictError with 409 status', () => {
      const error = new ConflictError('Email already exists')
      
      expect(error.statusCode).toBe(409)
      expect(error.message).toBe('Email already exists')
      expect(error.code).toBe('CONFLICT_ERROR')
    })

    it('should create RateLimitError with 429 status', () => {
      const error = new RateLimitError()
      
      expect(error.statusCode).toBe(429)
      expect(error.message).toBe('Too many requests')
      expect(error.code).toBe('RATE_LIMIT_ERROR')
    })
  })

  describe('formatErrorResponse', () => {
    it('should format ApiError correctly', () => {
      const error = new ValidationError('Test validation error', { field: 'email' })
      const response = formatErrorResponse(error, '/api/test')
      
      expect(response.error).toBe('Test validation error')
      expect(response.code).toBe('VALIDATION_ERROR')
      expect(response.details).toEqual({ field: 'email' })
      expect(response.path).toBe('/api/test')
      expect(response.timestamp).toBeDefined()
    })

    it('should format generic Error in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      const error = new Error('Internal error details')
      const response = formatErrorResponse(error)
      
      expect(response.error).toBe('An unexpected error occurred')
      expect(response.code).toBe('INTERNAL_ERROR')
      
      process.env.NODE_ENV = originalEnv
    })

    it('should format generic Error in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const error = new Error('Internal error details')
      const response = formatErrorResponse(error)
      
      expect(response.error).toBe('Internal error details')
      expect(response.code).toBe('INTERNAL_ERROR')
      
      process.env.NODE_ENV = originalEnv
    })

    it('should handle unknown error types', () => {
      const error = 'string error'
      const response = formatErrorResponse(error)
      
      expect(response.error).toBe('An unknown error occurred')
      expect(response.code).toBe('UNKNOWN_ERROR')
    })
  })

  describe('handleMongoError', () => {
    it('should handle duplicate key error (11000)', () => {
      const mongoError = {
        code: 11000,
        keyPattern: { email: 1 }
      }
      
      const error = handleMongoError(mongoError)
      
      expect(error).toBeInstanceOf(ConflictError)
      expect(error.message).toBe('email already exists')
      expect(error.statusCode).toBe(409)
    })

    it('should handle validation error', () => {
      const mongoError = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password is required' }
        }
      }
      
      const error = handleMongoError(mongoError)
      
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.message).toContain('Email is required')
      expect(error.message).toContain('Password is required')
    })

    it('should handle cast error', () => {
      const mongoError = {
        name: 'CastError',
        path: '_id',
        value: 'invalid-id'
      }
      
      const error = handleMongoError(mongoError)
      
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.message).toBe('Invalid _id: invalid-id')
    })

    it('should return generic database error for unknown errors', () => {
      const mongoError = {
        name: 'UnknownMongoError',
        message: 'Something went wrong'
      }
      
      const error = handleMongoError(mongoError)
      
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('DATABASE_ERROR')
    })
  })
})
