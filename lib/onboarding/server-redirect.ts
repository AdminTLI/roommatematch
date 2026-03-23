import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * Returns the onboarding URL to redirect to if the user has not completed their cohort questionnaire, or null if complete.
 * Use on dashboard, matches, chat, etc. to send professionals to /onboarding-professional and students to /onboarding.
 */
export async function getOnboardingRedirectUrlIfIncomplete(userId: string): Promise<string | null> {
  const service = createServiceClient()
  const { data: userRow } = await service
    .from('users')
    .select('user_type')
    .eq('id', userId)
    .maybeSingle()
  const userType = (userRow?.user_type === 'student' || userRow?.user_type === 'professional')
    ? userRow.user_type
    : null
  if (!userType) return '/onboarding/path'
  const { data: submission } = await service
    .from('onboarding_submissions')
    .select('user_type')
    .eq('user_id', userId)
    .maybeSingle()
  const complete =
    userType === 'professional'
      ? submission?.user_type === 'professional'
      : submission && (submission.user_type === 'student' || submission.user_type == null)
  if (complete) return null
  return userType === 'professional' ? '/onboarding-professional/welcome' : '/onboarding/welcome'
}

export type CheckOnboardingRedirectOptions = {
  /** When true (default), redirect to /onboarding/path if user_type is not set. Set false on the path page itself. */
  requireUserType?: boolean
  /** When provided, enforce that the user is on the correct cohort flow. */
  requiredUserType?: 'student' | 'professional'
  /** When cohort mismatches, redirect here (defaults to cohort welcome). */
  mismatchRedirectTo?: string
}

/**
 * Server-side redirect helper for onboarding pages
 * Checks if user is authenticated, has selected cohort (user_type), and if they already have a submission
 */
export async function checkOnboardingRedirect(
  searchParams?: { mode?: string; edit?: string },
  options: CheckOnboardingRedirectOptions = {}
) {
  const { requireUserType = true, requiredUserType, mismatchRedirectTo } = options
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Use service role for onboarding gating reads to avoid RLS edge cases
  // (reads are scoped by user.id, auth is still enforced above)
  const service = createServiceClient()
  
  // Cohort gate: must have user_type before any other onboarding step
  let userType: 'student' | 'professional' | null = null
  if (requireUserType || requiredUserType) {
    const { data: userRow, error: userFetchError } = await service
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .maybeSingle()

    if (userFetchError) {
      console.error('[checkOnboardingRedirect] users select error:', userFetchError.message ?? userFetchError)
    }

    userType = (userRow?.user_type === 'student' || userRow?.user_type === 'professional')
      ? userRow.user_type
      : null
  }

  if (requireUserType) {
    if (!userType) {
      redirect('/onboarding/path')
    }
  }

  if (requiredUserType) {
    if (!userType) {
      redirect('/onboarding/path')
    }
    if (userType !== requiredUserType) {
      if (mismatchRedirectTo) {
        redirect(mismatchRedirectTo)
      }
      redirect(userType === 'professional' ? '/onboarding-professional/welcome' : '/onboarding/welcome')
    }
  }
  
  // Check if this is edit mode - allow editing even if submission exists
  const isEditMode = searchParams?.edit === '1' || searchParams?.mode === 'edit'
  
  if (!isEditMode) {
    const { data: submission, error: submissionFetchError } = await service
      .from('onboarding_submissions')
      .select('id, user_type')
      .eq('user_id', user.id)
      .maybeSingle()

    if (submissionFetchError) {
      console.error(
        '[checkOnboardingRedirect] onboarding_submissions select error:',
        submissionFetchError.message ?? submissionFetchError
      )
    }

    // Completion counts only when submission matches the user's cohort (student vs professional)
    const submissionMatchesCohort =
      submission &&
      (userType === 'professional'
        ? submission.user_type === 'professional'
        : userType === 'student'
          ? (submission.user_type === 'student' || submission.user_type == null)
          : false)
    
    if (submissionMatchesCohort) {
      redirect('/dashboard')
    }
  }
  
  return user
}
