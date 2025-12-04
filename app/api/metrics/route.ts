// System Metrics API Route

import { NextResponse } from 'next/server'
import { MetricsService } from '@/lib/monitoring/health-check'
import { logger } from '@/lib/middleware/request-logger'

/**
 * GET /api/metrics
 * Get system metrics in JSON format
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const format = url.searchParams.get('format')

    if (format === 'prometheus') {
      const metrics = await MetricsService.getPrometheusMetrics()
      return new Response(metrics, {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4',
        },
      })
    }

    const metrics = await MetricsService.getMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    logger.error('Metrics endpoint error', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve metrics',
      },
      { status: 500 }
    )
  }
}
