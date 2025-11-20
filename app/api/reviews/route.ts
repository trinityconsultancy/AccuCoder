import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
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

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase not configured')
      return NextResponse.json(
        { error: 'Database not configured. Please contact support.' },
        { status: 503 }
      )
    }

    console.log('Inserting review into database...')
    
    // Insert review into database
    const { data, error } = await supabase
      .from('user_reviews')
      .insert([
        {
          name,
          email,
          role,
          location,
          country,
          rating,
          comment,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}`, details: error },
        { status: 500 }
      )
    }

    console.log('Review submitted successfully:', data)
    
    return NextResponse.json(
      { message: 'Review submitted successfully', data },
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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const admin = searchParams.get('admin') // admin=true fetches all reviews

    let query = supabase
      .from('user_reviews')
      .select('*')
      .order('created_at', { ascending: false })

    // If admin parameter is not set, only return approved reviews by default
    if (!admin) {
      query = query.eq('status', 'approved')
    }

    // If status is specified, filter by that status (overrides admin default)
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reviews: data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
