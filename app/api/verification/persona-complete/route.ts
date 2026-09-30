import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { clearVerificationCache, markIdentityVerified } from '@/lib/auth/verification-check'
import { fetchPersonaIdentity, fetchPersonaInquiry } from '@/lib/verification/persona-client'
import {
  decidePersonaIdentity,
  extractPersonaDob,
  extractPersonaIssuingCountry,
  extractPersonaName,
} from '@/lib/verification/persona-decision'
import { normalizeDateInput } from '@/lib/auth/age-verification'

async function getExpectedIdentity(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
) {
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
    safeLogger.warn('[Verification] Unable to read auth metadata', { userId, error })
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

/**
 * Handle Persona Embedded Flow completion
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let inquiryId: string
    let personaStatus: string

    try {
      const body = await request.json()
      inquiryId = body.inquiryId
      personaStatus = body.status
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!inquiryId) {
      return NextResponse.json({ error: 'Missing inquiryId' }, { status: 400 })
    }

    const admin = createAdminClient()
    const expected = await getExpectedIdentity(admin, user.id)

    const inquiryPayload = await fetchPersonaInquiry(inquiryId)
    const personaIdentity = inquiryPayload
      ? {
          ...extractPersonaName(inquiryPayload),
          dateOfBirth: extractPersonaDob(inquiryPayload),
          issuingCountry: extractPersonaIssuingCountry(inquiryPayload),
        }
      : await fetchPersonaIdentity(inquiryId)

    const personaApproved =
      personaStatus === 'approved' || personaStatus === 'completed'

    const decision = decidePersonaIdentity({
      personaApproved,
      expected,
      persona: personaIdentity,
    })

    let verificationStatus: 'pending' | 'approved' | 'rejected' | 'expired' = 'pending'
    if (!decision.approved) {
      verificationStatus = 'rejected'
    } else if (personaApproved) {
      verificationStatus = 'approved'
    } else if (personaStatus === 'failed' || personaStatus === 'declined') {
      verificationStatus = 'rejected'
    } else if (personaStatus === 'expired') {
      verificationStatus = 'expired'
    }

    const providerData = {
      inquiry_id: inquiryId,
      persona_status: personaStatus,
      ...decision.providerData,
    }

    const { data: existingVerification } = await admin
      .from('verifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', 'persona')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingVerification) {
      const { error: updateError } = await admin
        .from('verifications')
        .update({
          provider_session_id: inquiryId,
          status: verificationStatus,
          review_reason: decision.reviewReason,
          updated_at: new Date().toISOString(),
          provider_data: providerData,
        })
        .eq('id', existingVerification.id)

      if (updateError) {
        safeLogger.error('[Verification] Failed to update verification record', updateError)
        return NextResponse.json(
          { error: 'Failed to update verification record', details: updateError.message },
          { status: 500 }
        )
      }
    } else {
      const { error: insertError } = await admin.from('verifications').insert({
        user_id: user.id,
        provider: 'persona',
        provider_session_id: inquiryId,
        status: verificationStatus,
        review_reason: decision.reviewReason,
        provider_data: providerData,
      })

      if (insertError) {
        safeLogger.error('[Verification] Failed to create verification record', insertError)
        return NextResponse.json(
          { error: 'Failed to create verification record', details: insertError.message },
          { status: 500 }
        )
      }
    }

    if (!decision.approved || verificationStatus === 'rejected') {
      await admin
        .from('profiles')
        .update({ verification_status: 'failed', updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
    } else if (verificationStatus === 'approved') {
      await markIdentityVerified(user.id, 'persona', user.email)
    }

    clearVerificationCache(user.id)

    return NextResponse.json({
      success: true,
      status: verificationStatus,
      approved: decision.approved,
      reasons: decision.reasons,
    })
  } catch (error) {
    safeLogger.error('[Verification] Persona complete error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
