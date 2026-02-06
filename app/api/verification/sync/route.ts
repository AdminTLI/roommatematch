/**
 * Sync verification status: ensures profiles.verification_status matches verifications table.
 * Use when a user has approved verification in verifications but profile is out of sync
 * (e.g. profile created before verification, or sync failed). Clears verification cache.
 */
import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { clearVerificationCache } from '@/lib/auth/verification-check'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: approved } = await admin
      .from('verifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .limit(1)
      .maybeSingle()

    if (!approved) {
      return NextResponse.json({
        synced: false,
        reason: 'No approved verification found',
        message: 'Complete identity verification to use this account.'
      })
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('id, verification_status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile && profile.verification_status !== 'verified') {
      await admin
        .from('profiles')
        .update({ verification_status: 'verified', updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
    }

    clearVerificationCache(user.id)

    return NextResponse.json({
      synced: true,
      message: 'Verification status synced. Please refresh the page.'
    })
  } catch (error) {
    console.error('[Verification sync] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
