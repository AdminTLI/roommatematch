import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import OnboardingWelcomePage from './pageClient'

interface WelcomePageProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function OnboardingProfessionalWelcome({ searchParams }: WelcomePageProps) {
  const params = await searchParams
  await checkOnboardingRedirect(params, {
    requiredUserType: 'professional',
    mismatchRedirectTo: '/onboarding/welcome',
  })
  return <OnboardingWelcomePage />
}

