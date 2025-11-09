import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export interface VerificationStatus {
  emailVerified: boolean
  personaVerified: boolean
  needsEmailVerification: boolean
  needsPersonaVerification: boolean
}

/**
 * Check user verification status (email and Persona)
 * @param user - The authenticated user from Supabase auth
 * @returns Verification status object
 */
export async function checkUserVerificationStatus(
  user: User | null
): Promise<VerificationStatus> {
  if (!user) {
    return {
      emailVerified: false,
      personaVerified: false,
      needsEmailVerification: true,
      needsPersonaVerification: true,
    }
  }

  // Super admin demo account bypass - always verified
  const DEMO_USER_EMAIL = 'demo@account.com'
  if (user.email?.toLowerCase() === DEMO_USER_EMAIL.toLowerCase()) {
    return {
      emailVerified: true,
      personaVerified: true,
      needsEmailVerification: false,
      needsPersonaVerification: false,
    }
  }

  // Check email verification status
  const emailVerified = Boolean(
    user.email_confirmed_at &&
    typeof user.email_confirmed_at === 'string' &&
    user.email_confirmed_at.length > 0 &&
    !isNaN(Date.parse(user.email_confirmed_at))
  )

  // Check Persona verification status
  // First check verifications table (source of truth), then fall back to profile
  const supabase = await createClient()
  
  // Check verifications table first
  const { data: verification } = await supabase
    .from('verifications')
    .select('status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // If verification is approved, user is verified
  let personaVerified = verification?.status === 'approved'
  
  // If no verification record or not approved, check profile status
  if (!personaVerified) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('verification_status')
      .eq('user_id', user.id)
      .maybeSingle()
    
    personaVerified = profile?.verification_status === 'verified'
  }

  return {
    emailVerified,
    personaVerified,
    needsEmailVerification: !emailVerified,
    needsPersonaVerification: emailVerified && !personaVerified,
  }
}

/**
 * Get the redirect URL based on verification status
 * @param status - Verification status object
 * @returns Redirect URL or null if verified
 */
export function getVerificationRedirectUrl(
  status: VerificationStatus
): string | null {
  if (status.needsEmailVerification) {
    return '/auth/verify-email'
  }
  if (status.needsPersonaVerification) {
    return '/verify'
  }
  return null
}

