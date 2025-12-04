// API Request/Response Schema Validation
// OpenAPI-compatible validation system with Zod

import { z } from 'zod'
import { NextResponse } from 'next/server'
import { logger } from '../middleware/request-logger'
import { ValidationError } from '../api-error-handler'

/**
 * API endpoint schema definition
 */
export interface EndpointSchema<
  TBody = any,
  TQuery = any,
  TParams = any,
  TResponse = any
> {
  body?: z.ZodType<TBody>
  query?: z.ZodType<TQuery>
  params?: z.ZodType<TParams>
  response?: z.ZodType<TResponse>
}

/**
 * Validated request data
 */
export interface ValidatedRequest<TBody = any, TQuery = any, TParams = any> {
  body?: TBody
  query?: TQuery
  params?: TParams
}

/**
 * Validation result
 */
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: Array<{
    field: string
    message: string
  }>
}

/**
 * API Schema Validator
 */
export class SchemaValidator {
  /**
   * Validate request against schema
   */
  static async validateRequest<TBody = any, TQuery = any, TParams = any>(
    req: Request,
    schema: EndpointSchema<TBody, TQuery, TParams>
  ): Promise<ValidationResult<ValidatedRequest<TBody, TQuery, TParams>>> {
    const errors: Array<{ field: string; message: string }> = []
    const validated: ValidatedRequest<TBody, TQuery, TParams> = {}

    try {
      // Validate body
      if (schema.body && req.method !== 'GET' && req.method !== 'HEAD') {
        try {
          const bodyText = await req.text()
          const body = bodyText ? JSON.parse(bodyText) : undefined

          const result = schema.body.safeParse(body)
          if (!result.success) {
            result.error.errors.forEach((err) => {
              errors.push({
                field: err.path.join('.') || 'body',
                message: err.message,
              })
            })
          } else {
            validated.body = result.data
          }
        } catch (error) {
          errors.push({
            field: 'body',
            message: 'Invalid JSON in request body',
          })
        }
      }

      // Validate query parameters
      if (schema.query) {
        const url = new URL(req.url)
        const query = Object.fromEntries(url.searchParams)

        const result = schema.query.safeParse(query)
        if (!result.success) {
          result.error.errors.forEach((err) => {
            errors.push({
              field: `query.${err.path.join('.')}`,
              message: err.message,
            })
          })
        } else {
          validated.query = result.data
        }
      }

      // Validate path parameters (extracted from URL pattern)
      if (schema.params) {
        // Note: Path params would be extracted by Next.js routing
        // This is a placeholder for demonstration
        const result = schema.params.safeParse({})
        if (!result.success) {
          result.error.errors.forEach((err) => {
            errors.push({
              field: `params.${err.path.join('.')}`,
              message: err.message,
            })
          })
        } else {
          validated.params = result.data
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors,
        }
      }

      return {
        success: true,
        data: validated,
      }
    } catch (error) {
      logger.error('Schema validation error', error)
      return {
        success: false,
        errors: [
          {
            field: 'unknown',
            message: error instanceof Error ? error.message : 'Validation failed',
          },
        ],
      }
    }
  }

  /**
   * Validate response against schema
   */
  static validateResponse<TResponse>(
    data: any,
    schema: z.ZodType<TResponse>
  ): ValidationResult<TResponse> {
    const result = schema.safeParse(data)

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.') || 'response',
        message: err.message,
      }))

      return {
        success: false,
        errors,
      }
    }

    return {
      success: true,
      data: result.data,
    }
  }
}

/**
 * Validated endpoint handler wrapper
 */
export function withSchemaValidation<TBody = any, TQuery = any, TParams = any, TResponse = any>(
  schema: EndpointSchema<TBody, TQuery, TParams, TResponse>,
  handler: (
    req: Request,
    validated: ValidatedRequest<TBody, TQuery, TParams>
  ) => Promise<TResponse | Response>
) {
  return async (req: Request): Promise<Response> => {
    try {
      // Validate request
      const validation = await SchemaValidator.validateRequest(req, schema)

      if (!validation.success) {
        logger.warn('Request validation failed', { errors: validation.errors })
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validation.errors,
          },
          { status: 400 }
        )
      }

      // Call handler with validated data
      const result = await handler(req, validation.data!)

      // If handler returned a Response, use it directly
      if (result instanceof Response) {
        return result
      }

      // Validate response if schema provided
      if (schema.response) {
        const responseValidation = SchemaValidator.validateResponse(result, schema.response)

        if (!responseValidation.success) {
          logger.error('Response validation failed', { errors: responseValidation.errors })
          return NextResponse.json(
            {
              error: 'Internal server error',
              message: 'Invalid response format',
            },
            { status: 500 }
          )
        }
      }

      return NextResponse.json(result)
    } catch (error) {
      logger.error('Validated endpoint error', error)

      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            error: error.message,
            details: error.details,
          },
          { status: error.statusCode }
        )
      }

      return NextResponse.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Common API schemas for reuse
 */
export const CommonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  // ID parameter
  idParam: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),

  // Success response
  successResponse: z.object({
    success: z.boolean(),
    message: z.string().optional(),
  }),

  // Error response
  errorResponse: z.object({
    error: z.string(),
    message: z.string().optional(),
    details: z.any().optional(),
  }),

  // User registration
  userRegistration: z.object({
    email: z.string().email('Invalid email format').max(255),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100)
      .regex(/^[a-zA-Z\s'-]+$/, 'Invalid name format'),
  }),

  // User login
  userLogin: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),

  // Profile update
  profileUpdate: z.object({
    name: z.string().min(1).max(100).optional(),
    credentials: z.string().max(200).optional(),
    specialty: z.string().max(100).optional(),
    yearsOfExperience: z.number().int().min(0).max(100).optional(),
  }),

  // Review creation
  reviewCreation: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(255),
    role: z.string().min(1).max(100),
    location: z.string().min(1).max(200),
    country: z.string().min(1).max(100),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1).max(1000),
  }),

  // ICD-10 code search
  icdSearch: z.object({
    query: z.string().min(1).max(200),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  // Drug search
  drugSearch: z.object({
    query: z.string().min(1).max(200),
    category: z.string().max(100).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
}

/**
 * OpenAPI spec generator (basic implementation)
 */
export class OpenAPIGenerator {
  private static endpoints: Array<{
    path: string
    method: string
    schema: EndpointSchema
    description?: string
  }> = []

  /**
   * Register an endpoint
   */
  static registerEndpoint(
    path: string,
    method: string,
    schema: EndpointSchema,
    description?: string
  ) {
    this.endpoints.push({ path, method, schema, description })
  }

  /**
   * Generate OpenAPI spec
   */
  static generateSpec() {
    return {
      openapi: '3.0.0',
      info: {
        title: 'AccuCoder API',
        version: '1.0.0',
        description: 'Medical coding and ICD-10 search API',
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          description: 'API Server',
        },
      ],
      paths: this.generatePaths(),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    }
  }

  /**
   * Generate paths object
   */
  private static generatePaths() {
    const paths: any = {}

    for (const endpoint of this.endpoints) {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {}
      }

      paths[endpoint.path][endpoint.method.toLowerCase()] = {
        description: endpoint.description,
        requestBody: endpoint.schema.body
          ? {
              required: true,
              content: {
                'application/json': {
                  schema: this.zodToJsonSchema(endpoint.schema.body),
                },
              },
            }
          : undefined,
        parameters: endpoint.schema.query ? this.generateParameters(endpoint.schema.query) : [],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: endpoint.schema.response
                  ? this.zodToJsonSchema(endpoint.schema.response)
                  : { type: 'object' },
              },
            },
          },
        },
      }
    }

    return paths
  }

  /**
   * Convert Zod schema to JSON Schema (basic implementation)
   */
  private static zodToJsonSchema(schema: z.ZodType): any {
    // This is a simplified implementation
    // In production, use zod-to-json-schema library
    return { type: 'object' }
  }

  /**
   * Generate parameters from query schema
   */
  private static generateParameters(schema: z.ZodType): any[] {
    // Simplified implementation
    return []
  }
}

/**
 * Helper function to validate data against a Zod schema
 * Returns { success: true, data } or { success: false, errors }
 */
export async function validateSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: Array<{ field?: string; message: string }> }> {
  try {
    const validatedData = await schema.parseAsync(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return { success: false, errors }
    }
    
    return {
      success: false,
      errors: [{ message: error instanceof Error ? error.message : 'Validation failed' }],
    }
  }
}
