import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { trackEvent, EVENT_TYPES } from '@/lib/events'
import { getLabUserContext, requireVerifiedStudent } from '@/lib/lab/auth'
import { moderateLabWish } from '@/lib/lab/moderation'
import { requireDomuLabEnabled } from '@/lib/lab/guard'
import type { LabWishPublic, LabVoteIntensity } from '@/lib/lab/types'
import { safeLogger } from '@/lib/utils/logger'

function mapWishRow(
  row: Record<string, unknown>,
  userVote: LabVoteIntensity | null
): LabWishPublic {
  return {
    id: row.id as string,
    title: row.title as string,
    body: row.body as string,
    status: row.status as LabWishPublic['status'],
    vote_count: row.vote_count as number,
    use_this_count: row.use_this_count as number,
    focus_group_opt_in: row.focus_group_opt_in as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    user_vote_intensity: userVote,
  }
}

export async function GET(request: NextRequest) {
  const disabled = requireDomuLabEnabled()
  if (disabled) return disabled

  try {
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

    const sort =
      request.nextUrl.searchParams.get('sort') === 'new' ? 'new' : 'top'

    const admin = createAdminClient()
    let query = admin
      .from('lab_wishes')
      .select(
        'id, title, body, status, vote_count, use_this_count, focus_group_opt_in, created_at, updated_at'
      )
      .is('merged_into_id', null)
      .neq('status', 'wont_do')

    if (sort === 'new') {
      query = query.order('created_at', { ascending: false })
    } else {
      query = query
        .order('use_this_count', { ascending: false })
        .order('vote_count', { ascending: false })
        .order('created_at', { ascending: false })
    }

    const { data: wishes, error } = await query.limit(100)
    if (error) {
      safeLogger.error('[DomuLab] Failed to list wishes', { error })
      const code = (error as { code?: string }).code
      if (code === 'PGRST205') {
        return NextResponse.json(
          {
            error:
              'Domu Lab is still setting up. Please refresh the page in a moment.',
            retryable: true,
          },
          { status: 503 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to load wishes' },
        { status: 500 }
      )
    }

    const wishIds = (wishes ?? []).map(w => w.id)
    const voteMap = new Map<string, LabVoteIntensity>()

    if (wishIds.length > 0) {
      const { data: votes } = await admin
        .from('lab_wish_votes')
        .select('wish_id, intensity')
        .eq('user_id', user.id)
        .in('wish_id', wishIds)

      for (const v of votes ?? []) {
        voteMap.set(v.wish_id, v.intensity as LabVoteIntensity)
      }
    }

    const mapped = (wishes ?? []).map(w =>
      mapWishRow(w as Record<string, unknown>, voteMap.get(w.id) ?? null)
    )

    return NextResponse.json({ wishes: mapped })
  } catch (error) {
    safeLogger.error('[DomuLab] GET wishes error', { error })
    return NextResponse.json(
      { error: 'Failed to load wishes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const disabled = requireDomuLabEnabled()
  if (disabled) return disabled

  try {
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

    const ctx = await getLabUserContext(supabase, user.id)
    if (!ctx) {
      return NextResponse.json(
        { error: 'University profile required to post wishes' },
        { status: 403 }
      )
    }

    const rateLimitKey = getUserRateLimitKey('lab_wishes', user.id)
    const rateLimitResult = await checkRateLimit('lab_wishes', rateLimitKey)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many wishes. Please try again later.',
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const title = typeof body.title === 'string' ? body.title : ''
    const wishBody = typeof body.body === 'string' ? body.body : ''
    const focusGroupOptIn = body.focus_group_opt_in === true

    const moderated = moderateLabWish(title, wishBody)
    if (!moderated.ok) {
      return NextResponse.json({ error: moderated.error }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: inserted, error } = await admin
      .from('lab_wishes')
      .insert({
        user_id: user.id,
        university_id: ctx.universityId,
        title: moderated.title,
        body: moderated.body,
        focus_group_opt_in: focusGroupOptIn,
        status: 'open',
      })
      .select(
        'id, title, body, status, vote_count, use_this_count, focus_group_opt_in, created_at, updated_at'
      )
      .single()

    if (error || !inserted) {
      safeLogger.error('[DomuLab] Insert wish failed', { error })
      return NextResponse.json(
        { error: 'Failed to create wish' },
        { status: 500 }
      )
    }

    await trackEvent(
      EVENT_TYPES.LAB_WISH_CREATED,
      {
        wish_id: inserted.id,
        focus_group_opt_in: focusGroupOptIn,
      },
      user.id
    )

    return NextResponse.json({
      wish: mapWishRow(inserted as Record<string, unknown>, null),
    })
  } catch (error) {
    safeLogger.error('[DomuLab] POST wish error', { error })
    return NextResponse.json(
      { error: 'Failed to create wish' },
      { status: 500 }
    )
  }
}
