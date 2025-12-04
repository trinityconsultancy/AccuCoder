// Health Check and Metrics System
// Comprehensive monitoring, observability, and system health endpoints

import mongoose from 'mongoose'
import { logger } from '../middleware/request-logger'
import { apiCache, databaseCache, sessionCache, staticCache } from '../cache/cache-manager'

/**
 * Health status types
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: HealthStatus
  timestamp: string
  uptime: number
  checks: {
    database: ComponentHealth
    cache: ComponentHealth
    memory: ComponentHealth
    process: ComponentHealth
  }
  version: string
  environment: string
}

/**
 * Component health interface
 */
export interface ComponentHealth {
  status: HealthStatus
  message?: string
  responseTime?: number
  details?: Record<string, any>
}

/**
 * Metrics interface
 */
export interface SystemMetrics {
  timestamp: string
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
    heapUsed: number
    heapTotal: number
  }
  cpu: {
    user: number
    system: number
  }
  database: {
    connected: boolean
    connections: number
    responseTime?: number
  }
  cache: {
    api: CacheMetrics
    database: CacheMetrics
    session: CacheMetrics
    static: CacheMetrics
  }
  requests: {
    total: number
    averageResponseTime: number
  }
}

/**
 * Cache metrics interface
 */
export interface CacheMetrics {
  size: number
  hits: number
  misses: number
  hitRate: number
}

/**
 * Health Check Service
 */
export class HealthCheckService {
  private static startTime = Date.now()

  /**
   * Get system uptime in seconds
   */
  private static getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000)
  }

  /**
   * Check database health
   */
  private static async checkDatabase(): Promise<ComponentHealth> {
    const startTime = Date.now()

    try {
      // Check connection state
      if (mongoose.connection.readyState !== 1) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: 'Database not connected',
        }
      }

      // Ping database
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping()
      }
      const responseTime = Date.now() - startTime

      return {
        status: responseTime < 100 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        message: 'Database connected',
        responseTime,
        details: {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name,
        },
      }
    } catch (error) {
      logger.error('Database health check failed', error)
      return {
        status: HealthStatus.UNHEALTHY,
        message: error instanceof Error ? error.message : 'Database check failed',
        responseTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Check cache health
   */
  private static checkCache(): ComponentHealth {
    try {
      const apiStats = apiCache.getStats()
      const dbStats = databaseCache.getStats()
      const sessionStats = sessionCache.getStats()
      const staticStats = staticCache.getStats()

      const totalSize = apiStats.size + dbStats.size + sessionStats.size + staticStats.size
      const avgHitRate =
        (apiStats.hitRate + dbStats.hitRate + sessionStats.hitRate + staticStats.hitRate) / 4

      return {
        status: avgHitRate > 0.5 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        message: 'Cache operational',
        details: {
          totalEntries: totalSize,
          averageHitRate: avgHitRate.toFixed(2),
        },
      }
    } catch (error) {
      logger.error('Cache health check failed', error)
      return {
        status: HealthStatus.DEGRADED,
        message: 'Cache check failed',
      }
    }
  }

  /**
   * Check memory health
   */
  private static checkMemory(): ComponentHealth {
    try {
      const usage = process.memoryUsage()
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024)
      const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024)
      const percentage = (usage.heapUsed / usage.heapTotal) * 100

      let status: HealthStatus
      if (percentage < 70) {
        status = HealthStatus.HEALTHY
      } else if (percentage < 85) {
        status = HealthStatus.DEGRADED
      } else {
        status = HealthStatus.UNHEALTHY
      }

      return {
        status,
        message: `Heap usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${percentage.toFixed(1)}%)`,
        details: {
          heapUsedMB,
          heapTotalMB,
          percentage: percentage.toFixed(1),
        },
      }
    } catch (error) {
      logger.error('Memory health check failed', error)
      return {
        status: HealthStatus.DEGRADED,
        message: 'Memory check failed',
      }
    }
  }

  /**
   * Check process health
   */
  private static checkProcess(): ComponentHealth {
    try {
      const cpuUsage = process.cpuUsage()
      const userCPU = cpuUsage.user / 1000000 // Convert to seconds
      const systemCPU = cpuUsage.system / 1000000

      return {
        status: HealthStatus.HEALTHY,
        message: 'Process running normally',
        details: {
          pid: process.pid,
          uptime: process.uptime(),
          cpuUser: userCPU.toFixed(2),
          cpuSystem: systemCPU.toFixed(2),
          nodeVersion: process.version,
        },
      }
    } catch (error) {
      logger.error('Process health check failed', error)
      return {
        status: HealthStatus.DEGRADED,
        message: 'Process check failed',
      }
    }
  }

  /**
   * Perform complete health check
   */
  static async check(): Promise<HealthCheckResult> {
    const [database, cache, memory, processCheck] = await Promise.all([
      this.checkDatabase(),
      Promise.resolve(this.checkCache()),
      Promise.resolve(this.checkMemory()),
      Promise.resolve(this.checkProcess()),
    ])

    // Determine overall status
    const checks = { database, cache, memory, process: processCheck }
    const statuses = Object.values(checks).map((c) => c.status)

    let overallStatus: HealthStatus
    if (statuses.includes(HealthStatus.UNHEALTHY)) {
      overallStatus = HealthStatus.UNHEALTHY
    } else if (statuses.includes(HealthStatus.DEGRADED)) {
      overallStatus = HealthStatus.DEGRADED
    } else {
      overallStatus = HealthStatus.HEALTHY
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      checks,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }
  }

  /**
   * Liveness probe - basic check that process is running
   */
  static async liveness(): Promise<{ alive: boolean }> {
    return { alive: true }
  }

  /**
   * Readiness probe - check if service is ready to accept traffic
   */
  static async readiness(): Promise<{ ready: boolean; message?: string }> {
    try {
      // Check critical dependencies
      const dbConnected = mongoose.connection.readyState === 1

      if (!dbConnected) {
        return {
          ready: false,
          message: 'Database not connected',
        }
      }

      return { ready: true }
    } catch (error) {
      return {
        ready: false,
        message: error instanceof Error ? error.message : 'Readiness check failed',
      }
    }
  }
}

/**
 * Metrics Service
 */
export class MetricsService {
  /**
   * Get system metrics
   */
  static async getMetrics(): Promise<SystemMetrics> {
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    // Database metrics
    let dbResponseTime: number | undefined
    try {
      const start = Date.now()
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping()
        dbResponseTime = Date.now() - start
      }
    } catch {
      dbResponseTime = undefined
    }

    // Cache metrics
    const apiStats = apiCache.getStats()
    const dbStats = databaseCache.getStats()
    const sessionStats = sessionCache.getStats()
    const staticStats = staticCache.getStats()

    // Request metrics (placeholder - would integrate with request logger)
    const requestMetrics = {
      total: 0,
      averageResponseTime: 0,
    }

    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
      },
      cpu: {
        user: cpuUsage.user / 1000000,
        system: cpuUsage.system / 1000000,
      },
      database: {
        connected: mongoose.connection.readyState === 1,
        connections: mongoose.connection.readyState,
        responseTime: dbResponseTime,
      },
      cache: {
        api: {
          size: apiStats.size,
          hits: apiStats.hits,
          misses: apiStats.misses,
          hitRate: apiStats.hitRate,
        },
        database: {
          size: dbStats.size,
          hits: dbStats.hits,
          misses: dbStats.misses,
          hitRate: dbStats.hitRate,
        },
        session: {
          size: sessionStats.size,
          hits: sessionStats.hits,
          misses: sessionStats.misses,
          hitRate: sessionStats.hitRate,
        },
        static: {
          size: staticStats.size,
          hits: staticStats.hits,
          misses: staticStats.misses,
          hitRate: staticStats.hitRate,
        },
      },
      requests: requestMetrics,
    }
  }

  /**
   * Get metrics in Prometheus format
   */
  static async getPrometheusMetrics(): Promise<string> {
    const metrics = await this.getMetrics()
    const lines: string[] = []

    // Memory metrics
    lines.push('# HELP process_heap_bytes Process heap memory usage in bytes')
    lines.push('# TYPE process_heap_bytes gauge')
    lines.push(`process_heap_bytes{type="used"} ${metrics.memory.heapUsed}`)
    lines.push(`process_heap_bytes{type="total"} ${metrics.memory.heapTotal}`)

    // CPU metrics
    lines.push('# HELP process_cpu_seconds_total Total CPU time in seconds')
    lines.push('# TYPE process_cpu_seconds_total counter')
    lines.push(`process_cpu_seconds_total{type="user"} ${metrics.cpu.user}`)
    lines.push(`process_cpu_seconds_total{type="system"} ${metrics.cpu.system}`)

    // Database metrics
    lines.push('# HELP database_connected Database connection status')
    lines.push('# TYPE database_connected gauge')
    lines.push(`database_connected ${metrics.database.connected ? 1 : 0}`)

    if (metrics.database.responseTime !== undefined) {
      lines.push('# HELP database_response_time_ms Database response time in milliseconds')
      lines.push('# TYPE database_response_time_ms gauge')
      lines.push(`database_response_time_ms ${metrics.database.responseTime}`)
    }

    // Cache metrics
    for (const [name, stats] of Object.entries(metrics.cache)) {
      lines.push(`# HELP cache_hit_rate Cache hit rate for ${name}`)
      lines.push('# TYPE cache_hit_rate gauge')
      lines.push(`cache_hit_rate{cache="${name}"} ${stats.hitRate}`)

      lines.push(`# HELP cache_size Cache size for ${name}`)
      lines.push('# TYPE cache_size gauge')
      lines.push(`cache_size{cache="${name}"} ${stats.size}`)
    }

    // Uptime
    lines.push('# HELP process_uptime_seconds Process uptime in seconds')
    lines.push('# TYPE process_uptime_seconds gauge')
    lines.push(`process_uptime_seconds ${metrics.uptime}`)

    return lines.join('\n')
  }
}
