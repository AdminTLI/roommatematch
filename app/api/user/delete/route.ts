/**
 * DELETE /api/user/delete
 *
 * Account deletion with retention flow & exit survey.
 * Implements GDPR Right to Erasure (Art. 17) with:
 * - Exit survey capture (no user_id link - GDPR compliant)
 * - 30-day grace period before permanent erasure (AVG/GDPR)
 * - Automated hard delete via /api/cron/maintenance (Supabase pg_cron)
 * - Block deletion if active agreement disputes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { safeLogger } from '@/lib/utils/logger'
import {
  ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
  scheduleAccountDeletion,
} from '@/lib/privacy/account-deletion'

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

    // ─── Step 4: Schedule GDPR deletion (30-day grace; hard delete via maintenance cron) ─
    const scheduled = await scheduleAccountDeletion({
      adminClient,
      userId: user.id,
      reason: survey_reason,
      metadata: {
        source: 'delete_account_ui',
        survey_reason: survey_reason.slice(0, 100),
        is_win: isWin,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      },
    })

    // Mark auth user so middleware can block re-login during grace period
    const { error: metadataError } = await adminClient.auth.admin.updateUserById(user.id, {
      app_metadata: {
        deletion_scheduled_at: scheduled.deletionScheduledAt,
        deletion_request_id: scheduled.requestId,
      },
    })
    if (metadataError) {
      safeLogger.warn('[DeleteAccount] Failed to set deletion app_metadata', {
        error: metadataError,
        userId: user.id,
      })
    }

    safeLogger.info('[DeleteAccount] Deletion scheduled', {
      userId: user.id,
      requestId: scheduled.requestId,
      deletionScheduledAt: scheduled.deletionScheduledAt,
      surveyReason: survey_reason,
      isWin,
    })

    return NextResponse.json({
      success: true,
      scheduled: true,
      request_id: scheduled.requestId,
      deletion_scheduled_at: scheduled.deletionScheduledAt,
      grace_period_days: scheduled.gracePeriodDays,
      message: `Your account is scheduled for permanent deletion on ${new Date(scheduled.deletionScheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
      note: `Per GDPR/AVG we allow a ${ACCOUNT_DELETION_GRACE_PERIOD_DAYS}-day grace period before permanent erasure. Contact support before that date if you wish to cancel. Verification documents may be retained for up to 4 weeks after verification as required by Dutch law.`,
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
