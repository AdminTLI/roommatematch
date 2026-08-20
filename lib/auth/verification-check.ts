import { createServiceClient } from '@/lib/supabase/service'
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
 * Check user verification status. Durable confirmation sources (any one is enough):
 * - users.identity_verified_at (survives document retention purge)
 * - verifications.status='approved' (may be scrubbed of PII after retention)
 * - profiles.verification_status='verified'
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

  // Prefer supabase-js service client (reliable service_role in Edge middleware)
  const admin = createServiceClient()
  const [userResult, verificationResult, profileResult] = await Promise.all([
    admin
      .from('users')
      .select('identity_verified_at')
      .eq('id', user.id)
      .maybeSingle(),
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
      .maybeSingle(),
  ])

  if (userResult.error) {
    console.warn('[VerificationCheck] users lookup failed', userResult.error.message)
  }
  if (verificationResult.error) {
    console.warn('[VerificationCheck] verifications lookup failed', verificationResult.error.message)
  }
  if (profileResult.error) {
    console.warn('[VerificationCheck] profiles lookup failed', profileResult.error.message)
  }

  const personaVerified =
    Boolean(userResult.data?.identity_verified_at) ||
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
 * Persist durable identity-verification confirmation in our DB.
 * Safe to call repeatedly after Persona approval.
 */
export async function markIdentityVerified(
  userId: string,
  provider: string = 'persona',
  email?: string | null
): Promise<void> {
  const admin = createServiceClient()
  const now = new Date().toISOString()

  const { data: existingUser } = await admin
    .from('users')
    .select('id, identity_verified_at, identity_verification_provider, email')
    .eq('id', userId)
    .maybeSingle()

  if (!existingUser) {
    const { error: insertError } = await admin.from('users').insert({
      id: userId,
      email: email || `${userId}@unknown.local`,
      is_active: true,
      identity_verified_at: now,
      identity_verification_provider: provider,
      created_at: now,
      updated_at: now,
    })
    if (insertError) {
      console.warn('[VerificationCheck] Failed to insert users confirmation row', insertError.message)
    }
  } else {
    const { error: userError } = await admin
      .from('users')
      .update({
        identity_verified_at: existingUser.identity_verified_at || now,
        identity_verification_provider:
          existingUser.identity_verification_provider || provider,
        updated_at: now,
      })
      .eq('id', userId)

    if (userError) {
      console.warn('[VerificationCheck] Failed to set identity_verified_at', userError.message)
    }
  }

  // Keep profile flag in sync when a profile already exists
  await admin
    .from('profiles')
    .update({ verification_status: 'verified', updated_at: now })
    .eq('user_id', userId)
    .neq('verification_status', 'verified')

  clearVerificationCache(userId)
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
