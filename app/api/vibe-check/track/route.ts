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

export const runtime = 'nodejs'

const BodySchema = z.object({
  eventName: z.enum([
    'vibe_check_meet_cta',
    'vibe_check_share',
    'vibe_check_download',
  ]),
  sessionId: z.string().min(1).max(120).optional(),
  responseId: z.string().uuid().optional().nullable(),
  properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      const ip = getClientIp(req)
      const result = await checkRateLimit(
        'matching',
        getIPRateLimitKey('vibe_check_track', ip)
      )
      if (!result.allowed) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429, headers: buildRateLimitHeaders(20, result) }
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

    const { eventName, sessionId, responseId, properties } = parsed.data
    const supabase = createServiceClient()

    const { error } = await supabase.from('vibe_check_events').insert({
      response_id: responseId ?? null,
      session_id: sessionId ?? null,
      event_name: eventName,
      event_properties: properties ?? {},
    })

    if (error) {
      safeLogger.error('[vibe-check/track] insert failed', error)
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    safeLogger.error('[vibe-check/track] unexpected', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
