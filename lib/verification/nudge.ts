import type { SupabaseClient } from '@supabase/supabase-js'

export type NudgeCadenceStage = 'initial' | 'day1' | 'weekly'
export type NudgeAction = 'shown' | 'skipped' | 'verified_uni' | 'verified_persona'

export type VerificationNudgeState = {
  user_id: string
  first_shown_at: string | null
  last_shown_at: string | null
  last_action: NudgeAction | null
  show_count: number
  next_eligible_at: string | null
  cadence_stage: NudgeCadenceStage
}

const MS_DAY = 24 * 60 * 60 * 1000
const MS_WEEK = 7 * MS_DAY

export function shouldShowVerificationNudge(args: {
  isVerified: boolean
  row: VerificationNudgeState | null
  now?: Date
}): boolean {
  if (args.isVerified) return false
  const now = args.now ?? new Date()
  const row = args.row
  if (!row) return true
  if (
    row.last_action === 'verified_uni' ||
    row.last_action === 'verified_persona'
  ) {
    return false
  }
  // Never shown: first accept should prompt
  if (!row.first_shown_at && !row.next_eligible_at) return true
  // After skip, wait until next_eligible_at
  if (row.next_eligible_at) {
    return new Date(row.next_eligible_at).getTime() <= now.getTime()
  }
  // Shown but not skipped yet (user closed dialog) — show again
  return true
}

export async function loadVerificationNudgeState(
  client: SupabaseClient,
  userId: string
): Promise<VerificationNudgeState | null> {
  const { data, error } = await client
    .from('verification_nudge_state')
    .select(
      'user_id, first_shown_at, last_shown_at, last_action, show_count, next_eligible_at, cadence_stage'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return (data as VerificationNudgeState | null) ?? null
}

export async function recordNudgeShown(
  client: SupabaseClient,
  userId: string,
  existing: VerificationNudgeState | null
): Promise<VerificationNudgeState> {
  const now = new Date().toISOString()
  const payload = {
    user_id: userId,
    first_shown_at: existing?.first_shown_at ?? now,
    last_shown_at: now,
    last_action: 'shown' as const,
    show_count: (existing?.show_count ?? 0) + 1,
    next_eligible_at: existing?.next_eligible_at ?? null,
    cadence_stage: existing?.cadence_stage ?? ('initial' as const),
    updated_at: now,
  }

  const { data, error } = await client
    .from('verification_nudge_state')
    .upsert(payload, { onConflict: 'user_id' })
    .select(
      'user_id, first_shown_at, last_shown_at, last_action, show_count, next_eligible_at, cadence_stage'
    )
    .single()

  if (error) throw error
  return data as VerificationNudgeState
}

/**
 * First skip → eligible again in 24h (day1 stage).
 * Subsequent skips → eligible again in 7 days (weekly stage).
 */
export async function recordNudgeSkipped(
  client: SupabaseClient,
  userId: string,
  existing: VerificationNudgeState | null
): Promise<VerificationNudgeState> {
  const nowDate = new Date()
  const now = nowDate.toISOString()
  const stage = existing?.cadence_stage ?? 'initial'
  const isFirstSkip = stage === 'initial' || !existing?.next_eligible_at
  const nextEligible = new Date(
    nowDate.getTime() + (isFirstSkip ? MS_DAY : MS_WEEK)
  ).toISOString()
  const nextStage: NudgeCadenceStage = isFirstSkip ? 'day1' : 'weekly'

  const payload = {
    user_id: userId,
    first_shown_at: existing?.first_shown_at ?? now,
    last_shown_at: existing?.last_shown_at ?? now,
    last_action: 'skipped' as const,
    show_count: existing?.show_count ?? 0,
    next_eligible_at: nextEligible,
    cadence_stage: nextStage,
    updated_at: now,
  }

  const { data, error } = await client
    .from('verification_nudge_state')
    .upsert(payload, { onConflict: 'user_id' })
    .select(
      'user_id, first_shown_at, last_shown_at, last_action, show_count, next_eligible_at, cadence_stage'
    )
    .single()

  if (error) throw error
  return data as VerificationNudgeState
}

export async function recordNudgeVerified(
  client: SupabaseClient,
  userId: string,
  via: 'verified_uni' | 'verified_persona',
  existing: VerificationNudgeState | null
): Promise<VerificationNudgeState> {
  const now = new Date().toISOString()
  const payload = {
    user_id: userId,
    first_shown_at: existing?.first_shown_at ?? now,
    last_shown_at: existing?.last_shown_at ?? now,
    last_action: via,
    show_count: existing?.show_count ?? 0,
    // Far-future / null — shouldShow treats verified_* as stop
    next_eligible_at: null,
    cadence_stage: existing?.cadence_stage ?? ('initial' as const),
    updated_at: now,
  }

  const { data, error } = await client
    .from('verification_nudge_state')
    .upsert(payload, { onConflict: 'user_id' })
    .select(
      'user_id, first_shown_at, last_shown_at, last_action, show_count, next_eligible_at, cadence_stage'
    )
    .single()

  if (error) throw error
  return data as VerificationNudgeState
}
