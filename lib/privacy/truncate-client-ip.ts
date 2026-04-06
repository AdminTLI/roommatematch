import type { NextRequest } from 'next/server'

/**
 * Reduces identifiability of client IP addresses before we store them
 * (first-party analytics / consent audit logs).
 *
 * - IPv4: last octet replaced with 0 (e.g. 203.0.113.44 → 203.0.113.0).
 * - IPv6: first four 16-bit groups kept, remainder dropped (abbreviated with ::).
 */

export function truncateClientIp(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== 'string') {
    return null
  }

  const firstHop = raw.split(',')[0]?.trim()
  if (!firstHop) {
    return null
  }

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/.exec(firstHop)
  if (ipv4) {
    return `${ipv4[1]}.${ipv4[2]}.${ipv4[3]}.0`
  }

  if (firstHop.includes(':')) {
    const parts = firstHop.split(':').filter((p) => p.length > 0)
    if (parts.length === 0) {
      return null
    }
    const prefix = parts.slice(0, Math.min(4, parts.length)).join(':')
    return `${prefix}::`
  }

  return null
}

/** Best-effort client IP from edge headers, then truncated for storage. */
export function getTruncatedClientIpFromNextRequest(request: NextRequest): string | null {
  const raw =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null
  return truncateClientIp(raw)
}
