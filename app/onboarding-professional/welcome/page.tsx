import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import OnboardingProfessionalWelcomeClient from './pageClient'

interface WelcomePageProps {
  searchParams: Promise<{ mode?: string }>
}

/** Young professional cohort: dedicated welcome UI + demographics (not the student welcome re-export). */
export default async function OnboardingProfessionalWelcome({ searchParams }: WelcomePageProps) {
  const params = await searchParams
  await checkOnboardingRedirect(params, {
    requiredUserType: 'professional',
    mismatchRedirectTo: '/onboarding/welcome',
  })
  return <OnboardingProfessionalWelcomeClient />
}

