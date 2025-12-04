// ICD-10 Search Service Layer
// Business logic for medical code search operations

import { NotFoundError } from '@/lib/api-error-handler'
import { logger } from '@/lib/middleware/request-logger'
import AlphabeticalIndex from '@/lib/models/AlphabeticalIndex'
import { staticCache, CacheKeyBuilder } from '@/lib/cache/cache-manager'

export interface SearchFilters {
  query: string
  category?: string
  limit?: number
}

export interface SearchResult {
  results: any[]
  total: number
  query: string
}

/**
 * ICD-10 Search Service
 */
export class ICDSearchService {
  /**
   * Search ICD-10 codes
   */
  async searchCodes(filters: SearchFilters): Promise<SearchResult> {
    try {
      const { query, category, limit = 20 } = filters

      // Build cache key
      const cacheKey = CacheKeyBuilder.generic(
        'icd-search',
        `${query}_${category || 'all'}_${limit}`
      )

      // Check cache
      const cached = await staticCache.get(cacheKey)
      if (cached) {
        logger.debug('ICD search cache hit', { query })
        return cached
      }

      // Build search query
      const searchQuery: any = {
        $or: [
          { code: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { mainTerm: { $regex: query, $options: 'i' } },
        ],
      }

      if (category) {
        searchQuery.category = category
      }

      // Execute search
      const [results, total] = await Promise.all([
        AlphabeticalIndex.find(searchQuery).limit(limit).lean(),
        AlphabeticalIndex.countDocuments(searchQuery),
      ])

      const searchResult = {
        results,
        total,
        query,
      }

      // Cache result (1 hour for static medical codes)
      await staticCache.set(cacheKey, searchResult, 60 * 60 * 1000)

      logger.info('ICD codes searched', { query, total, limit })
      return searchResult
    } catch (error) {
      logger.error('ICD search error', error)
      throw error
    }
  }

  /**
   * Get code by ID
   */
  async getCodeById(codeId: string): Promise<any> {
    try {
      // Check cache
      const cacheKey = CacheKeyBuilder.generic('icd-code', codeId)
      const cached = await staticCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // Query database
      const code = await AlphabeticalIndex.findById(codeId).lean()
      if (!code) {
        throw new NotFoundError('ICD code not found')
      }

      // Cache result
      await staticCache.set(cacheKey, code, 60 * 60 * 1000)

      return code
    } catch (error) {
      logger.error('Get ICD code error', error)
      throw error
    }
  }

  /**
   * Get code by exact code string
   */
  async getCodeByString(codeString: string): Promise<any> {
    try {
      // Check cache
      const cacheKey = CacheKeyBuilder.generic('icd-code-string', codeString)
      const cached = await staticCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // Query database
      const code = await AlphabeticalIndex.findOne({ code: codeString }).lean()
      if (!code) {
        throw new NotFoundError('ICD code not found')
      }

      // Cache result
      await staticCache.set(cacheKey, code, 60 * 60 * 1000)

      return code
    } catch (error) {
      logger.error('Get ICD code by string error', error)
      throw error
    }
  }

  /**
   * Get popular codes (most searched/used)
   */
  async getPopularCodes(limit: number = 10): Promise<any[]> {
    try {
      // Check cache
      const cacheKey = `icd-popular-${limit}`
      const cached = await staticCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // Get random popular codes (in production, track usage)
      const codes = await AlphabeticalIndex.find()
        .limit(limit)
        .sort({ code: 1 })
        .lean()

      // Cache result
      await staticCache.set(cacheKey, codes, 60 * 60 * 1000)

      return codes
    } catch (error) {
      logger.error('Get popular codes error', error)
      throw error
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    try {
      // Check cache
      const cacheKey = 'icd-categories'
      const cached = await staticCache.get(cacheKey) as string[] | null
      if (cached) {
        return cached
      }

      // Get distinct categories
      const categories = await AlphabeticalIndex.distinct('category') as string[]

      // Cache result (long TTL for static data)
      await staticCache.set(cacheKey, categories, 24 * 60 * 60 * 1000) // 24 hours

      return categories
    } catch (error) {
      logger.error('Get categories error', error)
      throw error
    }
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      if (query.length < 2) {
        return []
      }

      // Check cache
      const cacheKey = CacheKeyBuilder.generic('icd-suggestions', `${query}_${limit}`)
      const cached = await staticCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // Get matching main terms
      const results = await AlphabeticalIndex.find({
        term: { $regex: `^${query}`, $options: 'i' },
      })
        .limit(limit)
        .select('term')
        .lean()

      const suggestions = [...new Set(results.map((r) => r.term))]

      // Cache result
      await staticCache.set(cacheKey, suggestions, 60 * 60 * 1000)

      return suggestions
    } catch (error) {
      logger.error('Get suggestions error', error)
      throw error
    }
  }
}
