/**
 * Write-time registration funnel tracking.
 *
 * Persists first-reach milestones into registration_funnel_milestones +
 * registration_funnel_progress for later cohort / bottleneck analysis.
 *
 * Never throws to callers — tracking failures must not break product flows.
 */

import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import type { FunnelSideMetricKey, FunnelStageKey } from '@/lib/admin/registration-funnel'

export type RegistrationFunnelTrackKey = FunnelStageKey | FunnelSideMetricKey

export type VerificationMethod =
  | 'uni_email'
  | 'persona'
  | 'skipped'
  | 'auto_academic'

export interface RecordFunnelMilestoneOptions {
  source: string
  metadata?: Record<string, string | number | boolean | null>
  reachedAt?: string | Date
  /** Optional pre-built admin/service client to avoid extra setup. */
  client?: { rpc: (...args: any[]) => PromiseLike<{ data: any; error: any }> }
}

async function getClient(client?: RecordFunnelMilestoneOptions['client']) {
  if (client) return client
  return createAdminClient()
}

/**
 * Record a first-reach funnel milestone (idempotent).
 * Returns true when a new row was inserted, false if already present / failed.
 */
export async function recordFunnelMilestone(
  userId: string,
  stageKey: RegistrationFunnelTrackKey,
  options: RecordFunnelMilestoneOptions
): Promise<boolean> {
  if (!userId || !stageKey) return false

  try {
    const admin = await getClient(options.client)
    const reachedAt =
      options.reachedAt instanceof Date
        ? options.reachedAt.toISOString()
        : options.reachedAt ?? new Date().toISOString()

    const { data, error } = await admin.rpc('record_registration_funnel_milestone', {
      p_user_id: userId,
      p_stage_key: stageKey,
      p_source: options.source,
      p_metadata: options.metadata ?? {},
      p_reached_at: reachedAt,
    })

    if (error) {
      safeLogger.warn('[FunnelTrack] Failed to record milestone', {
        userId,
        stageKey,
        source: options.source,
        message: error.message,
        code: error.code,
      })
      return false
    }

    return data === true
  } catch (err) {
    safeLogger.warn('[FunnelTrack] Unexpected error recording milestone', {
      userId,
      stageKey,
      source: options.source,
      error: err instanceof Error ? err.message : String(err),
    })
    return false
  }
}

/** Fire-and-forget helper for route handlers. */
export function trackFunnelMilestone(
  userId: string,
  stageKey: RegistrationFunnelTrackKey,
  options: RecordFunnelMilestoneOptions
): void {
  void recordFunnelMilestone(userId, stageKey, options)
}

/** Record the same milestone for many users (e.g. received_matches). */
export async function recordFunnelMilestoneForUsers(
  userIds: string[],
  stageKey: RegistrationFunnelTrackKey,
  options: RecordFunnelMilestoneOptions
): Promise<void> {
  const unique = [...new Set(userIds.filter(Boolean))]
  if (unique.length === 0) return

  await Promise.all(
    unique.map((id) => recordFunnelMilestone(id, stageKey, options))
  )
}

/**
 * Settings side metric: bio filled AND (phone OR languages).
 * Call after profile writes that may complete the criterion.
 */
export async function maybeTrackSettingsFilled(
  userId: string,
  source: string,
  client?: RecordFunnelMilestoneOptions['client']
): Promise<void> {
  try {
    const admin = await getClient(client)
    const { data: profile, error } = await (admin as any)
      .from('profiles')
      .select('bio, phone, languages')
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !profile) return

    const bioFilled = typeof profile.bio === 'string' && profile.bio.trim().length > 0
    const extra =
      (typeof profile.phone === 'string' && profile.phone.trim().length > 0) ||
      (Array.isArray(profile.languages) && profile.languages.length > 0)

    if (bioFilled && extra) {
      await recordFunnelMilestone(userId, 'settings_filled', {
        source,
        client: admin as any,
      })
    }
  } catch (err) {
    safeLogger.warn('[FunnelTrack] settings_filled check failed', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
