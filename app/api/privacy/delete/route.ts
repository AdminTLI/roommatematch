import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { safeLogger } from '@/lib/utils/logger'
import {
  ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
  scheduleAccountDeletion,
} from '@/lib/privacy/account-deletion'

/**
 * POST /api/privacy/delete
 *
 * Request account deletion (GDPR Article 17 - Right to Erasure)
 * Schedules permanent erasure after a 30-day grace period (AVG/GDPR).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { confirm, reason } = body

    if (!confirm || confirm !== 'DELETE') {
      return NextResponse.json(
        {
          error: 'Confirmation required',
          message: 'Please type "DELETE" to confirm account deletion',
        },
        { status: 400 }
      )
    }

    const adminClient = createServiceClient()
    const scheduled = await scheduleAccountDeletion({
      adminClient,
      userId: user.id,
      reason: reason || 'User requested account deletion',
      metadata: {
        source: 'privacy_delete_api',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      },
    })

    const { error: metadataError } = await adminClient.auth.admin.updateUserById(user.id, {
      app_metadata: {
        deletion_scheduled_at: scheduled.deletionScheduledAt,
        deletion_request_id: scheduled.requestId,
      },
    })
    if (metadataError) {
      safeLogger.warn('[PrivacyDelete] Failed to set deletion app_metadata', {
        error: metadataError,
        userId: user.id,
      })
    }

    safeLogger.info('Account deletion requested', {
      requestId: scheduled.requestId,
      userId: user.id,
      scheduledAt: scheduled.deletionScheduledAt,
    })

    return NextResponse.json({
      success: true,
      message: 'Account deletion requested successfully',
      request_id: scheduled.requestId,
      deletion_scheduled_at: scheduled.deletionScheduledAt,
      grace_period_days: scheduled.gracePeriodDays,
      note: `Your account will be permanently deleted after the ${ACCOUNT_DELETION_GRACE_PERIOD_DAYS}-day grace period. Contact support before that date to cancel. Verification documents may be retained for up to 4 weeks after verification as required by Dutch law.`,
    })
  } catch (error) {
    safeLogger.error('Account deletion error', error)

    return NextResponse.json(
      {
        error: 'Failed to request account deletion',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/privacy/delete
 *
 * Immediate account deletion (admin only or after grace period).
 *
 * Security note: session authentication uses the cookie-scoped user client.
 * All privileged DB operations (deleting another user's rows, calling
 * auth.admin.deleteUser) MUST use the admin client (service-role key) because:
 *   1. The users table has no admin DELETE RLS policy — user-scoped deletes fail.
 *   2. auth.admin.deleteUser() requires the service-role key; calling it on the
 *      anon-key client returns a 403 and silently leaves the auth user intact,
 *      which would mark the DSAR as completed while the account remains active.
 */
export async function DELETE(req: NextRequest) {
  try {
    // Authenticate the requesting admin using the cookie-scoped client.
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin check via user-scoped client (RLS: admins can read their own row).
    const { data: adminCheck } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!adminCheck) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('user_id')

    if (!targetUserId) {
      return NextResponse.json({ error: 'user_id parameter required' }, { status: 400 })
    }

    // Use the service-role admin client for all privileged operations below.
    const adminClient = createAdminClient()

    const { data: deletionRequest } = await adminClient
      .from('dsar_requests')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('request_type', 'deletion')
      .eq('status', 'completed')
      .order('requested_at', { ascending: false })
      .limit(1)
      .single()

    if (!deletionRequest) {
      return NextResponse.json(
        { error: 'No deletion request found for this user' },
        { status: 404 }
      )
    }

    const scheduledAt = deletionRequest.deletion_scheduled_at
      ? new Date(deletionRequest.deletion_scheduled_at)
      : null

    if (scheduledAt && scheduledAt > new Date()) {
      return NextResponse.json(
        {
          error: 'Grace period not expired',
          message: `Account deletion is scheduled for ${scheduledAt.toISOString()}. Grace period must expire before permanent deletion.`,
        },
        { status: 400 }
      )
    }

    const { data: verifications } = await adminClient
      .from('verifications')
      .select('created_at, updated_at')
      .eq('user_id', targetUserId)
      .order('updated_at', { ascending: false })
      .limit(1)

    const latestVerificationDate = verifications?.[0]?.updated_at
      ? new Date(verifications[0].updated_at)
      : null

    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    // UAVG hard block: verification documents must be retained for 4 weeks per Dutch law.
    // The cron job enforces this automatically, but the admin-manual endpoint must also
    // block deletion during the retention window — otherwise cascade-delete on public.users
    // would wipe the verifications table despite the UAVG requirement.
    if (latestVerificationDate && latestVerificationDate > fourWeeksAgo) {
      const retentionUntil = new Date(
        latestVerificationDate.getTime() + 28 * 24 * 60 * 60 * 1000
      ).toISOString()
      safeLogger.warn('Admin deletion blocked: verification documents within UAVG 4-week retention window', {
        userId: targetUserId,
        latestVerificationDate: latestVerificationDate.toISOString(),
        retentionUntil,
        requestedBy: user.id,
      })
      return NextResponse.json(
        {
          error: 'Deletion blocked by UAVG retention requirement',
          message: `Identity verification documents must be retained for 4 weeks per Dutch law (UAVG). Deletion is permitted after ${retentionUntil}.`,
          retention_until: retentionUntil,
        },
        { status: 400 }
      )
    }

    // Delete user row — cascades to profiles, responses, matches, chats, etc.
    const { error: deleteError } = await adminClient
      .from('users')
      .delete()
      .eq('id', targetUserId)

    if (deleteError) {
      throw new Error(`Failed to delete user: ${deleteError.message}`)
    }

    // Stamp the DSAR audit record BEFORE deleting the auth user.
    // auth.admin.deleteUser() triggers ON DELETE SET NULL on dsar_requests.user_id
    // (migration 20260608230000).  We must write deleted_user_id + deletion_completed_at
    // now so the row is fully populated while user_id is still resolvable, satisfying
    // GDPR Art. 5(2) accountability.  After auth deletion user_id → NULL but the row
    // is retained rather than cascade-deleted.
    const adminNotes = latestVerificationDate
      ? 'Account permanently deleted by admin. Verification documents deleted (past 4-week UAVG retention window).'
      : 'Account permanently deleted by admin.'

    await adminClient
      .from('dsar_requests')
      .update({
        status: 'completed',
        deletion_completed_at: new Date().toISOString(),
        deleted_user_id: targetUserId,
        admin_id: user.id,
        admin_notes: adminNotes,
      })
      .eq('id', deletionRequest.id)

    // Delete the Supabase auth record. This MUST succeed; if it fails the
    // user can still log in, which would be a GDPR compliance failure.
    // ON DELETE SET NULL causes dsar_requests.user_id → NULL but the row is preserved.
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetUserId)

    if (authDeleteError) {
      safeLogger.error('Failed to delete auth user', { error: authDeleteError, userId: targetUserId })
      throw new Error(`Failed to delete auth user: ${authDeleteError.message}`)
    }

    safeLogger.info('Account permanently deleted', {
      requestId: deletionRequest.id,
      userId: targetUserId,
      deletedBy: user.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Account permanently deleted',
      user_id: targetUserId,
      verification_documents_retained: false,
    })
  } catch (error) {
    safeLogger.error('Account deletion error', error)

    return NextResponse.json(
      {
        error: 'Failed to delete account',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
