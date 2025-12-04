import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import Review from '@/lib/models/Review'
import { sanitizeInput } from '@/lib/security/input-sanitization'
import { validateSchema } from '@/lib/validation/schema-validator'
import { logger } from '@/lib/middleware/request-logger'
import { databaseCache, CacheKeyBuilder } from '@/lib/cache/cache-manager'
import { ValidationError } from '@/lib/api-error-handler'

// Review submission schema
const reviewSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .max(100, 'Email too long'),
  
  role: z.string()
    .min(1, 'Role is required')
    .max(100, 'Role too long'),
  
  location: z.string()
    .min(1, 'Location is required')
    .max(100, 'Location too long'),
  
  country: z.string()
    .min(1, 'Country is required')
    .max(100, 'Country too long'),
  
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment too long (max 1000 characters)'),
})

export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID()
  
  try {
    await connectDB()

    // Parse and sanitize input
    const rawBody = await request.json()
    const sanitizedBody = sanitizeInput(rawBody)

    logger.info('Review submission attempt', {
      correlationId,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    })

    // Validate request data
    const validationResult = await validateSchema(reviewSchema, sanitizedBody)
    if (!validationResult.success) {
      logger.warn('Review validation failed', {
        correlationId,
        errors: validationResult.errors,
      })
      
      return NextResponse.json({
        error: validationResult.errors[0]?.message || 'Invalid input',
        errors: validationResult.errors,
      }, { status: 400 })
    }

    const data = validationResult.data

    // Create review
    const review = await Review.create({
      name: data.name,
      email: data.email,
      role: data.role,
      location: data.location,
      country: data.country,
      rating: data.rating,
      comment: data.comment,
      status: 'pending',
    })

    logger.info('Review submitted successfully', {
      correlationId,
      reviewId: review._id.toString(),
      rating: review.rating,
    })

    // Invalidate review cache
    await databaseCache.deletePattern('reviews:*')

    return NextResponse.json({
      message: 'Review submitted successfully',
      data: {
        id: review._id,
        status: review.status,
      },
    }, { status: 201 })

  } catch (error) {
    logger.error('Review submission error', {
      correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof ValidationError) {
      return NextResponse.json({
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to submit review. Please try again.',
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const correlationId = crypto.randomUUID()
  
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const admin = searchParams.get('admin')

    // Build cache key based on query parameters
    const cacheKey = CacheKeyBuilder.generic(
      'reviews',
      `status:${status || 'approved'}-admin:${admin || 'false'}`
    )

    // Try cache first
    const cachedReviews = await databaseCache.get(cacheKey) as any[] | null
    if (cachedReviews) {
      logger.debug('Reviews retrieved from cache', {
        correlationId,
        cacheKey,
        count: cachedReviews.length,
      })
      
      return NextResponse.json({
        reviews: cachedReviews,
        cached: true,
      }, { status: 200 })
    }

    // Build query
    let query: any = {}
    
    if (!admin) {
      query.status = 'approved'
    }
    
    if (status) {
      query.status = status
    }

    // Fetch from database
    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean()

    logger.info('Reviews fetched from database', {
      correlationId,
      count: reviews.length,
      status: query.status,
    })

    // Cache the results (5 minutes)
    await databaseCache.set(cacheKey, reviews, 300)

    return NextResponse.json({
      reviews,
      cached: false,
    }, { status: 200 })

  } catch (error) {
    logger.error('Review fetch error', {
      correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json({
      error: 'Failed to fetch reviews',
    }, { status: 500 })
  }
}
