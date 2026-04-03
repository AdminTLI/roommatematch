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
  return { url, token }
}

export function hasUpstashRedisRestEnv(): boolean {
  return getUpstashRedisRestCredentials() !== null
}
