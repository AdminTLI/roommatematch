import { redirect } from 'next/navigation'
import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'

interface PageProps {
  searchParams: Promise<{ mode?: string }>
}

/** Legacy route: context submit is now inline on the logistics completion screen. */
export default async function ContextSubmitPage({ searchParams }: PageProps) {
  const params = await searchParams
  await checkOnboardingRedirect(params, { requiredUserType: 'student' })
  redirect('/onboarding/logistics-context')
}
