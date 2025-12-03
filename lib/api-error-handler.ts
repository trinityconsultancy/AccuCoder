// Advanced API Error Handler with Type Safety and Logging

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(400, message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests') {
    super(429, message, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

interface ErrorResponse {
  error: string
  code?: string
  details?: unknown
  timestamp: string
  path?: string
}

export function formatErrorResponse(error: unknown, path?: string): ErrorResponse {
  const timestamp = new Date().toISOString()

  if (error instanceof ApiError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp,
      path,
    }
  }

  if (error instanceof Error) {
    // Log unexpected errors in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Unexpected error:', {
        message: error.message,
        stack: error.stack,
        timestamp,
        path,
      })
    }

    return {
      error: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      code: 'INTERNAL_ERROR',
      timestamp,
      path,
    }
  }

  return {
    error: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp,
    path,
  }
}

type ApiHandler = (req: Request) => Promise<Response>

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: Request) => {
    try {
      return await handler(req)
    } catch (error) {
      const url = new URL(req.url)
      const errorResponse = formatErrorResponse(error, url.pathname)
      
      const statusCode = error instanceof ApiError ? error.statusCode : 500

      return Response.json(errorResponse, { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
        }
      })
    }
  }
}

// MongoDB-specific error handler
export function handleMongoError(error: any): ApiError {
  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0]
    return new ConflictError(
      field ? `${field} already exists` : 'Duplicate entry'
    )
  }

  // Validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors || {})
      .map((err: any) => err.message)
      .join(', ')
    return new ValidationError(messages)
  }

  // Cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return new ValidationError(`Invalid ${error.path}: ${error.value}`)
  }

  return new ApiError(500, 'Database error', 'DATABASE_ERROR')
}

// Async handler wrapper with MongoDB error handling
export function asyncHandler(handler: ApiHandler): ApiHandler {
  return withErrorHandler(async (req: Request) => {
    try {
      return await handler(req)
    } catch (error: any) {
      // Transform MongoDB errors
      if (error.name?.includes('Mongo') || error.code === 11000) {
        throw handleMongoError(error)
      }
      throw error
    }
  })
}
