/**
 * Shared Rate Limit Store Implementation
 * Uses Upstash Redis (or similar) for distributed rate limiting across serverless instances
 */

import type { RateLimitStore, RateLimitEntry } from './rate-limit'

/**
 * Upstash Redis store for production rate limiting
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables
 */
export class UpstashRateLimitStore implements RateLimitStore {
  private baseUrl: string
  private token: string

  constructor(requireCredentials: boolean = false) {
    this.baseUrl = process.env.UPSTASH_REDIS_REST_URL || ''
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN || ''

    if (requireCredentials && (!this.baseUrl || !this.token)) {
      throw new Error('[RateLimit] Upstash Redis credentials are required but not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.')
    }

    if (!this.baseUrl || !this.token) {
      console.warn('[RateLimit] Upstash Redis not configured. Falling back to in-memory store.')
    }
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    if (!this.baseUrl || !this.token) {
      // In production, this should never happen if requireCredentials was true
      // But if it does, throw to trigger fail-closed behavior
      if (process.env.NODE_ENV === 'production') {
        throw new Error('[RateLimit] Upstash Redis not configured in production')
      }
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/get/${encodeURIComponent(key)}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        next: { revalidate: 0 } // Don't cache rate limit checks
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Upstash Redis GET failed: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.result) {
        return null
      }

      const entry = JSON.parse(data.result)
      
      // Check if entry has expired
      if (Date.now() > entry.resetTime) {
        await this.delete(key)
        return null
      }

      return entry
    } catch (error) {
      console.error('[RateLimit] Upstash Redis get error:', error)
      throw error // Re-throw to trigger fail-closed behavior
    }
  }

  async set(key: string, entry: RateLimitEntry): Promise<void> {
    if (!this.baseUrl || !this.token) {
      // In production, this should never happen if requireCredentials was true
      // But if it does, throw to trigger fail-closed behavior
      if (process.env.NODE_ENV === 'production') {
        throw new Error('[RateLimit] Upstash Redis not configured in production')
      }
      return
    }

    try {
      const ttl = Math.ceil((entry.resetTime - Date.now()) / 1000)
      if (ttl <= 0) {
        return // Entry already expired
      }

      const response = await fetch(`${this.baseUrl}/setex/${encodeURIComponent(key)}/${ttl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry),
        next: { revalidate: 0 }
      })

      if (!response.ok) {
        throw new Error(`Upstash Redis SETEX failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('[RateLimit] Upstash Redis set error:', error)
      throw error // Re-throw to trigger fail-closed behavior
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.baseUrl || !this.token) {
      return
    }

    try {
      const response = await fetch(`${this.baseUrl}/del/${encodeURIComponent(key)}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        next: { revalidate: 0 }
      })

      // Ignore 404 errors (key doesn't exist)
      if (!response.ok && response.status !== 404) {
        throw new Error(`Upstash Redis DEL failed: ${response.statusText}`)
      }
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
 * IMPORTANT: In production, Upstash Redis is REQUIRED for distributed rate limiting.
 * If not configured, this function will throw an error (fail fast on startup).
 */
export function getRateLimitStore(): RateLimitStore | undefined {
  // In production, Upstash Redis is REQUIRED - fail fast if not configured
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error(
        '[RateLimit] Upstash Redis is required in production but not configured. ' +
        'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
      )
    }
    // Create store with requireCredentials=true to ensure it validates on construction
    return new UpstashRateLimitStore(true)
  }
  
  // In development, try to use Upstash if configured, otherwise fall back to in-memory
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new UpstashRateLimitStore(false)
  }
  
  // Return undefined to use default in-memory store (development only)
  return undefined
}

