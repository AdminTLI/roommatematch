import type { SupabaseClient } from '@supabase/supabase-js'
import { clearVerificationCache } from '@/lib/auth/verification-check'
import { safeLogger } from '@/lib/utils/logger'

export type ResetVerificationResult =
  | {
      ok: true
      expiredCount: number
      previousStatuses: string[]
    }
  | {
      ok: false
      error: string
    }

/**
 * Clear identity verification so the user can start a fresh Persona flow.
 * Expires existing KYC sessions, clears durable flags, and sets profile to unverified.
 */
export async function resetUserIdentityVerification(
  admin: SupabaseClient,
  userId: string,
  options?: { reason?: string }
): Promise<ResetVerificationResult> {
  const now = new Date().toISOString()
  const reason = options?.reason || 'admin_reset_for_retry'

  const { data: existing, error: fetchError } = await admin
    .from('verifications')
    .select('id, status')
    .eq('user_id', userId)
    .neq('status', 'expired')

  if (fetchError) {
    safeLogger.error('[Admin] Failed to load verifications for reset', {
      userId,
      error: fetchError,
    })
    return { ok: false, error: 'Failed to load verifications' }
  }

  const previousStatuses = (existing || []).map((row) => row.status as string)
  const idsToExpire = (existing || []).map((row) => row.id as string)

  if (idsToExpire.length > 0) {
    const { error: expireError } = await admin
      .from('verifications')
      .update({
        status: 'expired',
        review_reason: reason,
        updated_at: now,
      })
      .in('id', idsToExpire)

    if (expireError) {
      safeLogger.error('[Admin] Failed to expire verifications for reset', {
        userId,
        error: expireError,
      })
      return { ok: false, error: 'Failed to expire verifications' }
    }
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ verification_status: 'unverified', updated_at: now })
    .eq('user_id', userId)

  if (profileError) {
    safeLogger.error('[Admin] Failed to reset profile verification status', {
      userId,
      error: profileError,
    })
    return { ok: false, error: 'Failed to reset profile verification status' }
  }

  const { error: usersError } = await admin
    .from('users')
    .update({
      identity_verified_at: null,
      identity_verification_provider: null,
      updated_at: now,
    })
    .eq('id', userId)

  if (usersError) {
    safeLogger.error('[Admin] Failed to clear durable verification for reset', {
      userId,
      error: usersError,
    })
    return { ok: false, error: 'Failed to clear durable verification' }
  }

  clearVerificationCache(userId)

  return {
    ok: true,
    expiredCount: idsToExpire.length,
    previousStatuses,
  }
}
