import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import DrugChemical from '@/lib/models/DrugChemical'
import { sanitizeInput } from '@/lib/security/input-sanitization'
import { logger } from '@/lib/middleware/request-logger'
import { databaseCache, CacheKeyBuilder } from '@/lib/cache/cache-manager'

export async function GET(request: NextRequest) {
  const correlationId = crypto.randomUUID()
  
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const rawSearch = searchParams.get('search')
    
    // Sanitize search input to prevent NoSQL injection
    const search = rawSearch ? sanitizeInput(rawSearch) : null
    
    // Validate search length
    if (search && search.length > 100) {
      logger.warn('Drug search query too long', {
        correlationId,
        length: search.length,
      })
      
      return NextResponse.json({
        error: 'Search query too long (max 100 characters)',
      }, { status: 400 })
    }

    logger.info('Drug search request', {
      correlationId,
      hasSearch: !!search,
      searchLength: search?.length || 0,
    })

    // Build cache key
    const cacheKey = search 
      ? CacheKeyBuilder.drugSearch(search)
      : CacheKeyBuilder.generic('drugs', 'all')

    // Try cache first
    const cachedDrugs = await databaseCache.get(cacheKey) as any[] | null
    if (cachedDrugs) {
      logger.debug('Drugs retrieved from cache', {
        correlationId,
        cacheKey,
        count: cachedDrugs.length,
      })
      
      return NextResponse.json({
        drugs: cachedDrugs,
        cached: true,
      }, { status: 200 })
    }

    // Build query
    let query: any = {}
    if (search) {
      // Escape regex special characters to prevent ReDoS
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.substance = { $regex: escapedSearch, $options: 'i' }
    }

    // Fetch from database
    const startTime = Date.now()
    const drugs = await DrugChemical.find(query)
      .sort({ substance: 1 })
      .limit(1000) // Prevent excessive results
      .lean()
    const duration = Date.now() - startTime

    logger.info('Drugs fetched from database', {
      correlationId,
      count: drugs.length,
      duration,
      hasSearch: !!search,
    })

    // Cache the results (longer cache for no-search queries)
    const cacheTTL = search ? 300 : 3600 // 5 min with search, 1 hour without
    await databaseCache.set(cacheKey, drugs, cacheTTL)

    return NextResponse.json({
      drugs,
      cached: false,
    }, { status: 200 })

  } catch (error) {
    logger.error('Drug fetch error', {
      correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json({
      error: 'Failed to fetch drugs',
    }, { status: 500 })
  }
}
