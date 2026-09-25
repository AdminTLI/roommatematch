import { VerifyInterface } from './components/verify-interface'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkUserVerificationStatus } from '@/lib/auth/verification-check'
import { getUserProfile } from '@/lib/auth/user-profile'
import { getOnboardingRedirectUrlIfIncomplete } from '@/lib/onboarding/server-redirect'

function safeInternalRedirect(redirectParam: string | undefined): string {
  // Default after Persona: dashboard (Persona is no longer required before onboarding)
  if (!redirectParam || !redirectParam.startsWith('/') || redirectParam.startsWith('//')) {
    return '/dashboard'
  }
  // Never bounce verified users back into verification loops
  if (redirectParam === '/verify' || redirectParam.startsWith('/verify?')) {
    return '/dashboard'
  }
  return redirectParam
}

/** Persona page is only for intentional unlocks (chat, matches, settings) — not signup. */
function isIntentionalPersonaVisit(
  redirectParam: string | undefined,
  reason: string | undefined,
  from: string | undefined
): boolean {
  if (from === 'accept' || from === 'settings' || from === 'chat') return true
  if (reason === 'persona_verification_required') return true
  if (!redirectParam) return false
  return (
    redirectParam.startsWith('/chat') ||
    redirectParam.startsWith('/matches') ||
    redirectParam.startsWith('/settings') ||
    redirectParam.startsWith('/forum')
  )
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const params = (await searchParams) || {}
  const redirectParam = typeof params.redirect === 'string' ? params.redirect : undefined
  const reason = typeof params.reason === 'string' ? params.reason : undefined
  const from = typeof params.from === 'string' ? params.from : undefined
  const destination = safeInternalRedirect(redirectParam)

  // Attempt a background sync in case verification exists but durable flags lagged
  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const { markIdentityVerified } = await import('@/lib/auth/verification-check')
    const admin = createAdminClient()
    const [{ data: approved }, { data: userRow }, { data: profile }] = await Promise.all([
      admin
        .from('verifications')
        .select('provider')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .limit(1)
        .maybeSingle(),
      admin
        .from('users')
        .select('identity_verified_at')
        .eq('id', user.id)
        .maybeSingle(),
      admin
        .from('profiles')
        .select('verification_status')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    if (
      approved ||
      userRow?.identity_verified_at ||
      profile?.verification_status === 'verified'
    ) {
      await markIdentityVerified(user.id, approved?.provider || 'persona', user.email)
    }
  } catch {
    // Non-fatal: page still uses checkUserVerificationStatus below
  }

  // Single source of truth: checkUserVerificationStatus (users + verifications + profiles)
  const verificationStatus = await checkUserVerificationStatus(user)

  // Verified users: redirect immediately - never show Persona
  if (!verificationStatus.needsEmailVerification && !verificationStatus.needsPersonaVerification) {
    redirect(destination)
  }

  if (verificationStatus.needsEmailVerification) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(user.email || '')}&auto=1`)
  }

  // Registration no longer uses this page — skip the old "Verify your identity" interstitial
  if (
    verificationStatus.needsPersonaVerification &&
    !isIntentionalPersonaVisit(redirectParam, reason, from)
  ) {
    const onboardingRedirect = await getOnboardingRedirectUrlIfIncomplete(user.id)
    redirect(onboardingRedirect || '/dashboard')
  }

  // Get user profile for AppShell
  const userProfile = await getUserProfile(user.id)
  if (!userProfile) {
    redirect('/auth/sign-in')
  }

  return (
    <AppShell user={userProfile} hideVerificationBanner={true}>
      <VerifyInterface user={user} redirectTo={destination} />
    </AppShell>
  )
}
