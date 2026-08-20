/**
 * Sync verification status: ensures durable users.identity_verified_at and
 * profiles.verification_status match an approved verification record.
 * Use when a user completed Persona but login still redirects to /verify.
 */
import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { clearVerificationCache, markIdentityVerified } from '@/lib/auth/verification-check'

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
      .select('id, provider')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .limit(1)
      .maybeSingle()

    const { data: userRow } = await admin
      .from('users')
      .select('identity_verified_at')
      .eq('id', user.id)
      .maybeSingle()

    const { data: profile } = await admin
      .from('profiles')
      .select('id, verification_status')
      .eq('user_id', user.id)
      .maybeSingle()

    const alreadyDurable = Boolean(userRow?.identity_verified_at)
    const profileVerified = profile?.verification_status === 'verified'

    if (!approved && !alreadyDurable && !profileVerified) {
      return NextResponse.json({
        synced: false,
        verified: false,
        reason: 'No approved verification found',
        message: 'Complete identity verification to use this account.'
      })
    }

    await markIdentityVerified(user.id, approved?.provider || 'persona', user.email)
    clearVerificationCache(user.id)

    return NextResponse.json({
      synced: true,
      verified: true,
      message: 'Verification status synced.'
    })
  } catch (error) {
    console.error('[Verification sync] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
