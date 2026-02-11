import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import OnboardingWelcomePage from './pageClient'

interface WelcomePageProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function OnboardingWelcome({ searchParams }: WelcomePageProps) {
  const params = await searchParams
  await checkOnboardingRedirect(params)
  return <OnboardingWelcomePage />
}


