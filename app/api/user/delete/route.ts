/**
 * DELETE /api/user/delete
 *
 * Account deletion with retention flow & exit survey.
 * Implements GDPR Right to Erasure (Art. 17) with:
 * - Exit survey capture (no user_id link - GDPR compliant)
 * - PII removal (hard delete)
 * - Data anonymization for business intelligence (questionnaire answers for matching algorithm)
 * - Chat scrubbing (sender_id -> NULL, preserve context for recipient)
 * - Block deletion if active agreement disputes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { safeLogger } from '@/lib/utils/logger'

/** Survey reasons that count as "win" for analytics */
const WIN_REASONS = ['found_room']

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { survey_reason, survey_comment } = body as {
      survey_reason?: string
      survey_comment?: string
    }

    if (!survey_reason || typeof survey_reason !== 'string') {
      return NextResponse.json(
        { error: 'Survey reason is required', message: 'Please select a reason for leaving.' },
        { status: 400 }
      )
    }

    const adminClient = createServiceClient()

    // ─── Step 1: Check active disputes (block deletion) ────────────────────────
    const { data: disputes } = await adminClient
      .from('agreement_disputes')
      .select('id')
      .eq('reported_by', user.id)
      .in('status', ['open', 'under_review', 'escalated'])

    if (disputes && disputes.length > 0) {
      return NextResponse.json(
        {
          error: 'Active disputes',
          message: 'Please resolve active disputes before deleting your account.',
        },
        { status: 400 }
      )
    }

    // ─── Step 2: Fetch anonymized demographics (for exit survey stats) ──────────
    let demographics: Record<string, unknown> = {}
    try {
      const { data: academic } = await adminClient
        .from('user_academic')
        .select('degree_level, study_start_year, expected_graduation_year')
        .eq('user_id', user.id)
        .maybeSingle()
      if (academic) {
        const currentYear = new Date().getFullYear()
        const startYear = academic.study_start_year ?? currentYear
        const endYear = academic.expected_graduation_year ?? currentYear + 3
        const studyYear = Math.min(
          Math.max(1, currentYear - startYear + 1),
          endYear - startYear + 1
        )
        demographics = {
          degree_level: academic.degree_level,
          study_year: studyYear,
        }
      }
    } catch {
      // Non-critical
    }

    // ─── Step 3: Save exit survey (BEFORE any deletion - no user_id link) ───────
    const isWin = WIN_REASONS.some((r) =>
      survey_reason.toLowerCase().includes(r)
    )
    const { error: surveyError } = await adminClient.from('exit_surveys').insert({
      survey_reason: survey_reason.slice(0, 100),
      survey_comment: survey_comment?.slice(0, 2000) || null,
      is_win: isWin,
      demographics,
    })

    if (surveyError) {
      safeLogger.error('[DeleteAccount] Failed to save exit survey', {
        error: surveyError,
        userId: user.id,
      })
      return NextResponse.json(
        { error: 'Failed to save survey', message: 'Please try again.' },
        { status: 500 }
      )
    }

    // ─── Step 4: Anonymize questionnaire responses (retain for matching) ─────────
    // GDPR Art. 17: anonymized data may be retained for business purposes.
    const { error: respError } = await adminClient
      .from('responses')
      .update({ user_id: null })
      .eq('user_id', user.id)

    if (respError) {
      safeLogger.error('[DeleteAccount] Failed to anonymize responses', {
        error: respError,
        userId: user.id,
      })
      return NextResponse.json(
        { error: 'Deletion failed', message: 'Could not anonymize data. Please try again.' },
        { status: 500 }
      )
    }

    // ─── Step 5: Anonymize chat messages (preserve context for recipient) ────────
    const { error: msgError } = await adminClient
      .from('messages')
      .update({ user_id: null })
      .eq('user_id', user.id)

    if (msgError) {
      safeLogger.error('[DeleteAccount] Failed to anonymize messages', {
        error: msgError,
        userId: user.id,
      })
      return NextResponse.json(
        { error: 'Deletion failed', message: 'Could not anonymize messages. Please try again.' },
        { status: 500 }
      )
    }

    // ─── Step 6: Delete user_vectors (cannot anonymize meaningfully) ─────────────
    await adminClient.from('user_vectors').delete().eq('user_id', user.id)

    // ─── Step 7: Delete auth user (cascades to users, profiles, etc.) ────────────
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    )

    if (authDeleteError) {
      safeLogger.error('[DeleteAccount] Failed to delete auth user', {
        error: authDeleteError,
        userId: user.id,
      })
      return NextResponse.json(
        {
          error: 'Deletion failed',
          message: authDeleteError.message || 'Could not complete account deletion.',
        },
        { status: 500 }
      )
    }

    // Optional: Persona/ID verification cleanup webhook could be triggered here.
    // e.g. POST to Persona API to remove user from their system.

    safeLogger.info('[DeleteAccount] Account deleted successfully', {
      userId: user.id,
      surveyReason: survey_reason,
      isWin,
    })

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully.',
    })
  } catch (error) {
    safeLogger.error('[DeleteAccount] Unexpected error', error)
    return NextResponse.json(
      {
        error: 'Deletion failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      },
      { status: 500 }
    )
  }
}
