import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  checkRateLimit,
  getClientIp,
  getIPRateLimitKey,
  buildRateLimitHeaders,
} from '@/lib/rate-limit'
import { safeLogger } from '@/lib/utils/logger'

export const runtime = 'nodejs'

/** In-memory cache: submissions count + 10, refreshed every 60s. */
let cachedCount: number | null = null
let cachedAt = 0
const CACHE_TTL_MS = 60_000
const MATCH_COUNT_OFFSET = 10

async function fetchMatchCount(): Promise<number> {
  const now = Date.now()
  if (cachedCount !== null && now - cachedAt < CACHE_TTL_MS) {
    return cachedCount
  }

  const supabase = createServiceClient()
  const { count, error } = await supabase
    .from('onboarding_submissions')
    .select('user_id', { count: 'exact', head: true })

  if (error) {
    safeLogger.error('[vibe-check/match-count] query failed', error)
    // Fall back to cached value or a sensible floor so the UI still reveals.
    if (cachedCount !== null) return cachedCount
    return MATCH_COUNT_OFFSET
  }

  const total = (count ?? 0) + MATCH_COUNT_OFFSET
  cachedCount = total
  cachedAt = now
  return total
}

export async function GET(req: NextRequest) {
  try {
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      const ip = getClientIp(req)
      const result = await checkRateLimit(
        'matching',
        getIPRateLimitKey('vibe_check_match_count', ip)
      )
      if (!result.allowed) {
        return NextResponse.json(
          { error: 'Too many requests' },
          {
            status: 429,
            headers: buildRateLimitHeaders(20, result),
          }
        )
      }
    }

    const matchCount = await fetchMatchCount()
    return NextResponse.json(
      { matchCount },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (err) {
    safeLogger.error('[vibe-check/match-count] unexpected', err)
    return NextResponse.json(
      { matchCount: MATCH_COUNT_OFFSET, error: 'unavailable' },
      { status: 200 }
    )
  }
}
