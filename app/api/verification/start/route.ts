import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { markIdentityVerified } from '@/lib/auth/verification-check'
import {
  classifyPersonaInquiryForReuse,
  createPersonaInquiry,
  extractPersonaInquiryStatus,
  fetchPersonaInquiry,
  resumePersonaInquiry,
} from '@/lib/verification/persona-client'
import { reevaluateLatestRejectedPersonaVerification } from '@/lib/verification/reevaluate-persona'
import { normalizeDateInput } from '@/lib/auth/age-verification'

type KYCProvider = 'veriff' | 'persona' | 'onfido'

async function resolveClaimedIdentity(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  authMeta: Record<string, unknown> | undefined
) {
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, last_name, date_of_birth')
    .eq('user_id', userId)
    .maybeSingle()

  const firstName =
    (profile?.first_name as string | null)?.trim() ||
    (typeof authMeta?.first_name === 'string' ? authMeta.first_name.trim() : '') ||
    ''
  const lastName =
    (profile?.last_name as string | null)?.trim() ||
    (typeof authMeta?.last_name === 'string' ? authMeta.last_name.trim() : '') ||
    ''
  const dateOfBirth =
    normalizeDateInput(profile?.date_of_birth as string | null) ||
    normalizeDateInput(
      typeof authMeta?.date_of_birth === 'string' ? authMeta.date_of_birth : null
    )

  return { firstName, lastName, dateOfBirth }
}

async function markVerificationTerminal(
  admin: ReturnType<typeof createAdminClient>,
  verificationId: string,
  userId: string,
  status: 'rejected' | 'expired' | 'approved',
  reviewReason?: string
) {
  const now = new Date().toISOString()
  await admin
    .from('verifications')
    .update({
      status,
      review_reason: reviewReason || null,
      updated_at: now,
    })
    .eq('id', verificationId)

  if (status === 'approved') {
    await admin
      .from('profiles')
      .update({ verification_status: 'verified', updated_at: now })
      .eq('user_id', userId)
  } else {
    await admin
      .from('profiles')
      .update({
        verification_status: status === 'rejected' ? 'failed' : 'unverified',
        updated_at: now,
      })
      .eq('user_id', userId)
  }
}

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: profile } = await admin
      .from('profiles')
      .select('verification_status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.verification_status === 'verified') {
      return NextResponse.json({
        status: 'verified',
        message: 'Already verified',
      })
    }

    // Durable verification also counts
    const { data: userRow } = await admin
      .from('users')
      .select('identity_verified_at')
      .eq('id', user.id)
      .maybeSingle()

    if (userRow?.identity_verified_at) {
      return NextResponse.json({
        status: 'verified',
        message: 'Already verified',
      })
    }

    // Heal false name-mismatch rejections (Persona already approved) before
    // forcing the user through another ID capture.
    const healed = await reevaluateLatestRejectedPersonaVerification(
      admin,
      user.id,
      user.email
    )
    if (healed.outcome === 'approved') {
      return NextResponse.json({
        status: 'verified',
        message: 'Already verified',
        healed: true,
      })
    }

    const claimed = await resolveClaimedIdentity(
      admin,
      user.id,
      user.user_metadata as Record<string, unknown> | undefined
    )

    if (!claimed.firstName || !claimed.lastName || !claimed.dateOfBirth) {
      return NextResponse.json(
        {
          error:
            'Complete your name and date of birth on your profile before starting identity verification.',
          code: 'IDENTITY_FIELDS_REQUIRED',
        },
        { status: 400 }
      )
    }

    const provider = (process.env.KYC_PROVIDER || 'persona') as KYCProvider

    if (provider !== 'persona') {
      return NextResponse.json(
        { error: 'Only Persona verification is supported for new sessions' },
        { status: 400 }
      )
    }

    // Reuse pending Persona inquiry when possible — always refresh the session token
    const { data: existingVerification } = await admin
      .from('verifications')
      .select('id, provider_session_id, status, provider_data')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingVerification?.provider_session_id) {
      const inquiryId = existingVerification.provider_session_id
      const inquiryPayload = await fetchPersonaInquiry(inquiryId)
      const personaStatus = extractPersonaInquiryStatus(inquiryPayload)
      const reuseAction = classifyPersonaInquiryForReuse(personaStatus)

      if (reuseAction === 'approved') {
        await markVerificationTerminal(admin, existingVerification.id, user.id, 'approved')
        await markIdentityVerified(user.id, 'persona', user.email)
        return NextResponse.json({
          status: 'verified',
          message: 'Already verified',
          inquiryId,
        })
      }

      if (reuseAction === 'rejected') {
        await markVerificationTerminal(
          admin,
          existingVerification.id,
          user.id,
          'rejected',
          `persona_status:${personaStatus || 'unknown'}`
        )
        // Fall through to create a fresh inquiry below
      } else if (reuseAction === 'awaiting_review') {
        return NextResponse.json({
          sessionId: inquiryId,
          inquiryId,
          status: 'pending',
          awaitingReview: true,
          provider,
          message: 'Verification submitted and awaiting review.',
        })
      } else if (reuseAction === 'resume') {
        const resumed = await resumePersonaInquiry(inquiryId)
        if (resumed?.clientToken) {
          const previousData =
            (existingVerification.provider_data as Record<string, unknown> | null) || {}
          await admin
            .from('verifications')
            .update({
              provider_data: {
                ...previousData,
                client_token: resumed.clientToken,
                resumed_at: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingVerification.id)

          return NextResponse.json({
            sessionId: inquiryId,
            inquiryId,
            clientToken: resumed.clientToken,
            status: 'pending',
            provider,
            resumed: true,
          })
        }

        // Resume failed (redacted / invalid) — expire and create a new inquiry
        safeLogger.warn('[Verification] Could not resume pending inquiry; creating a new one', {
          userId: user.id,
          inquiryId,
          personaStatus,
        })
        await markVerificationTerminal(
          admin,
          existingVerification.id,
          user.id,
          'expired',
          'resume_failed'
        )
      } else {
        // create_new — expire stale inquiry
        await markVerificationTerminal(
          admin,
          existingVerification.id,
          user.id,
          'expired',
          `persona_status:${personaStatus || 'unusable'}`
        )
      }
    }

    const sessionResult = await createPersonaInquiry({
      userId: user.id,
      firstName: claimed.firstName,
      lastName: claimed.lastName,
      birthdate: claimed.dateOfBirth,
    })

    if (!sessionResult) {
      return NextResponse.json(
        { error: 'Failed to create verification session' },
        { status: 500 }
      )
    }

    // Prefer a token from create; otherwise resume immediately so the embedded flow can open
    let clientToken = sessionResult.clientToken
    if (!clientToken) {
      const resumed = await resumePersonaInquiry(sessionResult.sessionId)
      clientToken = resumed?.clientToken
    }

    if (!clientToken) {
      safeLogger.error('[Verification] Created inquiry but could not obtain a session token', {
        userId: user.id,
        inquiryId: sessionResult.sessionId,
      })
      return NextResponse.json(
        { error: 'Failed to create a secure verification session. Please try again.' },
        { status: 500 }
      )
    }

    const { error: insertError } = await admin.from('verifications').insert({
      user_id: user.id,
      provider: 'persona',
      provider_session_id: sessionResult.sessionId,
      status: 'pending',
      provider_data: {
        client_token: clientToken,
        reference_id: user.id,
        prefilled_name_first: claimed.firstName,
        prefilled_name_last: claimed.lastName,
        prefilled_birthdate: claimed.dateOfBirth,
      },
    })

    if (insertError) {
      safeLogger.error('[Verification] Failed to store verification record', insertError)
      return NextResponse.json(
        { error: 'Failed to store verification record' },
        { status: 500 }
      )
    }

    await admin
      .from('profiles')
      .update({ verification_status: 'pending', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    return NextResponse.json({
      sessionId: sessionResult.sessionId,
      inquiryId: sessionResult.sessionId,
      clientToken,
      provider: 'persona',
      status: 'pending',
    })
  } catch (error) {
    safeLogger.error('[Verification] Start verification error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
