import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import CompleteClient from '@/app/onboarding/complete/pageClient'

interface PageProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  await checkOnboardingRedirect(params, {
    requiredUserType: 'professional',
    mismatchRedirectTo: '/onboarding/complete',
  })
  return <CompleteClient />
}

