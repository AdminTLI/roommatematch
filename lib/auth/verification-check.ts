import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export interface VerificationStatus {
  emailVerified: boolean
  personaVerified: boolean
  needsEmailVerification: boolean
  needsPersonaVerification: boolean
}

// In-memory cache for verification status with TTL
interface CachedVerificationStatus {
  status: VerificationStatus
  expiresAt: number
}

const verificationCache = new Map<string, CachedVerificationStatus>()
const VERIFICATION_CACHE_TTL_MS = 60 * 1000 // 60 seconds

// Clean up expired cache entries periodically
if (typeof global !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, cached] of verificationCache.entries()) {
      if (cached.expiresAt < now) {
        verificationCache.delete(key)
      }
    }
  }, 60000) // Clean up every minute
}

/**
 * Check user verification status (email and Persona) with caching
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

  // Check cache first
  const cacheKey = user.id
  const cached = verificationCache.get(cacheKey)
  const now = Date.now()

  if (cached && cached.expiresAt > now) {
    return cached.status
  }

  // Check email verification status (from user object - no DB query needed)
  const emailVerified = Boolean(
    user.email_confirmed_at &&
    typeof user.email_confirmed_at === 'string' &&
    user.email_confirmed_at.length > 0 &&
    !isNaN(Date.parse(user.email_confirmed_at))
  )

  // Check Persona verification status
  // OPTIMIZED: Fetch both verification and profile in parallel
  const supabase = await createClient()
  
  const [verificationResult, profileResult] = await Promise.all([
    // Check verifications table first
    supabase
      .from('verifications')
      .select('status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Also fetch profile in parallel
    supabase
      .from('profiles')
      .select('verification_status')
      .eq('user_id', user.id)
      .maybeSingle()
  ])

  // If verification is approved, user is verified
  let personaVerified = verificationResult.data?.status === 'approved'
  
  // If no verification record or not approved, check profile status
  if (!personaVerified) {
    personaVerified = profileResult.data?.verification_status === 'verified'
  }

  const status: VerificationStatus = {
    emailVerified,
    personaVerified,
    needsEmailVerification: !emailVerified,
    needsPersonaVerification: emailVerified && !personaVerified,
  }

  // Cache the result
  verificationCache.set(cacheKey, {
    status,
    expiresAt: now + VERIFICATION_CACHE_TTL_MS,
  })

  return status
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

