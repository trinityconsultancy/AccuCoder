// Health Check and Metrics API Routes

import { NextRequest, NextResponse } from 'next/server'
import { HealthCheckService, MetricsService } from '@/lib/monitoring/health-check'
import { logger } from '@/lib/middleware/request-logger'

/**
 * GET /api/health
 * Complete health check with all components
 */
export async function GET() {
  try {
    const health = await HealthCheckService.check()

    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 503 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    logger.error('Health check endpoint error', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    )
  }
}
