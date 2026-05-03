import { Redis } from '@upstash/redis'
import { hasUpstashRedisRestEnv } from '@/lib/upstash-env'

let cachedRedis: Redis | null | undefined

/**
 * Build-safe, optional Upstash Redis client.
 *
 * - Returns null when env is not configured (local dev).
 * - Never throws; failures result in null so callers can decide fallback behavior.
 */
export function getOptionalRedis(): Redis | null {
  if (cachedRedis !== undefined) return cachedRedis

  if (!hasUpstashRedisRestEnv()) {
    cachedRedis = null
    return null
  }

  try {
    cachedRedis = Redis.fromEnv()
    return cachedRedis
  } catch {
    cachedRedis = null
    return null
  }
}

