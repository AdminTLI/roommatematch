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

  // Check email verification status
  const emailVerified = Boolean(
    user.email_confirmed_at &&
    typeof user.email_confirmed_at === 'string' &&
    user.email_confirmed_at.length > 0 &&
    !isNaN(Date.parse(user.email_confirmed_at))
  )

  // Check Persona verification status from profiles table
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('user_id', user.id)
    .maybeSingle()

  const personaVerified = profile?.verification_status === 'verified'

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

