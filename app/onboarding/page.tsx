import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureUserTypeFromAuthMetadata } from '@/lib/onboarding/ensure-user-type'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const cohort = await ensureUserTypeFromAuthMetadata(user)

  // No cohort yet (legacy accounts): keep the path-selection fallback.
  if (!cohort.user_type) redirect('/onboarding/path')

  if (cohort.user_type === 'professional') {
    redirect('/onboarding-professional/welcome')
  }

  redirect('/onboarding/welcome')
}
