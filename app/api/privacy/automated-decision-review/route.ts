import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { safeLogger } from '@/lib/utils/logger'

/**
 * POST /api/privacy/automated-decision-review
 * GDPR Art. 22 — request explanation or human review of a match suggestion.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const {
      match_suggestion_id,
      other_user_id,
      reason,
      details,
    } = body as {
      match_suggestion_id?: string
      other_user_id?: string
      reason?: string
      details?: string
    }

    if (!details?.trim() && !reason?.trim()) {
      return NextResponse.json(
        { error: 'Please describe your question or concern about the match.' },
        { status: 400 }
      )
    }

    const admin = createServiceClient()

    const { data: existing } = await admin
      .from('dsar_requests')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('request_type', 'automated_decision_review')
      .in('status', ['pending', 'in_progress'])
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'You already have an open review request. We will respond within one month.',
        request_id: existing.id,
      })
    }

    const metadata = {
      match_suggestion_id: match_suggestion_id || null,
      other_user_id: other_user_id || null,
      reason: reason || 'general',
      details: details?.trim() || null,
      source: 'privacy_automated_decision_review_api',
    }

    const { data: dsarRequest, error: insertError } = await admin
      .from('dsar_requests')
      .insert({
        user_id: user.id,
        request_type: 'automated_decision_review',
        status: 'pending',
        processing_metadata: metadata,
      })
      .select('id, sla_deadline, requested_at')
      .single()

    if (insertError || !dsarRequest) {
      throw new Error(insertError?.message || 'Failed to create request')
    }

    safeLogger.info('[Art22] Automated decision review requested', {
      requestId: dsarRequest.id,
      userId: user.id,
    })

    return NextResponse.json({
      success: true,
      message:
        'Your request for human review has been received. We aim to respond within one month as required by GDPR.',
      request_id: dsarRequest.id,
      sla_deadline: dsarRequest.sla_deadline,
    })
  } catch (error) {
    safeLogger.error('[Art22] Failed to create review request', error)
    return NextResponse.json(
      {
        error: 'Failed to submit request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
