// OpenAPI Specification API Route

import { NextResponse } from 'next/server'
import { OpenAPIGenerator } from '@/lib/validation/schema-validator'

/**
 * GET /api/openapi
 * Get OpenAPI specification
 */
export async function GET() {
  const spec = OpenAPIGenerator.generateSpec()
  return NextResponse.json(spec)
}
