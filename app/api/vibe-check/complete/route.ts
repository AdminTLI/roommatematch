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
import { calculateArchetype } from '@/lib/vibe-check/archetype'
import { VIBE_CHECK_QUESTIONS } from '@/lib/vibe-check/questions'

export const runtime = 'nodejs'

const BodySchema = z.object({
  sessionId: z.string().min(1).max(120).optional(),
  responseId: z.string().uuid().optional(),
  university: z.string().min(1).max(200).optional(),
  universityOther: z.string().max(200).optional().nullable(),
  city: z.string().min(1).max(80).optional(),
  answers: z.record(z.string(), z.number().int().min(1).max(5)),
  lifestyleFitPercent: z.number().int().min(0).max(100).optional().nullable(),
  matchCount: z.number().int().min(0).max(1_000_000).optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      const ip = getClientIp(req)
      const result = await checkRateLimit(
        'onboarding_submit',
        getIPRateLimitKey('vibe_check_complete', ip)
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

    const {
      sessionId,
      responseId: existingResponseId,
      university,
      universityOther,
      city,
      answers,
      lifestyleFitPercent,
      matchCount,
    } = parsed.data

    const missing = VIBE_CHECK_QUESTIONS.filter((q) => typeof answers[q.id] !== 'number')
    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'Incomplete answers', missing: missing.map((q) => q.id) },
        { status: 400 }
      )
    }

    const archetype = calculateArchetype(answers)
    const supabase = createServiceClient()

    if (existingResponseId) {
      const { error: updateError } = await supabase
        .from('vibe_check_responses')
        .update({
          lifestyle_fit_percent: lifestyleFitPercent ?? null,
          match_count: matchCount ?? null,
          module_scores: archetype.scores,
          overall_harmony: archetype.overallHarmony,
          archetype_title: archetype.title,
        })
        .eq('id', existingResponseId)

      if (updateError) {
        safeLogger.error('[vibe-check/complete] update failed', updateError)
        return NextResponse.json({ error: 'Failed to update responses' }, { status: 500 })
      }

      return NextResponse.json({ success: true, responseId: existingResponseId })
    }

    const { data, error } = await supabase
      .from('vibe_check_responses')
      .insert({
        session_id: sessionId ?? null,
        university: university ?? null,
        university_other: universityOther ?? null,
        city: city ?? null,
        answers,
        module_scores: archetype.scores,
        archetype_title: archetype.title,
        overall_harmony: archetype.overallHarmony,
        lifestyle_fit_percent: lifestyleFitPercent ?? null,
        match_count: matchCount ?? null,
      })
      .select('id')
      .single()

    if (error) {
      safeLogger.error('[vibe-check/complete] insert failed', error)
      return NextResponse.json({ error: 'Failed to save responses' }, { status: 500 })
    }

    const responseId = data.id as string

    await supabase.from('vibe_check_events').insert({
      response_id: responseId,
      session_id: sessionId ?? null,
      event_name: 'vibe_check_completed',
      event_properties: {
        archetype: archetype.title,
        city: city ?? null,
      },
    })

    return NextResponse.json({ success: true, responseId })
  } catch (err) {
    safeLogger.error('[vibe-check/complete] unexpected', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
