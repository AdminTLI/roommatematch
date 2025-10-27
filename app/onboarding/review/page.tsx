import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import ReviewClient from './pageClient'

export default async function Page() {
  await checkOnboardingRedirect()
  return <ReviewClient />
}


