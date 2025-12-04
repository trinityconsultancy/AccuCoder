// Advanced Request Logging and Monitoring Middleware
// Enterprise-grade logging with correlation IDs, performance tracking, and structured logging

import { NextRequest, NextResponse } from 'next/server'

export interface RequestMetadata {
  requestId: string
  timestamp: string
  method: string
  path: string
  query: Record<string, string>
  userAgent: string
  ip: string
  userId?: string
  duration?: number
  statusCode?: number
  error?: string
}

export interface PerformanceMetrics {
  requestId: string
  endpoint: string
  duration: number
  timestamp: string
  statusCode: number
  method: string
}

class Logger {
  private static instance: Logger
  private metrics: PerformanceMetrics[] = []
  private readonly MAX_METRICS = 1000

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatLog(level: string, message: string, metadata?: any): string {
    const timestamp = new Date().toISOString()
    const logEntry = {
      level,
      timestamp,
      message,
      ...metadata,
    }
    return JSON.stringify(logEntry)
  }

  info(message: string, metadata?: any) {
    console.log(this.formatLog('INFO', message, metadata))
  }

  warn(message: string, metadata?: any) {
    console.warn(this.formatLog('WARN', message, metadata))
  }

  error(message: string, error?: any, metadata?: any) {
    console.error(
      this.formatLog('ERROR', message, {
        ...metadata,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : error,
      })
    )
  }

  debug(message: string, metadata?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog('DEBUG', message, metadata))
    }
  }

  logRequest(metadata: RequestMetadata) {
    this.info('HTTP Request', metadata)
  }

  logResponse(metadata: RequestMetadata) {
    this.info('HTTP Response', metadata)
  }

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric)
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift() // Keep only last 1000 metrics
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = endpoint
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics

    if (relevantMetrics.length === 0) return 0

    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0)
    return Math.round(total / relevantMetrics.length)
  }

  getSlowRequests(thresholdMs: number = 1000): PerformanceMetrics[] {
    return this.metrics.filter(m => m.duration > thresholdMs)
  }
}

export const logger = Logger.getInstance()

// Generate unique request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Extract client IP from request
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfConnectingIp = req.headers.get('cf-connecting-ip')
  
  return forwarded?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown'
}

// Request logging middleware
export function withRequestLogging(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const startTime = Date.now()
    const requestId = generateRequestId()
    const url = new URL(req.url)

    // Prepare request metadata
    const requestMetadata: RequestMetadata = {
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      userAgent: req.headers.get('user-agent') || 'unknown',
      ip: getClientIp(req),
    }

    // Log incoming request
    logger.logRequest(requestMetadata)

    try {
      // Execute handler
      const response = await handler(req)
      
      // Calculate duration
      const duration = Date.now() - startTime
      
      // Add request ID to response headers
      const headers = new Headers(response.headers)
      headers.set('X-Request-ID', requestId)
      headers.set('X-Response-Time', `${duration}ms`)

      // Log response
      const responseMetadata: RequestMetadata = {
        ...requestMetadata,
        duration,
        statusCode: response.status,
      }
      logger.logResponse(responseMetadata)

      // Store performance metric
      logger.addMetric({
        requestId,
        endpoint: url.pathname,
        duration,
        timestamp: new Date().toISOString(),
        statusCode: response.status,
        method: req.method,
      })

      // Warn about slow requests
      if (duration > 1000) {
        logger.warn('Slow request detected', {
          requestId,
          endpoint: url.pathname,
          duration,
        })
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Log error
      logger.error('Request failed', error, {
        ...requestMetadata,
        duration,
      })

      throw error
    }
  }
}

// Combine with existing error handler
export function withLoggingAndErrorHandling(
  handler: (req: NextRequest) => Promise<Response>
) {
  return withRequestLogging(handler)
}

// Request context for passing data through middleware chain
export class RequestContext {
  private static contexts = new Map<string, any>()

  static set(requestId: string, key: string, value: any) {
    if (!this.contexts.has(requestId)) {
      this.contexts.set(requestId, {})
    }
    this.contexts.get(requestId)[key] = value
  }

  static get(requestId: string, key: string): any {
    return this.contexts.get(requestId)?.[key]
  }

  static clear(requestId: string) {
    this.contexts.delete(requestId)
  }

  static cleanup() {
    // Clean up old contexts (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    for (const [requestId] of this.contexts) {
      const timestamp = parseInt(requestId.split('_')[1])
      if (timestamp < oneHourAgo) {
        this.contexts.delete(requestId)
      }
    }
  }
}

// Auto-cleanup every 30 minutes
if (typeof window === 'undefined') {
  setInterval(() => RequestContext.cleanup(), 30 * 60 * 1000)
}
