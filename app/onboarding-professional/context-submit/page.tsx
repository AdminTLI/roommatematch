import { redirect } from 'next/navigation'
import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'

interface PageProps {
  searchParams: Promise<{ mode?: string }>
}

/** Legacy route: context submit is now inline on the professional-context page. */
export default async function ProfessionalContextSubmitPage({ searchParams }: PageProps) {
  const params = await searchParams
  await checkOnboardingRedirect(params, { requiredUserType: 'professional' })
  redirect('/onboarding-professional/professional-context')
}
