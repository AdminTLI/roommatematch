import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import IntroClient from './pageClient'

interface IntroPageProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function IntroPage({ searchParams }: IntroPageProps) {
  const params = await searchParams
  await checkOnboardingRedirect(params)
  return <IntroClient />
}


