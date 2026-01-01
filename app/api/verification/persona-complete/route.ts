import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { normalizeDateInput } from '@/lib/auth/age-verification'

async function fetchPersonaInquiryDob(inquiryId: string): Promise<string | undefined> {
  const apiKey = process.env.PERSONA_API_KEY
  const apiUrl = process.env.PERSONA_API_URL || 'https://withpersona.com/api/v1'
  if (!apiKey) return undefined

  try {
    const response = await fetch(`${apiUrl}/inquiries/${inquiryId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const body = await response.text()
      safeLogger.warn('[Verification] Persona inquiry fetch failed', { inquiryId, status: response.status, body })
      return undefined
    }

    const data = await response.json()
    const candidate =
      data?.data?.attributes?.birthdate ||
      data?.data?.attributes?.dob ||
      data?.data?.attributes?.['date-of-birth'] ||
      data?.data?.attributes?.payload?.data?.attributes?.birthdate ||
      data?.data?.attributes?.payload?.data?.attributes?.dob

    if (typeof candidate === 'string' && candidate.trim()) return candidate
  } catch (error) {
    safeLogger.error('[Verification] Persona inquiry fetch error', { inquiryId, error })
  }

  return undefined
}

async function getExpectedDob(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { data: profile } = await admin
    .from('profiles')
    .select('date_of_birth')
    .eq('user_id', userId)
    .maybeSingle()

  let authDob: string | null = null
  try {
    const { data: authUser } = await admin.auth.admin.getUserById(userId)
    authDob = (authUser?.user?.user_metadata as Record<string, any> | undefined)?.date_of_birth ?? null
  } catch (error) {
    safeLogger.warn('[Verification] Unable to read auth metadata for DOB (client complete)', { userId, error })
  }

  return {
    fromProfile: profile?.date_of_birth ?? null,
    fromAuth: authDob
  }
}

/**
 * Handle Persona Embedded Flow completion
 * Called when user completes verification in the embedded widget
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      safeLogger.warn('[Verification] Persona complete - unauthorized', { 
        hasAuthError: !!authError,
        authError: authError?.message 
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let inquiryId: string
    let personaStatus: string
    
    try {
      const body = await request.json()
      inquiryId = body.inquiryId
      personaStatus = body.status
    } catch (parseError) {
      safeLogger.error('[Verification] Persona complete - invalid JSON', parseError)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!inquiryId) {
      safeLogger.warn('[Verification] Persona complete - missing inquiryId', { userId: user.id })
      return NextResponse.json({ error: 'Missing inquiryId' }, { status: 400 })
    }
    
    safeLogger.info('[Verification] Persona complete - processing', {
      userId: user.id,
      inquiryId,
      personaStatus
    })

    const admin = createAdminClient()
    const expected = await getExpectedDob(admin, user.id)
    const expectedDob = expected.fromProfile || expected.fromAuth || null
    const personaDob = await fetchPersonaInquiryDob(inquiryId)

    const normalizedExpectedDob = normalizeDateInput(expectedDob)
    const normalizedPersonaDob = normalizeDateInput(personaDob)
    const dobMismatch =
      normalizedExpectedDob &&
      normalizedPersonaDob &&
      normalizedExpectedDob !== normalizedPersonaDob

    // Map Persona status to our status
    let verificationStatus: 'pending' | 'approved' | 'rejected' | 'expired' = 'pending'
    if (personaStatus === 'approved' || personaStatus === 'completed') {
      verificationStatus = 'approved'
    } else if (personaStatus === 'failed' || personaStatus === 'declined') {
      verificationStatus = 'rejected'
    } else if (personaStatus === 'expired') {
      verificationStatus = 'expired'
    }

    // Check if verification record exists
    const { data: existingVerification } = await admin
      .from('verifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', 'persona')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingVerification) {
      // Update existing verification
      const { error: updateError } = await admin
        .from('verifications')
        .update({
          provider_session_id: inquiryId,
          status: dobMismatch ? 'rejected' : verificationStatus,
          updated_at: new Date().toISOString(),
          provider_data: {
            inquiry_id: inquiryId,
            persona_status: personaStatus,
            persona_birthdate: normalizedPersonaDob || personaDob || null,
            expected_birthdate: normalizedExpectedDob || expectedDob || null,
            dob_match: dobMismatch ? false : true
          }
        })
        .eq('id', existingVerification.id)

      if (updateError) {
        safeLogger.error('[Verification] Failed to update verification record', {
          error: updateError,
          errorMessage: updateError.message,
          errorCode: updateError.code,
          errorDetails: updateError.details,
          errorHint: updateError.hint,
          userId: user.id,
          inquiryId,
          verificationStatus
        })
        return NextResponse.json(
          { 
            error: 'Failed to update verification record',
            details: updateError.message,
            code: updateError.code
          },
          { status: 500 }
        )
      }
    } else {
      // Create new verification record
      const { error: insertError } = await admin
        .from('verifications')
        .insert({
          user_id: user.id,
          provider: 'persona',
          provider_session_id: inquiryId,
          status: dobMismatch ? 'rejected' : verificationStatus,
          provider_data: {
            inquiry_id: inquiryId,
            persona_status: personaStatus,
            persona_birthdate: normalizedPersonaDob || personaDob || null,
            expected_birthdate: normalizedExpectedDob || expectedDob || null,
            dob_match: dobMismatch ? false : true
          }
        })

      if (insertError) {
        safeLogger.error('[Verification] Failed to create verification record', {
          error: insertError,
          errorMessage: insertError.message,
          errorCode: insertError.code,
          errorDetails: insertError.details,
          errorHint: insertError.hint,
          userId: user.id,
          inquiryId,
          verificationStatus,
          dobMismatch
        })
        return NextResponse.json(
          { 
            error: 'Failed to create verification record',
            details: insertError.message,
            code: insertError.code
          },
          { status: 500 }
        )
      } else {
        safeLogger.info('[Verification] Successfully created verification record', {
          userId: user.id,
          inquiryId,
          verificationStatus: dobMismatch ? 'rejected' : verificationStatus
        })
      }
    }

    // Update profile verification status if approved
    if (dobMismatch) {
      // Explicitly fail verification and profile if DOB does not match
      await admin
        .from('profiles')
        .update({ verification_status: 'failed', updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
    } else if (verificationStatus === 'approved') {
      // Check if profile exists
      const { data: existingProfile } = await admin
        .from('profiles')
        .select('id, verification_status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await admin
          .from('profiles')
          .update({ 
            verification_status: 'verified',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) {
          safeLogger.error('[Verification] Failed to update profile verification status', updateError)
          // Don't fail the request - verification record was created successfully
        } else {
          safeLogger.info('[Verification] Profile verification status updated', { userId: user.id })
        }
      } else {
        // Profile doesn't exist yet - that's okay, it will be created during onboarding
        // The verification status will be checked from the verifications table
        // When the profile is created during onboarding, it will use the verification_status
        // from the verifications table (see onboarding submission logic)
        safeLogger.info('[Verification] Profile does not exist yet for user', user.id)
        safeLogger.info('[Verification] Status will be checked from verifications table until profile is created')
      }
    }

    safeLogger.info('[Verification] Persona complete - success', {
      userId: user.id,
      inquiryId,
      verificationStatus: dobMismatch ? 'rejected' : verificationStatus,
      dobMismatch,
      personaDob: normalizedPersonaDob,
      expectedDob: normalizedExpectedDob
    })

    return NextResponse.json({
      success: true,
      status: dobMismatch ? 'rejected' : verificationStatus,
      dobMismatch
    })
  } catch (error) {
    safeLogger.error('[Verification] Persona complete error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

