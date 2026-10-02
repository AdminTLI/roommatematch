/**
 * Re-run Domu Match identity checks against an existing Persona inquiry.
 * Used to heal false rejections after matcher improvements (e.g. swapped names).
 */

import type { createAdminClient } from '@/lib/supabase/server'
import { markIdentityVerified, clearVerificationCache } from '@/lib/auth/verification-check'
import { normalizeDateInput } from '@/lib/auth/age-verification'
import { safeLogger } from '@/lib/utils/logger'
import {
  decidePersonaIdentity,
  extractPersonaDob,
  extractPersonaIssuingCountry,
  extractPersonaName,
} from '@/lib/verification/persona-decision'
import {
  extractPersonaInquiryStatus,
  fetchPersonaInquiry,
} from '@/lib/verification/persona-client'

type AdminClient = ReturnType<typeof createAdminClient>

async function getExpectedIdentity(admin: AdminClient, userId: string) {
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, last_name, date_of_birth')
    .eq('user_id', userId)
    .maybeSingle()

  let authMeta: Record<string, unknown> | undefined
  try {
    const { data: authUser } = await admin.auth.admin.getUserById(userId)
    authMeta = authUser?.user?.user_metadata as Record<string, unknown> | undefined
  } catch (error) {
    safeLogger.warn('[Verification] Unable to read auth metadata for re-eval', {
      userId,
      error,
    })
  }

  return {
    firstName:
      (profile?.first_name as string | null)?.trim() ||
      (typeof authMeta?.first_name === 'string' ? authMeta.first_name.trim() : '') ||
      '',
    lastName:
      (profile?.last_name as string | null)?.trim() ||
      (typeof authMeta?.last_name === 'string' ? authMeta.last_name.trim() : '') ||
      '',
    dateOfBirth:
      normalizeDateInput(profile?.date_of_birth as string | null) ||
      normalizeDateInput(
        typeof authMeta?.date_of_birth === 'string' ? authMeta.date_of_birth : null
      ),
  }
}

export type ReevaluateResult =
  | { outcome: 'approved'; verificationId: string }
  | { outcome: 'still_rejected'; verificationId: string; reasons: string[] }
  | { outcome: 'skipped'; reason: string }

/**
 * If the user's latest Persona verification was rejected only by our post-checks
 * (Persona itself approved), re-run decidePersonaIdentity with current rules.
 */
export async function reevaluateLatestRejectedPersonaVerification(
  admin: AdminClient,
  userId: string,
  email?: string | null
): Promise<ReevaluateResult> {
  const { data: latest } = await admin
    .from('verifications')
    .select('id, status, provider, provider_session_id, provider_data, review_reason')
    .eq('user_id', userId)
    .eq('provider', 'persona')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!latest) {
    return { outcome: 'skipped', reason: 'no_verification' }
  }

  if (latest.status === 'approved') {
    return { outcome: 'skipped', reason: 'already_approved' }
  }

  if (latest.status !== 'rejected' || !latest.provider_session_id) {
    return { outcome: 'skipped', reason: 'not_rejected_persona' }
  }

  const storedPersonaStatus = String(
    (latest.provider_data as { persona_status?: string } | null)?.persona_status || ''
  ).toLowerCase()

  const inquiryPayload = await fetchPersonaInquiry(latest.provider_session_id)
  const liveStatus = extractPersonaInquiryStatus(inquiryPayload)
  const personaApproved =
    storedPersonaStatus === 'approved' ||
    storedPersonaStatus === 'completed' ||
    liveStatus === 'approved' ||
    liveStatus === 'completed'

  if (!personaApproved) {
    return { outcome: 'skipped', reason: 'persona_not_approved' }
  }

  const expected = await getExpectedIdentity(admin, userId)
  const personaIdentity = inquiryPayload
    ? {
        ...extractPersonaName(inquiryPayload),
        dateOfBirth: extractPersonaDob(inquiryPayload),
        issuingCountry: extractPersonaIssuingCountry(inquiryPayload),
      }
    : {
        firstName: (latest.provider_data as { persona_name_first?: string } | null)
          ?.persona_name_first,
        lastName: (latest.provider_data as { persona_name_last?: string } | null)
          ?.persona_name_last,
        dateOfBirth: (latest.provider_data as { persona_birthdate?: string } | null)
          ?.persona_birthdate,
      }

  const decision = decidePersonaIdentity({
    personaApproved: true,
    expected,
    persona: personaIdentity,
  })

  const now = new Date().toISOString()
  const previousData = (latest.provider_data as Record<string, unknown> | null) || {}

  if (!decision.approved) {
    await admin
      .from('verifications')
      .update({
        review_reason: decision.reviewReason,
        provider_data: {
          ...previousData,
          ...decision.providerData,
          reevaluated_at: now,
        },
        updated_at: now,
      })
      .eq('id', latest.id)

    return {
      outcome: 'still_rejected',
      verificationId: latest.id,
      reasons: decision.reasons,
    }
  }

  await admin
    .from('verifications')
    .update({
      status: 'approved',
      review_reason: null,
      provider_data: {
        ...previousData,
        ...decision.providerData,
        reevaluated_at: now,
        reevaluate_healed: true,
      },
      updated_at: now,
    })
    .eq('id', latest.id)

  await markIdentityVerified(userId, 'persona', email)
  clearVerificationCache(userId)

  safeLogger.info('[Verification] Re-evaluated rejected Persona inquiry as approved', {
    userId,
    verificationId: latest.id,
  })

  return { outcome: 'approved', verificationId: latest.id }
}
