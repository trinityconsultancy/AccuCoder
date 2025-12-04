// Advanced Caching Layer with TTL and Invalidation
// In-memory LRU cache with Redis-compatible interface

import { logger } from '../middleware/request-logger'

interface CacheEntry<T> {
  value: T
  expiresAt: number
  hits: number
  createdAt: number
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  size: number
  hitRate: number
}

export class CacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
  }
  private readonly maxSize: number
  private readonly defaultTTL: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(options?: { maxSize?: number; defaultTTL?: number; cleanupInterval?: number }) {
    this.maxSize = options?.maxSize || 1000
    this.defaultTTL = options?.defaultTTL || 5 * 60 * 1000 // 5 minutes
    
    // Start automatic cleanup
    const cleanupMs = options?.cleanupInterval || 60 * 1000 // 1 minute
    this.startCleanup(cleanupMs)
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      logger.debug('Cache miss', { key })
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.stats.misses++
      logger.debug('Cache expired', { key })
      return null
    }

    // Update hit count
    entry.hits++
    this.stats.hits++
    logger.debug('Cache hit', { key, hits: entry.hits })

    return entry.value
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: T, ttlMs?: number): Promise<void> {
    const ttl = ttlMs || this.defaultTTL
    
    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      hits: 0,
      createdAt: Date.now(),
    })

    this.stats.sets++
    logger.debug('Cache set', { key, ttl })
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
      logger.debug('Cache delete', { key })
    }
    return deleted
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    let deleted = 0

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }

    this.stats.deletes += deleted
    logger.debug('Cache delete pattern', { pattern, deleted })
    return deleted
  }

  /**
   * Check if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear()
    logger.info('Cache cleared')
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute if missing
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T> | T,
    ttlMs?: number
  ): Promise<T> {
    const cached = await this.get(key)
    if (cached !== null) {
      return cached
    }

    const value = await factory()
    await this.set(key, value, ttlMs)
    return value
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null
    let lruHits = Infinity
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      // Prioritize evicting entries with fewer hits
      if (entry.hits < lruHits || (entry.hits === lruHits && entry.createdAt < oldestTime)) {
        lruKey = key
        lruHits = entry.hits
        oldestTime = entry.createdAt
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
      this.stats.evictions++
      logger.debug('Cache eviction', { key: lruKey, hits: lruHits })
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let removed = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        removed++
      }
    }

    if (removed > 0) {
      logger.debug('Cache cleanup', { removed })
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanup(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, intervalMs)

    // Prevent process from hanging
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Stop cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Global cache instances
export const cacheInstances = {
  // Short-lived cache for API responses
  api: new CacheManager({
    maxSize: 500,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
  }),

  // Medium-lived cache for database queries
  database: new CacheManager({
    maxSize: 1000,
    defaultTTL: 15 * 60 * 1000, // 15 minutes
  }),

  // Long-lived cache for static data
  static: new CacheManager({
    maxSize: 200,
    defaultTTL: 60 * 60 * 1000, // 1 hour
  }),

  // Session cache
  session: new CacheManager({
    maxSize: 10000,
    defaultTTL: 30 * 60 * 1000, // 30 minutes
  }),
}

/**
 * Cache key builder for consistency
 */
export class CacheKeyBuilder {
  static user(userId: string): string {
    return `user:${userId}`
  }

  static userProfile(userId: string): string {
    return `profile:${userId}`
  }

  static profile(userId: string): string {
    return `profile:${userId}`
  }

  static review(reviewId: string): string {
    return `review:${reviewId}`
  }

  static reviews(status?: string): string {
    return status ? `reviews:${status}` : 'reviews:all'
  }

  static drugSearch(query: string): string {
    return `drug:search:${query.toLowerCase()}`
  }

  static session(token: string): string {
    return `session:${token}`
  }

  static apiResponse(endpoint: string, params: Record<string, any>): string {
    const paramStr = JSON.stringify(params)
    return `api:${endpoint}:${paramStr}`
  }

  static generic(prefix: string, key: string): string {
    return `${prefix}:${key}`
  }
}

/**
 * Cache decorator for methods
 */
export function Cacheable(
  options: {
    ttl?: number
    keyPrefix?: string
    cache?: CacheManager
  } = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const cache = options.cache || cacheInstances.database

    descriptor.value = async function (...args: any[]) {
      // Build cache key
      const keyPrefix = options.keyPrefix || propertyKey
      const key = `${keyPrefix}:${JSON.stringify(args)}`

      // Try to get from cache
      const cached = await cache.get(key)
      if (cached !== null) {
        return cached
      }

      // Execute original method
      const result = await originalMethod.apply(this, args)

      // Store in cache
      await cache.set(key, result, options.ttl)

      return result
    }

    return descriptor
  }
}

/**
 * Cache invalidation helper
 */
export class CacheInvalidator {
  static async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      cacheInstances.database.delete(CacheKeyBuilder.user(userId)),
      cacheInstances.database.delete(CacheKeyBuilder.userProfile(userId)),
    ])
    logger.debug('User cache invalidated', { userId })
  }

  static async invalidateReviews(): Promise<void> {
    await cacheInstances.database.deletePattern('reviews:*')
    logger.debug('Reviews cache invalidated')
  }

  static async invalidateAll(): Promise<void> {
    await Promise.all([
      cacheInstances.api.clear(),
      cacheInstances.database.clear(),
    ])
    logger.info('All caches invalidated')
  }
}

// Export cache instances for external use
export const apiCache = cacheInstances.api
export const databaseCache = cacheInstances.database
export const sessionCache = cacheInstances.session
export const staticCache = cacheInstances.static
