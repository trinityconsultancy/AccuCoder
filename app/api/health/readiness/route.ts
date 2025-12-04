// Readiness Probe API Route
// Kubernetes-compatible endpoint

import { NextResponse } from 'next/server'
import { HealthCheckService } from '@/lib/monitoring/health-check'

/**
 * GET /api/health/readiness
 * Readiness probe - checks if the service is ready to accept traffic
 */
export async function GET() {
  const result = await HealthCheckService.readiness()
  const statusCode = result.ready ? 200 : 503
  return NextResponse.json(result, { status: statusCode })
}
