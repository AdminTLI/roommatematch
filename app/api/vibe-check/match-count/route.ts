import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  checkRateLimit,
  getClientIp,
  getIPRateLimitKey,
  buildRateLimitHeaders,
} from '@/lib/rate-limit'
import { safeLogger } from '@/lib/utils/logger'
import { LIFESTYLE_FIT_COUNT_OFFSET } from '@/lib/vibe-check/lifestyle-fit'

export const runtime = 'nodejs'

/** In-memory cache: vibe-check submissions + offset, refreshed every 5s. */
let cachedCount: number | null = null
let cachedAt = 0
const CACHE_TTL_MS = 5_000

async function fetchMatchCount(): Promise<number> {
  const now = Date.now()
  if (cachedCount !== null && now - cachedAt < CACHE_TTL_MS) {
    return cachedCount
  }

  const supabase = createServiceClient()
  const { count, error } = await supabase
    .from('vibe_check_responses')
    .select('id', { count: 'exact', head: true })

  if (error) {
    safeLogger.error('[vibe-check/match-count] query failed', error)
    // Fall back to cached value or the floor so the UI still reveals.
    if (cachedCount !== null) return cachedCount
    return LIFESTYLE_FIT_COUNT_OFFSET
  }

  const total = (count ?? 0) + LIFESTYLE_FIT_COUNT_OFFSET
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
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
        },
      }
    )
  } catch (err) {
    safeLogger.error('[vibe-check/match-count] unexpected', err)
    return NextResponse.json(
      { matchCount: LIFESTYLE_FIT_COUNT_OFFSET, error: 'unavailable' },
      { status: 200 }
    )
  }
}
