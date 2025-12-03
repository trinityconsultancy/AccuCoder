import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Review from '@/lib/models/Review'

// PATCH - Update review status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()
    const { status } = body

    console.log(`PATCH /api/reviews/${id} - Updating status to:`, status)

    // Validate status
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be approved, rejected, or pending.' },
        { status: 400 }
      )
    }

    // Update the review
    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    console.log('Review updated successfully:', review)

    return NextResponse.json({
      success: true,
      review,
      message: `Review ${status} successfully`
    })
  } catch (error: any) {
    console.error('Error in PATCH /api/reviews/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const { id } = params

    console.log(`DELETE /api/reviews/${id}`)

    // Delete the review
    const review = await Review.findByIdAndDelete(id)

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    console.log('Review deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/reviews/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get a specific review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const { id } = params

    console.log(`GET /api/reviews/${id}`)

    // Get the review
    const review = await Review.findById(id).lean()

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      review
    })
  } catch (error: any) {
    console.error('Error in GET /api/reviews/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
