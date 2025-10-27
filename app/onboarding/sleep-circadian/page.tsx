import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import SectionClient from './pageClient'

export default async function Page() {
  await checkOnboardingRedirect()
  return <SectionClient />
}


