import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'

const ALLOWED_REASON_CATEGORIES = [
  'no_house',
  'incompatible_lifestyle',
  'unresponsive',
  'other',
] as const

type ReasonCategory = (typeof ALLOWED_REASON_CATEGORIES)[number]

interface UnmatchBody {
  targetUserId?: string
  reason_category?: string
  reason_text?: string | null
}

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

    // Rate limiting: protect from abuse
    const rateLimitKey = getUserRateLimitKey('unmatch', user.id)
    const rateLimitResult = await checkRateLimit('unmatch', rateLimitKey)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = (await request.json()) as UnmatchBody
    const targetUserId = body.targetUserId
    const reasonCategory = body.reason_category
    const reasonText = body.reason_text ?? null

    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json(
        { error: 'targetUserId is required' },
        { status: 400 }
      )
    }

    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'You cannot unmatch yourself' },
        { status: 400 }
      )
    }

    if (!reasonCategory || typeof reasonCategory !== 'string') {
      return NextResponse.json(
        { error: 'reason_category is required' },
        { status: 400 }
      )
    }

    if (!ALLOWED_REASON_CATEGORIES.includes(reasonCategory as ReasonCategory)) {
      return NextResponse.json(
        { error: 'Invalid reason_category' },
        { status: 400 }
      )
    }

    if (
      reasonCategory === 'other' &&
      (!reasonText || typeof reasonText !== 'string' || !reasonText.trim())
    ) {
      return NextResponse.json(
        { error: 'reason_text is required when reason_category is "other"' },
        { status: 400 }
      )
    }

    // Call server-side helper that:
    // - Records feedback
    // - Marks matches as unmatched
    // - Adds mutual blocklist entries
    // - Removes both users from any 1:1 chats they share
    const { error: rpcError } = await supabase.rpc('unmatch_pair', {
      p_unmatcher_id: user.id,
      p_unmatched_user_id: targetUserId,
      p_reason_category: reasonCategory,
      p_reason_text: reasonText,
    })

    if (rpcError) {
      safeLogger.error('[Unmatch] Failed to unmatch pair via RPC', {
        error: rpcError,
        userId: user.id,
        targetUserId,
      })
      return NextResponse.json(
        { error: 'Failed to process unmatch request' },
        { status: 500 }
      )
    }

    safeLogger.info('[Unmatch] Users unmatched successfully', {
      unmatcherId: user.id,
      unmatchedUserId: targetUserId,
      reasonCategory,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    safeLogger.error('[Unmatch] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

