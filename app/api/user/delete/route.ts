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

    let adminClient
    try {
      adminClient = createServiceClient()
    } catch (serviceError) {
      safeLogger.error('[DeleteAccount] Service client failed', { error: serviceError })
      return NextResponse.json(
        {
          error: 'Deletion failed',
          message: 'Server configuration error. Please try again or contact support.',
        },
        { status: 500 }
      )
    }

    // ─── Step 1: Check active disputes (block deletion) ────────────────────────
    let hasActiveDisputes = false
    try {
      const { data: disputes } = await adminClient
        .from('agreement_disputes')
        .select('id')
        .eq('reported_by', user.id)
        .in('status', ['open', 'under_review', 'escalated'])
      hasActiveDisputes = !!(disputes && disputes.length > 0)
    } catch (disputesErr) {
      safeLogger.warn('[DeleteAccount] Could not check disputes (table may be missing)', {
        error: disputesErr,
        userId: user.id,
      })
      // Allow deletion to proceed if we can't check (e.g. table missing)
    }

    if (hasActiveDisputes) {
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

    // ─── Step 3: Save exit survey (best-effort; don't block deletion) ───────────
    const isWin = WIN_REASONS.some((r) =>
      survey_reason.toLowerCase().includes(r)
    )
    try {
      const { error: surveyError } = await adminClient.from('exit_surveys').insert({
        survey_reason: survey_reason.slice(0, 100),
        survey_comment: survey_comment?.slice(0, 2000) || null,
        is_win: isWin,
        demographics,
      })
      if (surveyError) {
        safeLogger.warn('[DeleteAccount] Failed to save exit survey (continuing)', {
          error: surveyError,
          userId: user.id,
        })
      }
    } catch (surveyErr) {
      safeLogger.warn('[DeleteAccount] Exit survey insert failed (table may be missing)', {
        error: surveyErr,
        userId: user.id,
      })
    }

    // ─── Step 4: Anonymize questionnaire responses (best-effort) ─────────────────
    try {
      const { error: respError } = await adminClient
        .from('responses')
        .update({ user_id: null })
        .eq('user_id', user.id)
      if (respError) {
        safeLogger.warn('[DeleteAccount] Failed to anonymize responses', {
          error: respError,
          userId: user.id,
        })
      }
    } catch (respErr) {
      safeLogger.warn('[DeleteAccount] Responses anonymization failed', {
        error: respErr,
        userId: user.id,
      })
    }

    // ─── Step 5: Anonymize chat messages (best-effort) ──────────────────────────
    try {
      const { error: msgError } = await adminClient
        .from('messages')
        .update({ user_id: null })
        .eq('user_id', user.id)
      if (msgError) {
        safeLogger.warn('[DeleteAccount] Failed to anonymize messages', {
          error: msgError,
          userId: user.id,
        })
      }
    } catch (msgErr) {
      safeLogger.warn('[DeleteAccount] Messages anonymization failed', {
        error: msgErr,
        userId: user.id,
      })
    }

    // ─── Step 6: Delete user_vectors (best-effort) ─────────────────────────────
    try {
      await adminClient.from('user_vectors').delete().eq('user_id', user.id)
    } catch (vecErr) {
      safeLogger.warn('[DeleteAccount] user_vectors delete failed', {
        error: vecErr,
        userId: user.id,
      })
    }

    // ─── Step 7: Delete public.users row first (triggers cascade cleanup, avoids Auth "Database error deleting user") ─
    // Supabase Auth's deleteUser can fail with "Database error deleting user" when public schema still references auth.users.
    // Deleting public.users first runs the BEFORE DELETE trigger (profiles, responses, etc.) so auth.users delete succeeds.
    try {
      const { error: usersDeleteError } = await adminClient
        .from('users')
        .delete()
        .eq('id', user.id)
      if (usersDeleteError) {
        safeLogger.warn('[DeleteAccount] public.users delete failed (will still try auth delete)', {
          error: usersDeleteError,
          userId: user.id,
        })
      }
    } catch (usersErr) {
      safeLogger.warn('[DeleteAccount] public.users delete threw', {
        error: usersErr,
        userId: user.id,
      })
    }

    // ─── Step 8: Delete auth user (required) ─
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    )

    if (authDeleteError) {
      safeLogger.error('[DeleteAccount] Failed to delete auth user', {
        error: authDeleteError,
        userId: user.id,
      })
      const authErrMsg = authDeleteError.message || 'Could not complete account deletion.'
      return NextResponse.json(
        {
          error: 'Deletion failed',
          message: process.env.NODE_ENV === 'development' ? authErrMsg : 'Could not complete account deletion. Please try again or contact support.',
          debug: process.env.NODE_ENV === 'development' ? authErrMsg : undefined,
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
    const rawMessage = error instanceof Error ? error.message : 'An unexpected error occurred.'
    return NextResponse.json(
      {
        error: 'Deletion failed',
        message: process.env.NODE_ENV === 'development' ? rawMessage : 'Account deletion failed. Please try again or contact support.',
        debug: process.env.NODE_ENV === 'development' ? rawMessage : undefined,
      },
      { status: 500 }
    )
  }
}
