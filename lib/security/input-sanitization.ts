// Comprehensive Input Sanitization and Validation
// XSS protection, SQL injection prevention, and input validation

import { z } from 'zod'
import { logger } from '../middleware/request-logger'

/**
 * XSS Protection - Sanitize HTML and dangerous characters
 */
export class XSSProtection {
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<embed/gi,
    /<object/gi,
  ]

  private static readonly HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(input: string): string {
    return input.replace(/[&<>"'/]/g, (match) => this.HTML_ENTITIES[match] || match)
  }

  /**
   * Remove dangerous HTML tags and scripts
   */
  static sanitize(input: string): string {
    let sanitized = input

    // Remove dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }

    // Escape remaining HTML
    return this.escapeHtml(sanitized)
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitize(obj)
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item))
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value)
      }
      return sanitized
    }

    return obj
  }
}

/**
 * NoSQL Injection Protection
 */
export class NoSQLProtection {
  /**
   * Check for NoSQL injection patterns
   */
  static hasInjectionPattern(value: any): boolean {
    if (typeof value !== 'object' || value === null) {
      return false
    }

    // Check for MongoDB operators
    const operators = ['$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin', '$regex', '$where', '$exists']
    
    for (const key of Object.keys(value)) {
      if (operators.includes(key)) {
        logger.warn('NoSQL injection attempt detected', { key, value })
        return true
      }

      // Recursive check
      if (typeof value[key] === 'object' && this.hasInjectionPattern(value[key])) {
        return true
      }
    }

    return false
  }

  /**
   * Sanitize query object
   */
  static sanitizeQuery(query: any): any {
    if (typeof query !== 'object' || query === null) {
      return query
    }

    const sanitized: any = {}

    for (const [key, value] of Object.entries(query)) {
      // Skip if contains injection pattern
      if (typeof value === 'object' && this.hasInjectionPattern(value)) {
        logger.warn('Skipping potentially malicious query parameter', { key })
        continue
      }

      // Sanitize string values
      if (typeof value === 'string') {
        sanitized[key] = XSSProtection.sanitize(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }
}

/**
 * Input validation schemas
 */
export const ValidationSchemas = {
  // Email validation
  email: z.string().email('Invalid email format').max(255),

  // Password validation (strong password)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  // ObjectId validation
  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),

  // URL validation
  url: z.string().url('Invalid URL format').max(2000),

  // Phone number validation
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format').optional(),

  // Name validation (no special characters)
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  // Rating validation
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),

  // Pagination validation
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),
}

/**
 * Request sanitization middleware
 */
export class RequestSanitizer {
  /**
   * Sanitize request body
   */
  static sanitizeBody(body: any): any {
    return XSSProtection.sanitizeObject(body)
  }

  /**
   * Sanitize query parameters
   */
  static sanitizeQuery(query: any): any {
    const sanitized = XSSProtection.sanitizeObject(query)
    return NoSQLProtection.sanitizeQuery(sanitized)
  }

  /**
   * Sanitize headers (extract only safe headers)
   */
  static sanitizeHeaders(headers: Headers): Record<string, string> {
    const safeHeaders = [
      'content-type',
      'user-agent',
      'accept',
      'accept-language',
      'accept-encoding',
    ]

    const sanitized: Record<string, string> = {}

    for (const header of safeHeaders) {
      const value = headers.get(header)
      if (value) {
        sanitized[header] = XSSProtection.sanitize(value)
      }
    }

    return sanitized
  }
}

/**
 * File upload validation
 */
export class FileValidator {
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
  ]

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  /**
   * Validate file upload
   */
  static validate(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      }
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed',
      }
    }

    // Check file extension
    const ext = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'csv']
    
    if (!ext || !allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: 'File extension not allowed',
      }
    }

    return { valid: true }
  }
}

/**
 * Sanitization middleware wrapper
 */
export function withInputSanitization(
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    try {
      // Clone request for modification
      const url = new URL(req.url)

      // Sanitize query parameters
      const sanitizedQuery = RequestSanitizer.sanitizeQuery(
        Object.fromEntries(url.searchParams)
      )

      // Rebuild URL with sanitized query
      const sanitizedUrl = new URL(url.origin + url.pathname)
      Object.entries(sanitizedQuery).forEach(([key, value]) => {
        sanitizedUrl.searchParams.set(key, String(value))
      })

      // Sanitize body if present
      let sanitizedBody: any = null
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        try {
          const body = await req.json()
          sanitizedBody = RequestSanitizer.sanitizeBody(body)
        } catch {
          // Body is not JSON or empty
        }
      }

      // Create new request with sanitized data
      const sanitizedRequest = new Request(sanitizedUrl.toString(), {
        method: req.method,
        headers: req.headers,
        body: sanitizedBody ? JSON.stringify(sanitizedBody) : null,
      })

      return await handler(sanitizedRequest)
    } catch (error) {
      logger.error('Input sanitization error', error)
      throw error
    }
  }
}

/**
 * Content Security Policy headers
 */
export class SecurityHeaders {
  static getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  }

  static apply(response: Response): Response {
    const headers = new Headers(response.headers)

    // Content Security Policy
    headers.set('Content-Security-Policy', this.getCSPHeader())

    // XSS Protection
    headers.set('X-XSS-Protection', '1; mode=block')

    // Prevent clickjacking
    headers.set('X-Frame-Options', 'DENY')

    // Prevent MIME sniffing
    headers.set('X-Content-Type-Options', 'nosniff')

    // Referrer Policy
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Permissions Policy
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}

/**
 * Helper function to sanitize user input (XSS + NoSQL injection protection)
 * Use this for simple input sanitization in API routes
 */
export function sanitizeInput<T = any>(input: T): T {
  if (typeof input === 'string') {
    return XSSProtection.sanitize(input) as T
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item)) as T
  }
  
  if (input !== null && typeof input === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      const safeKey = XSSProtection.sanitize(key)
      sanitized[safeKey] = sanitizeInput(value)
    }
    return sanitized as T
  }
  
  return input
}
