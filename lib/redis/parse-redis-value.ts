/**
 * Upstash Redis may return JSON strings or already-deserialized objects depending on
 * how the value was written. Normalize before use.
 */
export function parseRedisJsonValue<T>(value: unknown): T | null {
  if (value == null) return null

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }

  if (typeof value === 'object') {
    return value as T
  }

  return null
}
