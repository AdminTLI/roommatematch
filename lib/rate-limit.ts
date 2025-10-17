// Rate Limiting Implementation
// This module provides rate limiting functionality for API endpoints and user actions

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: any) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>
  set(key: string, entry: RateLimitEntry): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

export interface RateLimitEntry {
  count: number
  resetTime: number
  windowStart: number
}

// In-memory store for development (not suitable for production)
class MemoryRateLimitStore implements RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key)
    if (!entry) return null

    // Check if entry has expired
    if (Date.now() > entry.resetTime) {
      this.store.delete(key)
      return null
    }

    return entry
  }

  async set(key: string, entry: RateLimitEntry): Promise<void> {
    this.store.set(key, entry)
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async clear(): Promise<void> {
    this.store.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Redis-based store for production (placeholder)
class RedisRateLimitStore implements RateLimitStore {
  private redis: any // Redis client would be injected here

  constructor(redisClient: any) {
    this.redis = redisClient
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    try {
      const data = await this.redis.get(key)
      if (!data) return null

      const entry = JSON.parse(data)
      
      // Check if entry has expired
      if (Date.now() > entry.resetTime) {
        await this.delete(key)
        return null
      }

      return entry
    } catch (error) {
      console.error('Redis rate limit get error:', error)
      return null
    }
  }

  async set(key: string, entry: RateLimitEntry): Promise<void> {
    try {
      const ttl = Math.ceil((entry.resetTime - Date.now()) / 1000)
      await this.redis.setex(key, ttl, JSON.stringify(entry))
    } catch (error) {
      console.error('Redis rate limit set error:', error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Redis rate limit delete error:', error)
    }
  }

  async clear(): Promise<void> {
    // Redis clear would need to be implemented carefully
    // to avoid clearing other data
    throw new Error('Redis clear not implemented for safety')
  }
}

export class RateLimiter {
  private config: RateLimitConfig
  private store: RateLimitStore

  constructor(config: RateLimitConfig, store?: RateLimitStore) {
    this.config = config
    this.store = store || new MemoryRateLimitStore()
  }

  /**
   * Check if request is allowed and update counters
   */
  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs
    const resetTime = windowStart + this.config.windowMs

    try {
      const entry = await this.store.get(key)

      if (!entry || entry.windowStart !== windowStart) {
        // New window or no existing entry
        const newEntry: RateLimitEntry = {
          count: 1,
          resetTime,
          windowStart
        }

        await this.store.set(key, newEntry)

        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime,
          totalHits: 1
        }
      }

      // Existing entry in current window
      if (entry.count >= this.config.maxRequests) {
        // Rate limit exceeded
        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime,
          totalHits: entry.count
        }
      }

      // Increment counter
      entry.count++
      await this.store.set(key, entry)

      return {
        allowed: true,
        remaining: this.config.maxRequests - entry.count,
        resetTime: entry.resetTime,
        totalHits: entry.count
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        totalHits: 0
      }
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(key: string): Promise<void> {
    await this.store.delete(key)
  }

  /**
   * Get current rate limit status without incrementing
   */
  async status(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs
    const resetTime = windowStart + this.config.windowMs

    try {
      const entry = await this.store.get(key)

      if (!entry || entry.windowStart !== windowStart) {
        return {
          allowed: true,
          remaining: this.config.maxRequests,
          resetTime,
          totalHits: 0
        }
      }

      return {
        allowed: entry.count < this.config.maxRequests,
        remaining: Math.max(0, this.config.maxRequests - entry.count),
        resetTime: entry.resetTime,
        totalHits: entry.count
      }
    } catch (error) {
      console.error('Rate limit status error:', error)
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        totalHits: 0
      }
    }
  }
}

// Pre-configured rate limiters for different use cases
export const RATE_LIMITS = {
  // API endpoints
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  }),

  // Authentication
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10
  }),

  // Messages
  messages: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 30
  }),

  // Reports
  reports: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5
  }),

  // Forum posts
  forum_posts: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3
  }),

  // Forum comments
  forum_comments: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10
  }),

  // ID verification
  id_verification: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3
  }),

  // Matching requests
  matching: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5
  })
}

// Utility functions
export async function checkRateLimit(
  type: keyof typeof RATE_LIMITS,
  key: string
): Promise<RateLimitResult> {
  const limiter = RATE_LIMITS[type]
  return limiter.check(key)
}

export async function getRateLimitStatus(
  type: keyof typeof RATE_LIMITS,
  key: string
): Promise<RateLimitResult> {
  const limiter = RATE_LIMITS[type]
  return limiter.status(key)
}

export async function resetRateLimit(
  type: keyof typeof RATE_LIMITS,
  key: string
): Promise<void> {
  const limiter = RATE_LIMITS[type]
  return limiter.reset(key)
}

// Helper function to generate rate limit keys
export function generateRateLimitKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`
}

// Helper function to get user-based rate limit key
export function getUserRateLimitKey(type: string, userId: string): string {
  return generateRateLimitKey(type, userId)
}

// Helper function to get IP-based rate limit key
export function getIPRateLimitKey(type: string, ip: string): string {
  return generateRateLimitKey(type, ip)
}

// Middleware helper for Next.js API routes
export function createRateLimitMiddleware(
  type: keyof typeof RATE_LIMITS,
  keyGenerator: (req: any) => string
) {
  return async (req: any, res: any, next?: () => void) => {
    try {
      const key = keyGenerator(req)
      const result = await checkRateLimit(type, key)

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', RATE_LIMITS[type]['config'].maxRequests)
      res.setHeader('X-RateLimit-Remaining', result.remaining)
      res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

      if (!result.allowed) {
        res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        })
        return
      }

      if (next) {
        next()
      }
    } catch (error) {
      console.error('Rate limit middleware error:', error)
      // Fail open - continue if rate limiting fails
      if (next) {
        next()
      }
    }
  }
}
