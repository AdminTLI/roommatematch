import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { trackEvent, EVENT_TYPES } from '@/lib/events'
import { requireVerifiedStudent } from '@/lib/lab/auth'
import { requireDomuLabEnabled } from '@/lib/lab/guard'
import { isValidLabVoteIntensity } from '@/lib/lab/validation'
import { safeLogger } from '@/lib/utils/logger'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const disabled = requireDomuLabEnabled()
  if (disabled) return disabled

  try {
    const { id: wishId } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verified = await requireVerifiedStudent(supabase, user.id)
    if (!verified.ok) {
      return NextResponse.json(
        { error: verified.error },
        { status: verified.status }
      )
    }

    const rateLimitKey = getUserRateLimitKey('lab_votes', user.id)
    const rateLimitResult = await checkRateLimit('lab_votes', rateLimitKey)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many votes. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const intensity =
      typeof body.intensity === 'string' &&
      isValidLabVoteIntensity(body.intensity)
        ? body.intensity
        : 'use_this'

    const { data: wish } = await supabase
      .from('lab_wishes')
      .select('id, user_id, status, merged_into_id')
      .eq('id', wishId)
      .maybeSingle()

    if (!wish || wish.merged_into_id) {
      return NextResponse.json({ error: 'Wish not found' }, { status: 404 })
    }

    if (wish.user_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot vote on your own wish' },
        { status: 400 }
      )
    }

    if (!['open', 'looking'].includes(wish.status)) {
      return NextResponse.json(
        { error: 'This wish is no longer open for votes' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('lab_wish_votes').upsert(
      {
        wish_id: wishId,
        user_id: user.id,
        intensity,
      },
      { onConflict: 'wish_id,user_id' }
    )

    if (error) {
      safeLogger.error('[DomuLab] Vote upsert failed', { error })
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      )
    }

    await trackEvent(
      EVENT_TYPES.LAB_WISH_VOTED,
      { wish_id: wishId, intensity },
      user.id
    )

    const { data: updated } = await supabase
      .from('lab_wishes')
      .select('vote_count, use_this_count')
      .eq('id', wishId)
      .single()

    return NextResponse.json({
      ok: true,
      vote_count: updated?.vote_count ?? 0,
      use_this_count: updated?.use_this_count ?? 0,
      user_vote_intensity: intensity,
    })
  } catch (error) {
    safeLogger.error('[DomuLab] POST vote error', { error })
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const disabled = requireDomuLabEnabled()
  if (disabled) return disabled

  try {
    const { id: wishId } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('lab_wish_votes')
      .delete()
      .eq('wish_id', wishId)
      .eq('user_id', user.id)

    if (error) {
      safeLogger.error('[DomuLab] Vote delete failed', { error })
      return NextResponse.json(
        { error: 'Failed to remove vote' },
        { status: 500 }
      )
    }

    const { data: updated } = await supabase
      .from('lab_wishes')
      .select('vote_count, use_this_count')
      .eq('id', wishId)
      .single()

    return NextResponse.json({
      ok: true,
      vote_count: updated?.vote_count ?? 0,
      use_this_count: updated?.use_this_count ?? 0,
      user_vote_intensity: null,
    })
  } catch (error) {
    safeLogger.error('[DomuLab] DELETE vote error', { error })
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    )
  }
}
