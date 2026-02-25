import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

const MIN_ACCOUNT_AGE_DAYS = 14

type SuccessStatus = 'domu_match' | 'external' | 'still_looking'
type FeedbackStatus = 'completed' | 'dismissed'

interface UserRow {
  created_at: string
}

/** GET: Check if the authenticated user should see the platform success & NPS micro-survey. */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: userRow, error: userError } = await admin
      .from('users')
      .select('created_at')
      .eq('id', user.id)
      .maybeSingle<UserRow>()

    if (userError || !userRow?.created_at) {
      safeLogger.warn('[PlatformFeedback] Could not get user created_at', {
        userId: user.id,
        error: userError,
      })
      return NextResponse.json({ shouldShow: false })
    }

    const createdAt = new Date(userRow.created_at)
    const now = new Date()
    const diffMs = now.getTime() - createdAt.getTime()
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))

    if (days < MIN_ACCOUNT_AGE_DAYS) {
      return NextResponse.json({ shouldShow: false })
    }

    const { data: existing, error: feedbackError } = await admin
      .from('platform_feedback')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (feedbackError) {
      safeLogger.error('[PlatformFeedback] Failed to check existing feedback', {
        error: feedbackError,
        userId: user.id,
      })
      return NextResponse.json({ shouldShow: false })
    }

    if (existing) {
      return NextResponse.json({ shouldShow: false })
    }

    return NextResponse.json({ shouldShow: true })
  } catch (error) {
    safeLogger.error('[PlatformFeedback] GET error', { error })
    return NextResponse.json(
      { error: 'Failed to check platform feedback eligibility' },
      { status: 500 }
    )
  }
}

/** POST: Submit a platform success & NPS micro-survey response. */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)

    const rawSuccessStatus = body?.success_status as SuccessStatus | null | undefined
    const rawNpsScore = body?.nps_score as number | null | undefined
    const rawReason = body?.reason
    const rawStatus = body?.status as FeedbackStatus | null | undefined

    if (rawStatus !== 'completed' && rawStatus !== 'dismissed') {
      return NextResponse.json(
        { error: 'Invalid or missing status; must be "completed" or "dismissed"' },
        { status: 400 }
      )
    }

    let success_status: SuccessStatus | null = null
    if (rawSuccessStatus !== null && rawSuccessStatus !== undefined) {
      if (!['domu_match', 'external', 'still_looking'].includes(rawSuccessStatus)) {
        return NextResponse.json(
          { error: 'Invalid success_status; must be "domu_match", "external", or "still_looking"' },
          { status: 400 }
        )
      }
      success_status = rawSuccessStatus
    }

    let nps_score: number | null = null
    if (rawNpsScore !== null && rawNpsScore !== undefined) {
      if (
        typeof rawNpsScore !== 'number' ||
        !Number.isInteger(rawNpsScore) ||
        rawNpsScore < 0 ||
        rawNpsScore > 10
      ) {
        return NextResponse.json(
          { error: 'nps_score must be an integer between 0 and 10' },
          { status: 400 }
        )
      }
      nps_score = rawNpsScore
    }

    let reason: string | null = null
    if (typeof rawReason === 'string') {
      const trimmed = rawReason.trim()
      reason = trimmed.length > 0 ? trimmed.slice(0, 2000) : null
    } else if (rawReason !== null && rawReason !== undefined) {
      return NextResponse.json(
        { error: 'reason must be a string if provided' },
        { status: 400 }
      )
    }

    const { error: insertError } = await supabase.from('platform_feedback').insert({
      user_id: user.id,
      success_status,
      nps_score,
      reason,
      status: rawStatus,
    })

    if (insertError) {
      if ((insertError as any).code === '23505') {
        return NextResponse.json(
          { error: 'You have already submitted platform feedback' },
          { status: 409 }
        )
      }

      safeLogger.error('[PlatformFeedback] POST insert error', {
        error: insertError,
        userId: user.id,
      })
      return NextResponse.json(
        { error: 'Failed to save platform feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    safeLogger.error('[PlatformFeedback] POST error', { error })
    return NextResponse.json(
      { error: 'Failed to submit platform feedback' },
      { status: 500 }
    )
  }
}

