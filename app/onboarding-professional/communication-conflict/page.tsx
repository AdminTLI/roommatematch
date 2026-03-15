import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import SectionClient from '@/app/onboarding/communication-conflict/pageClient'

interface PageProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  await checkOnboardingRedirect(params, {
    requiredUserType: 'professional',
    mismatchRedirectTo: '/onboarding/communication-conflict',
  })
  return <SectionClient />
}

