import type { Redis } from '@upstash/redis'
import { getOptionalRedis } from '@/lib/redis/optional-redis'

type CacheOptions = {
  /** Cache key namespace/prefix (e.g. "inst", "programmes"). */
  namespace: string
  /** TTL in seconds. */
  ttlSeconds: number
  /**
   * If true, cache is bypassed (but still computed and returned).
   * Useful for debugging or emergency toggles.
   */
  bypass?: boolean
  /**
   * If true, cache errors are swallowed and `fn()` result is returned.
   * For read-heavy institutional data, this should generally be true.
   */
  failOpen?: boolean
}

function buildKey(namespace: string, key: string): string {
  return `cache:${namespace}:${key}`
}

async function getJson<T>(redis: Redis, key: string): Promise<T | null> {
  const v = await redis.get<string>(key)
  if (!v) return null
  try {
    return JSON.parse(v) as T
  } catch {
    return null
  }
}

async function setJson(redis: Redis, key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const payload = JSON.stringify(value)
  if (ttlSeconds > 0) {
    await redis.set(key, payload, { ex: ttlSeconds })
  } else {
    await redis.set(key, payload)
  }
}

/**
 * Redis-backed cache wrapper for expensive read-heavy data.
 *
 * Notes:
 * - Designed for server-side usage (API routes, server actions, cron).
 * - Returns fresh data from `fn()` if Redis is unavailable.
 */
export async function withRedisCache<T>(
  cacheKey: string,
  options: CacheOptions,
  fn: () => Promise<T>
): Promise<T> {
  const { namespace, ttlSeconds, bypass, failOpen = true } = options
  if (bypass) return fn()

  const redis = getOptionalRedis()
  if (!redis) return fn()

  const key = buildKey(namespace, cacheKey)

  try {
    const cached = await getJson<T>(redis, key)
    if (cached !== null) return cached

    const fresh = await fn()
    // Best-effort cache set; don't fail request if set fails.
    try {
      await setJson(redis, key, fresh, ttlSeconds)
    } catch {
      // ignore
    }
    return fresh
  } catch (e) {
    if (!failOpen) throw e
    return fn()
  }
}

