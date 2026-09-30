import { redirect } from 'next/navigation'
import { checkOnboardingRedirect } from '@/lib/onboarding/server-redirect'
import { ensureUserTypeFromAuthMetadata } from '@/lib/onboarding/ensure-user-type'
import PathSelectionClient from './pageClient'

interface PathPageProps {
  searchParams: Promise<{ mode?: string }>
}

/**
 * Cohort is normally chosen at /auth/sign-up and stored on users.user_type.
 * When user_type is already set, skip "Which best describes you?" and continue:
 * - professionals → professional welcome
 * - verified students → student welcome
 * - unverified students → academic verification gate only
 * Fallback: show path selection when user_type is still missing.
 */
export default async function OnboardingPathPage({ searchParams }: PathPageProps) {
  const user = await checkOnboardingRedirect(await searchParams, { requireUserType: false })
  const cohort = await ensureUserTypeFromAuthMetadata(user)

  if (cohort.user_type === 'professional') {
    redirect('/onboarding-professional/welcome')
  }

  if (cohort.user_type === 'student') {
    if (cohort.is_verified_student) {
      redirect('/onboarding/welcome')
    }
    return <PathSelectionClient skipSelection initialUserType="student" />
  }

  return <PathSelectionClient />
}
