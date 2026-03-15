import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import SectionClient from '@/app/onboarding/social-hosting-language/pageClient'

interface PageProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  await checkOnboardingRedirect(params, {
    requiredUserType: 'professional',
    mismatchRedirectTo: '/onboarding/social-hosting-language',
  })
  return <SectionClient />
}

