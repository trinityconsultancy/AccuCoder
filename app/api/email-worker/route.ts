import { NextResponse } from 'next/server'
import { getEmailWorker } from '@/lib/email-worker'

// Start the email worker
export async function POST() {
  try {
    const worker = getEmailWorker()
    await worker.start()
    
    return NextResponse.json({
      success: true,
      message: 'Email worker started successfully'
    })
  } catch (error) {
    console.error('Error starting email worker:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start email worker' 
      },
      { status: 500 }
    )
  }
}

// Stop the email worker
export async function DELETE() {
  try {
    const worker = getEmailWorker()
    worker.stop()
    
    return NextResponse.json({
      success: true,
      message: 'Email worker stopped successfully'
    })
  } catch (error) {
    console.error('Error stopping email worker:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to stop email worker' 
      },
      { status: 500 }
    )
  }
}

// Get email worker status
export async function GET() {
  try {
    // You could extend the worker class to track status
    return NextResponse.json({
      success: true,
      status: 'running',
      message: 'Email worker is operational'
    })
  } catch (error) {
    console.error('Error getting email worker status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get email worker status' 
      },
      { status: 500 }
    )
  }
}
