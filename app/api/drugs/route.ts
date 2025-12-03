import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import DrugChemical from '@/lib/models/DrugChemical'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query: any = {}
    if (search) {
      query.substance = { $regex: search, $options: 'i' }
    }

    const drugs = await DrugChemical.find(query)
      .sort({ substance: 1 })
      .lean()

    return NextResponse.json({ drugs }, { status: 200 })
  } catch (error) {
    console.error('Error fetching drugs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
