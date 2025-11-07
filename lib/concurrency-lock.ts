/**
 * Distributed Concurrency Lock Implementation
 * Uses Upstash Redis for distributed locking across serverless instances
 * 
 * This prevents concurrent execution of the same operation across multiple instances.
 * Uses Redis SETNX (SET if Not eXists) with TTL for automatic expiration.
 */

/**
 * Distributed lock using Upstash Redis
 * Implements SETNX pattern with TTL for automatic lock expiration
 */
export class DistributedLock {
  private baseUrl: string
  private token: string

  constructor() {
    this.baseUrl = process.env.UPSTASH_REDIS_REST_URL || ''
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN || ''

    if (!this.baseUrl || !this.token) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          '[ConcurrencyLock] Upstash Redis is required in production but not configured. ' +
          'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
        )
      }
      console.warn('[ConcurrencyLock] Upstash Redis not configured. Locks will not work across instances.')
    }
  }

  /**
   * Acquire a distributed lock
   * @param key - Unique lock key (e.g., 'matching_refresh:userId')
   * @param ttlSeconds - Time-to-live in seconds (lock auto-expires after this time)
   * @returns true if lock was acquired, false if lock already exists
   */
  async acquire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.baseUrl || !this.token) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('[ConcurrencyLock] Upstash Redis not configured in production')
      }
      // In development without Redis, allow the operation (no distributed locking)
      return true
    }

    try {
      // Use SET with NX and EX: SET key "locked" EX ttlSeconds NX
      // NX = only set if key doesn't exist
      // EX = set expiration in seconds
      // Returns "OK" if lock acquired, null if key already exists
      // Upstash REST API format: POST /pipeline with command array
      const response = await fetch(`${this.baseUrl}/pipeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          ['SET', key, 'locked', 'EX', ttlSeconds, 'NX']
        ]),
        next: { revalidate: 0 } // Don't cache lock operations
      })

      if (!response.ok) {
        throw new Error(`Upstash Redis SETNX failed: ${response.statusText}`)
      }

      const data = await response.json()
      // Pipeline returns array of results, first element is the SET result
      // SET with NX returns "OK" if lock was acquired, null if key already exists
      const result = Array.isArray(data.result) ? data.result[0] : data.result
      return result === 'OK'
    } catch (error) {
      console.error('[ConcurrencyLock] Failed to acquire lock', error)
      // Fail-closed: if we can't check the lock, deny the operation
      // This prevents concurrent execution when lock system is unavailable
      throw new Error(`Failed to acquire distributed lock: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Release a distributed lock
   * @param key - Lock key to release
   */
  async release(key: string): Promise<void> {
    if (!this.baseUrl || !this.token) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('[ConcurrencyLock] Upstash Redis not configured in production')
      }
      // In development without Redis, nothing to release
      return
    }

    try {
      const response = await fetch(`${this.baseUrl}/del/${encodeURIComponent(key)}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        next: { revalidate: 0 }
      })

      // Ignore 404 errors (key doesn't exist - lock may have expired)
      if (!response.ok && response.status !== 404) {
        throw new Error(`Upstash Redis DEL failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('[ConcurrencyLock] Failed to release lock', error)
      // Don't throw on release errors - lock will expire naturally via TTL
      // Logging is sufficient
    }
  }

  /**
   * Check if a lock exists (without acquiring it)
   * @param key - Lock key to check
   * @returns true if lock exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    if (!this.baseUrl || !this.token) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('[ConcurrencyLock] Upstash Redis not configured in production')
      }
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/get/${encodeURIComponent(key)}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        next: { revalidate: 0 }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return false
        }
        throw new Error(`Upstash Redis GET failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.result !== null
    } catch (error) {
      console.error('[ConcurrencyLock] Failed to check lock existence', error)
      // Fail-closed: if we can't check, assume lock exists (safer)
      return true
    }
  }
}

// Shared lock instance (uses same Upstash Redis as rate limiting)
let sharedLockInstance: DistributedLock | null = null

/**
 * Get the shared distributed lock instance
 * Uses Upstash Redis in production, throws error if not configured
 */
export function getDistributedLock(): DistributedLock {
  if (!sharedLockInstance) {
    sharedLockInstance = new DistributedLock()
  }
  return sharedLockInstance
}

