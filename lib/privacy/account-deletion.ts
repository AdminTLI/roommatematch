/**
 * GDPR/AVG account deletion scheduling (Art. 17).
 * Permanent erasure runs via /api/cron/maintenance after the grace period.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

/** Grace period before permanent deletion (GDPR one-month response window / AVG). */
export const ACCOUNT_DELETION_GRACE_PERIOD_DAYS = 30

export interface ScheduleAccountDeletionParams {
  adminClient: SupabaseClient
  userId: string
  metadata?: Record<string, unknown>
  reason?: string
}

export interface ScheduleAccountDeletionResult {
  requestId: string
  deletionScheduledAt: string
  gracePeriodDays: number
}

export function calculateDeletionScheduledAt(from: Date = new Date()): Date {
  const scheduled = new Date(from)
  scheduled.setDate(scheduled.getDate() + ACCOUNT_DELETION_GRACE_PERIOD_DAYS)
  return scheduled
}

/**
 * Records a DSAR deletion request and schedules hard delete after the grace period.
 */
export async function scheduleAccountDeletion(
  params: ScheduleAccountDeletionParams
): Promise<ScheduleAccountDeletionResult> {
  const { adminClient, userId, metadata = {}, reason } = params
  const deletionScheduledAt = calculateDeletionScheduledAt()
  const gracePeriodDays = ACCOUNT_DELETION_GRACE_PERIOD_DAYS

  const { data: existing } = await adminClient
    .from('dsar_requests')
    .select('id, deletion_scheduled_at, deletion_completed_at')
    .eq('user_id', userId)
    .eq('request_type', 'deletion')
    .is('deletion_completed_at', null)
    .not('deletion_scheduled_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.deletion_scheduled_at) {
    return {
      requestId: existing.id,
      deletionScheduledAt: existing.deletion_scheduled_at,
      gracePeriodDays,
    }
  }

  const processingMetadata = {
    ...metadata,
    deletion_scheduled_at: deletionScheduledAt.toISOString(),
    grace_period_days: gracePeriodDays,
    reason: reason || 'User requested account deletion',
  }

  const { data: dsarRequest, error: insertError } = await adminClient
    .from('dsar_requests')
    .insert({
      user_id: userId,
      request_type: 'deletion',
      status: 'in_progress',
      processing_metadata: processingMetadata,
      deletion_scheduled_at: deletionScheduledAt.toISOString(),
      deletion_grace_period_days: gracePeriodDays,
    })
    .select('id')
    .single()

  if (insertError || !dsarRequest) {
    safeLogger.error('[AccountDeletion] Failed to create DSAR request', {
      error: insertError,
      userId,
    })
    throw new Error(
      insertError?.message || 'Failed to record deletion request'
    )
  }

  const { error: deactivateError } = await adminClient
    .from('users')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (deactivateError) {
    await adminClient
      .from('dsar_requests')
      .update({
        status: 'rejected',
        admin_notes: `Failed to deactivate account: ${deactivateError.message}`,
      })
      .eq('id', dsarRequest.id)
    throw new Error(`Failed to mark account for deletion: ${deactivateError.message}`)
  }

  const { error: finalizeError } = await adminClient
    .from('dsar_requests')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      deletion_scheduled_at: deletionScheduledAt.toISOString(),
      deletion_grace_period_days: gracePeriodDays,
      processing_metadata: processingMetadata,
      admin_notes:
        `Account scheduled for permanent deletion after ${gracePeriodDays}-day grace period (GDPR/AVG).`,
    })
    .eq('id', dsarRequest.id)

  if (finalizeError) {
    safeLogger.warn('[AccountDeletion] DSAR finalize update failed', {
      error: finalizeError,
      requestId: dsarRequest.id,
    })
  }

  safeLogger.info('[AccountDeletion] Deletion scheduled', {
    requestId: dsarRequest.id,
    userId,
    deletionScheduledAt: deletionScheduledAt.toISOString(),
    gracePeriodDays,
  })

  return {
    requestId: dsarRequest.id,
    deletionScheduledAt: deletionScheduledAt.toISOString(),
    gracePeriodDays,
  }
}
