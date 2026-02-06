import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS and ensure we can read the verification record
    // This is safe because we're only reading the user's own verification
    const admin = createAdminClient()
    
    // Check for ANY approved verification (critical: once verified, never re-prompt - saves Persona costs)
    const { data: approvedVerification } = await admin
      .from('verifications')
      .select('id, provider, status, review_reason, created_at, updated_at')
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
          .select('id, provider, status, review_reason, created_at, updated_at')
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

    const verification = approvedVerification || latestVerification

    // Get user profile verification status (use admin for consistency - bypasses RLS)
    const { data: profile } = await admin
      .from('profiles')
      .select('verification_status')
      .eq('user_id', user.id)
      .maybeSingle()

    // Determine verification status:
    // 1. If ANY verification record is approved, user is verified (never re-prompt)
    // 2. Otherwise check latest record and profile status
    let verificationStatus: 'unverified' | 'pending' | 'verified' | 'failed' = 'unverified'
    
    if (approvedVerification || profile?.verification_status === 'verified') {
      verificationStatus = 'verified'
    } else if (latestVerification?.status === 'rejected' || latestVerification?.status === 'expired') {
      verificationStatus = 'failed'
    } else if (latestVerification?.status === 'pending') {
      verificationStatus = 'pending'
    } else if (profile?.verification_status && profile.verification_status !== 'unverified') {
      verificationStatus = profile.verification_status as 'unverified' | 'pending' | 'verified' | 'failed'
    }

    return NextResponse.json({
      status: verificationStatus,
      verification: verification ? {
        id: verification.id,
        provider: verification.provider,
        status: verification.status,
        reviewReason: verification.review_reason,
        createdAt: verification.created_at,
        updatedAt: verification.updated_at
      } : null,
      canRetry: verification?.status === 'rejected' || verification?.status === 'expired'
    })
  } catch (error) {
    safeLogger.error('[Verification] Status check error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

