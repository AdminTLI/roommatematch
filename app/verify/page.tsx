import { VerifyInterface } from './components/verify-interface'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkUserVerificationStatus } from '@/lib/auth/verification-check'
import { getUserProfile } from '@/lib/auth/user-profile'

export default async function VerifyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Single source of truth: checkUserVerificationStatus (uses verifications + profiles via admin)
  const verificationStatus = await checkUserVerificationStatus(user)

  // Verified users: redirect immediately - never show Persona
  if (!verificationStatus.needsEmailVerification && !verificationStatus.needsPersonaVerification) {
    redirect('/onboarding/intro')
  }

  if (verificationStatus.needsEmailVerification) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(user.email || '')}&auto=1`)
  }

  // Get user profile for AppShell
  const userProfile = await getUserProfile(user.id)
  if (!userProfile) {
    redirect('/auth/sign-in')
  }

  // If no profile exists yet, that's fine - verification happens before profile creation

  return (
    <AppShell user={userProfile} hideVerificationBanner={true}>
      <VerifyInterface user={user} />
    </AppShell>
  )
}
