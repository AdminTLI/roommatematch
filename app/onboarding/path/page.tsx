import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import PathSelectionClient from './pageClient'

interface PathPageProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function OnboardingPathPage({ searchParams }: PathPageProps) {
  await checkOnboardingRedirect(await searchParams, { requireUserType: false })
  return <PathSelectionClient />
}
