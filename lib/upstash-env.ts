/**
 * Resolve Upstash Redis REST credentials from the environment.
 *
 * Vercel Marketplace / Upstash may expose either:
 * - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash console & our docs)
 * - KV_REST_API_URL + KV_REST_API_TOKEN (legacy Vercel KV-style names; @upstash/redis Redis.fromEnv() also reads these)
 */
export function getUpstashRedisRestCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || ''
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || ''
  if (!url || !token) return null
  // Treat env.example placeholder values as "not configured" (prevents noisy fetch failures in dev).
  const u = url.trim().toLowerCase()
  const t = token.trim().toLowerCase()
  if (
    u.includes('your-redis-instance') ||
    u.includes('upstash.io') && (t.includes('your_') || t.includes('your-') || t.includes('token_here'))
  ) {
    return null
  }
  return { url, token }
}

export function hasUpstashRedisRestEnv(): boolean {
  return getUpstashRedisRestCredentials() !== null
}
