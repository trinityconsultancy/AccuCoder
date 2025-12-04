import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('[TEST] Testing MongoDB connection...')
    console.log('[TEST] MONGODB_URI exists:', !!process.env.MONGODB_URI)
    console.log('[TEST] JWT_SECRET exists:', !!process.env.JWT_SECRET)
    
    await connectDB()
    console.log('[TEST] MongoDB connected successfully')
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      env: {
        MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Missing',
        JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
        BREVO_SMTP_HOST: process.env.BREVO_SMTP_HOST ? 'Set' : 'Missing',
        BREVO_SMTP_USER: process.env.BREVO_SMTP_USER ? 'Set' : 'Missing',
        BREVO_SMTP_PASSWORD: process.env.BREVO_SMTP_PASSWORD ? 'Set' : 'Missing',
        FROM_EMAIL: process.env.FROM_EMAIL ? 'Set' : 'Missing',
        NODE_ENV: process.env.NODE_ENV,
      }
    })
  } catch (error) {
    console.error('[TEST] Connection failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
