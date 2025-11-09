import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile verification status
    // Profile may not exist yet during verification flow
    const { data: profile } = await supabase
      .from('profiles')
      .select('verification_status')
      .eq('user_id', user.id)
      .maybeSingle()

    // If no profile exists, user is unverified
    const verificationStatus = profile?.verification_status || 'unverified'

    // Get latest verification record
    const { data: verification } = await supabase
      .from('verifications')
      .select('id, provider, status, review_reason, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

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

