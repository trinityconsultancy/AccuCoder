import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Review from '@/lib/models/Review'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    console.log('POST /api/reviews - Request received')
    
    const body = await request.json()
    console.log('Request body:', { ...body, email: '***' }) // Log without exposing email
    
    const { name, email, role, location, country, rating, comment } = body

    // Validate required fields
    if (!name || !email || !role || !location || !country || !rating || !comment) {
      console.error('Validation failed: Missing required fields')
      return NextResponse.json(
        { error: 'All fields are required', missingFields: {
          name: !name,
          email: !email,
          role: !role,
          location: !location,
          country: !country,
          rating: !rating,
          comment: !comment
        }},
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      console.error('Validation failed: Invalid rating')
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('Validation failed: Invalid email format')
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      console.error('MongoDB not configured')
      return NextResponse.json(
        { error: 'Database not configured. Please contact support.' },
        { status: 503 }
      )
    }

    console.log('Inserting review into database...')
    
    // Insert review into MongoDB
    const review = await Review.create({
      name,
      email,
      role,
      location,
      country,
      rating,
      comment,
      status: 'pending'
    })

    console.log('Review submitted successfully:', review)
    
    return NextResponse.json(
      { message: 'Review submitted successfully', data: review },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const admin = searchParams.get('admin') // admin=true fetches all reviews

    let query: any = {}

    // If admin parameter is not set, only return approved reviews by default
    if (!admin) {
      query.status = 'approved'
    }

    // If status is specified, filter by that status (overrides admin default)
    if (status) {
      query.status = status
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ reviews }, { status: 200 })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
