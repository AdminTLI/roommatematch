import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'

interface PageProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  await checkOnboardingRedirect(params, {
    requiredUserType: 'student',
    mismatchRedirectTo: '/onboarding-professional/location-commute',
  })
  const SectionClient = (await import('./pageClient')).default
  return <SectionClient />
}


