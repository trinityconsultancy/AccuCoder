import { NextRequest, NextResponse } from 'next/server'
import { queueEmail } from '@/lib/email-worker'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message, template, template_data, scheduled_for } = body

    // Validate required fields
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check authentication (optional - require admin)
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
        return NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        )
      }
    }

    // Queue the email
    const emailJob = await queueEmail({
      to,
      subject,
      message,
      template,
      template_data,
      scheduled_for: scheduled_for ? new Date(scheduled_for) : undefined
    })

    return NextResponse.json({
      success: true,
      message: 'Email queued successfully',
      email_id: emailJob.id
    })
  } catch (error: any) {
    console.error('Error queueing email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to queue email' 
      },
      { status: 500 }
    )
  }
}

// Get email queue status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('email_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      emails: data,
      count: data.length
    })
  } catch (error: any) {
    console.error('Error fetching email queue:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch email queue' 
      },
      { status: 500 }
    )
  }
}
