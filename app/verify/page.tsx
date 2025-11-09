import { VerifyInterface } from './components/verify-interface'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkUserVerificationStatus, getVerificationRedirectUrl } from '@/lib/auth/verification-check'
import { getUserProfile } from '@/lib/auth/user-profile'

export default async function VerifyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // STRICT email verification check - must be verified before Persona verification
  // Check using the centralized verification utility for consistency
  const verificationStatus = await checkUserVerificationStatus(user)
  
  // If email is not verified, redirect immediately
  if (verificationStatus.needsEmailVerification) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(user.email || '')}&auto=1`)
  }

  // Double-check email_confirmed_at directly as well (defense in depth)
  const emailVerified = Boolean(
    user.email_confirmed_at &&
    typeof user.email_confirmed_at === 'string' &&
    user.email_confirmed_at.length > 0 &&
    !isNaN(Date.parse(user.email_confirmed_at))
  )

  if (!emailVerified) {
    // Redirect to email verification page
    redirect(`/auth/verify-email?email=${encodeURIComponent(user.email || '')}&auto=1`)
  }

  // Check verification status (profile may not exist yet since verification comes before onboarding)
  // First check verifications table (source of truth)
  const { data: verification } = await supabase
    .from('verifications')
    .select('status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // If verification is approved, redirect to onboarding
  if (verification?.status === 'approved') {
    redirect('/onboarding/intro')
  }

  // Also check profile status as fallback
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, verification_status')
    .eq('user_id', user.id)
    .maybeSingle()

  // If profile exists and is verified, redirect to onboarding
  if (profile && profile.verification_status === 'verified') {
    redirect('/onboarding/intro')
  }

  // Get user profile for AppShell
  const userProfile = await getUserProfile(user.id)
  if (!userProfile) {
    redirect('/auth/sign-in')
  }

  // If no profile exists yet, that's fine - verification happens before profile creation

  return (
    <AppShell user={userProfile}>
      <VerifyInterface user={user} />
    </AppShell>
  )
}
