/**
 * Shared Rate Limit Store Implementation
 * Uses Upstash Redis (or similar) for distributed rate limiting across serverless instances
 */

import type { RateLimitStore, RateLimitEntry } from './rate-limit'
import { getOptionalRedis } from '@/lib/redis/optional-redis'

/**
 * Upstash Redis store for production rate limiting
 * Uses @upstash/redis (REST under the hood) for global consistency across serverless instances.
 */
export class UpstashRateLimitStore implements RateLimitStore {
  constructor() {}

  async get(key: string): Promise<RateLimitEntry | null> {
    const redis = getOptionalRedis()
    if (!redis) return null
    try {
      const data = await redis.get<string>(key)
      if (!data) return null

      const entry = JSON.parse(data) as RateLimitEntry
      
      // Check if entry has expired
      if (Date.now() > entry.resetTime) {
        await this.delete(key)
        return null
      }

      return entry
    } catch (error) {
      // Let caller decide fail-open vs fail-closed (RateLimiter config).
      console.error('[RateLimit] Upstash Redis get error:', error)
      throw error
    }
  }

  async set(key: string, entry: RateLimitEntry): Promise<void> {
    const redis = getOptionalRedis()
    if (!redis) return
    try {
      const ttl = Math.ceil((entry.resetTime - Date.now()) / 1000)
      if (ttl <= 0) {
        return // Entry already expired
      }
      await redis.set(key, JSON.stringify(entry), { ex: ttl })
    } catch (error) {
      console.error('[RateLimit] Upstash Redis set error:', error)
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    const redis = getOptionalRedis()
    if (!redis) return
    try {
      await redis.del(key)
    } catch (error) {
      console.error('[RateLimit] Upstash Redis delete error:', error)
      // Don't throw on delete errors - not critical
    }
  }

  async clear(): Promise<void> {
    throw new Error('Upstash Redis clear not implemented for safety')
  }
}

/**
 * Get the appropriate rate limit store based on environment
 * Uses Upstash Redis in production if configured, otherwise falls back to in-memory
 * 
 * IMPORTANT: This function NEVER throws - it only returns undefined if credentials are missing.
 * Validation happens when the store is actually used (in RateLimiter.getStore()).
 * This allows builds to complete without requiring Redis credentials.
 */
export function getRateLimitStore(): RateLimitStore | undefined {
  // NEVER throw here - Next.js executes this during build phase
  // If credentials are missing, return undefined
  // Validation will happen when store is actually used at runtime
  
  const redis = getOptionalRedis()
  if (!redis) return undefined
  return new UpstashRateLimitStore()
}

