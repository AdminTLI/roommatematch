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
  email: z.string().trim().email('Valid email required').max(254),
  feature: z.enum(['professional_signup']),
})

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rateLimit = await checkRateLimit('waitlist', getIPRateLimitKey('waitlist', ip))
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: buildRateLimitHeaders(5, rateLimit) }
      )
    }

    const json = await req.json().catch(() => null)
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
      return NextResponse.json(
        { error: firstError || 'Invalid request' },
        { status: 400 }
      )
    }

    const email = parsed.data.email.toLowerCase()
    const { feature } = parsed.data
    const supabase = createServiceClient()

    const { error } = await supabase.from('feature_waitlist').upsert(
      { feature, email },
      { onConflict: 'feature,email', ignoreDuplicates: true }
    )

    if (error) {
      safeLogger.error('[waitlist] insert failed', { error, feature })
      return NextResponse.json({ error: 'Failed to save your email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    safeLogger.error('[waitlist] unexpected', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
