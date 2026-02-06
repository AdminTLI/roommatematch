import { createAdminClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export interface VerificationStatus {
  emailVerified: boolean
  personaVerified: boolean
  needsEmailVerification: boolean
  needsPersonaVerification: boolean
}

// In-memory cache: ONLY for verified users (24h). Never cache unverified - avoids stale blocks.
// Critical: verified users must never see Persona again (cost + UX)
interface CachedVerificationStatus {
  status: VerificationStatus
  expiresAt: number
}
const verificationCache = new Map<string, CachedVerificationStatus>()
const VERIFIED_CACHE_TTL_MS = 24 * 60 * 60 * 1000

if (typeof global !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, cached] of verificationCache.entries()) {
      if (cached.expiresAt < now) verificationCache.delete(key)
    }
  }, 60000)
}

export function clearVerificationCache(userId: string): void {
  verificationCache.delete(userId)
}

/**
 * Check user verification status. Data stored in:
 * - verifications table: status='approved' means Persona verified (source of truth)
 * - profiles table: verification_status='verified' (synced by persona-complete)
 *
 * Uses admin client only (no cookies) so it works in Edge middleware.
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

  const cacheKey = user.id
  const cached = verificationCache.get(cacheKey)
  const now = Date.now()
  if (cached && cached.expiresAt > now) {
    return cached.status
  }

  const emailVerified = Boolean(
    user.email_confirmed_at &&
    typeof user.email_confirmed_at === 'string' &&
    user.email_confirmed_at.length > 0 &&
    !isNaN(Date.parse(user.email_confirmed_at))
  )

  // Use admin client only - works in Edge middleware (no cookies() dependency)
  const admin = createAdminClient()
  const [verificationResult, profileResult] = await Promise.all([
    admin
      .from('verifications')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .limit(1)
      .maybeSingle(),
    admin
      .from('profiles')
      .select('verification_status')
      .eq('user_id', user.id)
      .maybeSingle()
  ])

  const personaVerified =
    verificationResult.data?.status === 'approved' ||
    profileResult.data?.verification_status === 'verified'

  const status: VerificationStatus = {
    emailVerified,
    personaVerified,
    needsEmailVerification: !emailVerified,
    needsPersonaVerification: emailVerified && !personaVerified,
  }

  // ONLY cache verified - never cache unverified (prevents stale blocks for users who just verified)
  if (personaVerified) {
    verificationCache.set(cacheKey, {
      status,
      expiresAt: now + VERIFIED_CACHE_TTL_MS,
    })
  }

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

