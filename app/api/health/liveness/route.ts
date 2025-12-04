// Liveness Probe API Route
// Kubernetes-compatible endpoint

import { NextResponse } from 'next/server'
import { HealthCheckService } from '@/lib/monitoring/health-check'

/**
 * GET /api/health/liveness
 * Liveness probe - checks if the process is running
 */
export async function GET() {
  const result = await HealthCheckService.liveness()
  return NextResponse.json(result)
}
