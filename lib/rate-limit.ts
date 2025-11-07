// Rate Limiting Implementation
// This module provides rate limiting functionality for API endpoints and user actions

import { getRateLimitStore } from './rate-limit-store'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: any) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  failClosed?: boolean // If true, deny requests when rate limit store fails (default: false for backward compat)
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
  private store: RateLimitStore | undefined
  private storeFactory?: () => RateLimitStore | undefined

  constructor(config: RateLimitConfig, store?: RateLimitStore | (() => RateLimitStore | undefined)) {
    this.config = config
    if (typeof store === 'function') {
      // Lazy initialization: store factory function
      this.storeFactory = store
    } else {
      // Direct store instance
      this.store = store || new MemoryRateLimitStore()
    }
  }

  private getStore(): RateLimitStore {
    if (!this.store) {
      if (this.storeFactory) {
        const factoryResult = this.storeFactory()
        if (factoryResult) {
          this.store = factoryResult
        } else {
          // Factory returned undefined - validate if we're in production runtime
          // This is where we do runtime validation (not during build)
          if (this.config.failClosed && 
              (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) &&
              process.env.VERCEL_ENV) {
            // We're at runtime in production but don't have Redis - this is an error
            throw new Error(
              '[RateLimit] Upstash Redis is required in production but not configured. ' +
              'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
            )
          }
          // Development or build - use in-memory store
          this.store = new MemoryRateLimitStore()
        }
      } else {
        this.store = new MemoryRateLimitStore()
      }
    }
    return this.store
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

        await store.set(key, newEntry)

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
      await store.set(key, entry)

      return {
        allowed: true,
        remaining: this.config.maxRequests - entry.count,
        resetTime: entry.resetTime,
        totalHits: entry.count
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Fail-closed for critical routes, fail-open for others (backward compat)
      if (this.config.failClosed) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + this.config.windowMs,
          totalHits: 0
        }
      }
      // Fail open - allow request if rate limiting fails (default behavior)
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
    await this.getStore().delete(key)
  }

  /**
   * Get current rate limit status without incrementing
   */
  async status(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs
    const resetTime = windowStart + this.config.windowMs

    try {
      const store = this.getStore()
      const entry = await store.get(key)

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
      // Fail-closed for critical routes, fail-open for others (backward compat)
      if (this.config.failClosed) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + this.config.windowMs,
          totalHits: 0
        }
      }
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        totalHits: 0
      }
    }
  }
}

// Lazy initialization of shared store
// This prevents errors during build time when env vars may not be available
let sharedStore: RateLimitStore | undefined = undefined

function getSharedStore(): RateLimitStore | undefined {
  if (sharedStore === undefined) {
    // This is called lazily when check() is invoked at runtime
    // During build, getRateLimitStore() returns undefined (no error)
    // At runtime, validation happens in RateLimiter.getStore() when store is actually used
    sharedStore = getRateLimitStore()
  }
  return sharedStore
}

// Pre-configured rate limiters for different use cases
// Critical routes use failClosed: true and shared store
// Store is initialized lazily on first use (not at module load time)
export const RATE_LIMITS = {
  // API endpoints (fail-closed for security)
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    failClosed: true
  }, getSharedStore),

  // Authentication (fail-closed for security)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    failClosed: true
  }, getSharedStore),

  // Messages (fail-closed to prevent spam)
  messages: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 30,
    failClosed: true
  }, getSharedStore),

  // Reports (fail-closed to prevent abuse)
  reports: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    failClosed: true
  }, getSharedStore),

  // Forum posts (fail-closed to prevent spam)
  forum_posts: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    failClosed: true
  }, getSharedStore),

  // Forum comments (fail-closed to prevent spam)
  forum_comments: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    failClosed: true
  }, getSharedStore),

  // ID verification (fail-closed to prevent abuse)
  id_verification: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    failClosed: true
  }, getSharedStore),

  // Matching requests (fail-closed to prevent DoS)
  matching: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    failClosed: true
  }, getSharedStore),

  // Chat profiles (fail-closed to prevent enumeration)
  chat_profiles: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    failClosed: true
  }, getSharedStore),

  // PDF generation (fail-closed to prevent abuse)
  pdf_generation: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    failClosed: true
  }, getSharedStore),

  // Chat creation (fail-closed to prevent spam)
  chat_creation: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    failClosed: true
  }, getSharedStore),

  // Matching refresh (fail-closed to prevent DoS)
  matching_refresh: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 1,
    failClosed: true
  }, getSharedStore())
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
