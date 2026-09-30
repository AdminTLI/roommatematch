import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { normalizeDateInput } from '@/lib/auth/age-verification'
import { createPersonaInquiry } from '@/lib/verification/persona-client'

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

    // Reuse pending Persona inquiry when possible
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
      const clientToken =
        (existingVerification.provider_data as { client_token?: string } | null)?.client_token
      return NextResponse.json({
        sessionId: existingVerification.provider_session_id,
        inquiryId: existingVerification.provider_session_id,
        clientToken,
        status: 'pending',
        provider,
      })
    }

    if (provider !== 'persona') {
      return NextResponse.json(
        { error: 'Only Persona verification is supported for new sessions' },
        { status: 400 }
      )
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

    const { error: insertError } = await admin.from('verifications').insert({
      user_id: user.id,
      provider: 'persona',
      provider_session_id: sessionResult.sessionId,
      status: 'pending',
      provider_data: {
        client_token: sessionResult.clientToken,
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
      clientToken: sessionResult.clientToken,
      provider: 'persona',
      status: 'pending',
    })
  } catch (error) {
    safeLogger.error('[Verification] Start verification error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
