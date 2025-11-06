import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test alphabetical_index
    const { data: indexData, error: indexError } = await supabase
      .from('alphabetical_index')
      .select('*')
      .limit(5)
    
    // Test drugs_and_chemicals
    const { data: drugsData, error: drugsError } = await supabase
      .from('drugs_and_chemicals')
      .select('*')
      .limit(5)
    
    return NextResponse.json({
      alphabetical_index: {
        success: !indexError,
        count: indexData?.length || 0,
        error: indexError?.message || null,
        sample: indexData?.[0] || null
      },
      drugs_and_chemicals: {
        success: !drugsError,
        count: drugsData?.length || 0,
        error: drugsError?.message || null,
        sample: drugsData?.[0] || null
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
