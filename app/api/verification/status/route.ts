import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { markIdentityVerified } from '@/lib/auth/verification-check'
import {
  classifyPersonaInquiryForReuse,
  extractPersonaInquiryStatus,
  fetchPersonaInquiry,
} from '@/lib/verification/persona-client'
import { reevaluateLatestRejectedPersonaVerification } from '@/lib/verification/reevaluate-persona'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  Vary: 'Cookie',
} as const

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE_HEADERS })
    }

    // Use admin client to bypass RLS and ensure we can read the verification record
    // This is safe because we're only reading the user's own verification
    const admin = createAdminClient()

    const { data: userRow } = await admin
      .from('users')
      .select('identity_verified_at')
      .eq('id', user.id)
      .maybeSingle()
    
    // Check for ANY approved verification (critical: once verified, never re-prompt - saves Persona costs)
    const { data: approvedVerification } = await admin
      .from('verifications')
      .select('id, provider, status, review_reason, created_at, updated_at, provider_session_id')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Get latest verification record for display (pending/failed states)
    const { data: latestVerification, error: verificationError } = approvedVerification
      ? { data: approvedVerification, error: null }
      : await admin
          .from('verifications')
          .select('id, provider, status, review_reason, created_at, updated_at, provider_session_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

    if (verificationError) {
      safeLogger.warn('[Verification] Status check - error reading verification record', {
        userId: user.id,
        error: verificationError,
        errorMessage: verificationError?.message,
        errorCode: verificationError?.code
      })
    }

    let verification = approvedVerification || latestVerification

    // Get user profile verification status (use admin for consistency - bypasses RLS)
    const { data: profile } = await admin
      .from('profiles')
      .select('verification_status')
      .eq('user_id', user.id)
      .maybeSingle()

    // Determine verification status:
    // 1. Durable users.identity_verified_at (survives document retention)
    // 2. Any approved verification record
    // 3. profiles.verification_status
    let verificationStatus: 'unverified' | 'pending' | 'verified' | 'failed' = 'unverified'
    let canContinue = false
    let awaitingReview = false
    
    if (
      userRow?.identity_verified_at ||
      approvedVerification ||
      profile?.verification_status === 'verified'
    ) {
      verificationStatus = 'verified'
    } else if (latestVerification?.status === 'rejected' || latestVerification?.status === 'expired') {
      verificationStatus = 'failed'

      // Re-run Domu Match checks if Persona already approved (e.g. swapped names
      // that the updated matcher now accepts).
      if (latestVerification.status === 'rejected' && latestVerification.provider === 'persona') {
        try {
          const reeval = await reevaluateLatestRejectedPersonaVerification(
            admin,
            user.id,
            user.email
          )
          if (reeval.outcome === 'approved') {
            verificationStatus = 'verified'
            canContinue = false
            verification = {
              ...latestVerification,
              status: 'approved',
              updated_at: new Date().toISOString(),
            }
          }
        } catch (syncError) {
          safeLogger.warn('[Verification] Rejected Persona re-eval failed', {
            userId: user.id,
            error: syncError,
          })
        }
      }
    } else if (latestVerification?.status === 'pending') {
      verificationStatus = 'pending'
      canContinue = true

      // Sync with Persona so users are not stuck forever on "pending" after a decision,
      // and so we can tell "still needs to finish" vs "awaiting review".
      if (
        latestVerification.provider === 'persona' &&
        latestVerification.provider_session_id
      ) {
        try {
          const inquiryPayload = await fetchPersonaInquiry(
            latestVerification.provider_session_id
          )
          const personaStatus = extractPersonaInquiryStatus(inquiryPayload)
          const reuseAction = classifyPersonaInquiryForReuse(personaStatus)

          if (reuseAction === 'approved') {
            const now = new Date().toISOString()
            await admin
              .from('verifications')
              .update({ status: 'approved', updated_at: now })
              .eq('id', latestVerification.id)
            await markIdentityVerified(user.id, 'persona', user.email)
            verificationStatus = 'verified'
            canContinue = false
            verification = {
              ...latestVerification,
              status: 'approved',
              updated_at: now,
            }
          } else if (reuseAction === 'rejected') {
            const now = new Date().toISOString()
            await admin
              .from('verifications')
              .update({
                status: 'rejected',
                review_reason: `persona_status:${personaStatus || 'unknown'}`,
                updated_at: now,
              })
              .eq('id', latestVerification.id)
            await admin
              .from('profiles')
              .update({ verification_status: 'failed', updated_at: now })
              .eq('user_id', user.id)
            verificationStatus = 'failed'
            canContinue = false
            verification = {
              ...latestVerification,
              status: 'rejected',
              updated_at: now,
            }
          } else if (reuseAction === 'awaiting_review') {
            awaitingReview = true
            canContinue = false
          } else {
            // Still resumable — user must open Persona to finish
            canContinue = true
          }
        } catch (syncError) {
          safeLogger.warn('[Verification] Persona status sync failed; keeping pending', {
            userId: user.id,
            error: syncError,
          })
          canContinue = true
        }
      }
    } else if (profile?.verification_status && profile.verification_status !== 'unverified') {
      verificationStatus = profile.verification_status as 'unverified' | 'pending' | 'verified' | 'failed'
      if (verificationStatus === 'pending') {
        canContinue = true
      }
    }

    return NextResponse.json(
      {
        status: verificationStatus,
        verification: verification
          ? {
              id: verification.id,
              provider: verification.provider,
              status: verification.status,
              reviewReason: verification.review_reason,
              createdAt: verification.created_at,
              updatedAt: verification.updated_at,
            }
          : null,
        canRetry: verification?.status === 'rejected' || verification?.status === 'expired',
        // Pending inquiries that are not awaiting review can be resumed in Persona
        canContinue: canContinue && verificationStatus === 'pending',
        awaitingReview,
      },
      { headers: NO_STORE_HEADERS }
    )
  } catch (error) {
    safeLogger.error('[Verification] Status check error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }
}
