import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import {
  checkRateLimit,
  getClientIp,
  getIPRateLimitKey,
  buildRateLimitHeaders,
} from '@/lib/rate-limit'
import { safeLogger } from '@/lib/utils/logger'
import { calculateModuleScores } from '@/lib/vibe-check/archetype'
import { VIBE_CHECK_QUESTIONS } from '@/lib/vibe-check/questions'
import {
  LIFESTYLE_FIT_COUNT_OFFSET,
  LIFESTYLE_FIT_THRESHOLD,
  buildVibeAnswerMapsFromSections,
  summarizeLifestyleFit,
} from '@/lib/vibe-check/lifestyle-fit'

export const runtime = 'nodejs'

const BodySchema = z.object({
  answers: z.record(z.string(), z.number().int().min(1).max(5)),
})

const VIBE_SECTIONS = [
  'environment-rhythms',
  'cleanliness-operations',
  'communication-resolution',
  'social-spaces',
] as const

/** Cache peer answer maps briefly (shared across visitors). */
let peerCache: Map<string, Record<string, number>> | null = null
let peerCacheAt = 0
const PEER_CACHE_TTL_MS = 60_000

async function loadPeerAnswerMaps(): Promise<Map<string, Record<string, number>>> {
  const now = Date.now()
  if (peerCache && now - peerCacheAt < PEER_CACHE_TTL_MS) {
    return peerCache
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('onboarding_sections')
    .select('user_id, section, answers')
    .in('section', [...VIBE_SECTIONS])
    .limit(8000)

  if (error) {
    safeLogger.error('[vibe-check/lifestyle-fit] sections query failed', error)
    throw error
  }

  const maps = buildVibeAnswerMapsFromSections(
    (data ?? []).map((row) => ({
      user_id: row.user_id as string,
      section: row.section as string,
      answers: row.answers,
    }))
  )

  peerCache = maps
  peerCacheAt = now
  return maps
}

export async function POST(req: NextRequest) {
  try {
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      const ip = getClientIp(req)
      const result = await checkRateLimit(
        'matching',
        getIPRateLimitKey('vibe_check_lifestyle_fit', ip)
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

    const json = await req.json().catch(() => null)
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { answers } = parsed.data
    const missing = VIBE_CHECK_QUESTIONS.filter((q) => typeof answers[q.id] !== 'number')
    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'Incomplete answers', missing: missing.map((q) => q.id) },
        { status: 400 }
      )
    }

    const visitorScores = calculateModuleScores(answers)

    let peerMaps: Map<string, Record<string, number>>
    try {
      peerMaps = await loadPeerAnswerMaps()
    } catch {
      return NextResponse.json({
        lifestyleFitPercent: Math.round(LIFESTYLE_FIT_THRESHOLD * 100),
        matchCount: LIFESTYLE_FIT_COUNT_OFFSET,
        comparedUsers: 0,
        realMatches: 0,
        cohortAverages: null,
        fallback: true,
      })
    }

    const summary = summarizeLifestyleFit(visitorScores, peerMaps)

    return NextResponse.json({
      lifestyleFitPercent: summary.lifestyleFitPercent,
      matchCount: summary.matchCount,
      comparedUsers: summary.comparedUsers,
      realMatches: summary.realMatches,
      cohortAverages: summary.cohortAverages,
    })
  } catch (err) {
    safeLogger.error('[vibe-check/lifestyle-fit] unexpected', err)
    return NextResponse.json({
      lifestyleFitPercent: Math.round(LIFESTYLE_FIT_THRESHOLD * 100),
      matchCount: LIFESTYLE_FIT_COUNT_OFFSET,
      comparedUsers: 0,
      realMatches: 0,
      cohortAverages: null,
      fallback: true,
    })
  }
}

/** Keep GET for backwards compatibility: submissions count + 10 (no personalization). */
export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { count } = await supabase
      .from('onboarding_submissions')
      .select('user_id', { count: 'exact', head: true })
    return NextResponse.json({
      matchCount: (count ?? 0) + LIFESTYLE_FIT_COUNT_OFFSET,
      lifestyleFitPercent: Math.round(LIFESTYLE_FIT_THRESHOLD * 100),
    })
  } catch {
    return NextResponse.json({
      matchCount: LIFESTYLE_FIT_COUNT_OFFSET,
      lifestyleFitPercent: Math.round(LIFESTYLE_FIT_THRESHOLD * 100),
    })
  }
}
