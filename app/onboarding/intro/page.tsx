import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import IntroClient from './pageClient'

export default async function IntroPage() {
  await checkOnboardingRedirect()
  return <IntroClient />
}


