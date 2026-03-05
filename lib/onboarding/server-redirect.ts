import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type CheckOnboardingRedirectOptions = {
  /** When true (default), redirect to /onboarding/path if user_type is not set. Set false on the path page itself. */
  requireUserType?: boolean
}

/**
 * Server-side redirect helper for onboarding pages
 * Checks if user is authenticated, has selected cohort (user_type), and if they already have a submission
 */
export async function checkOnboardingRedirect(
  searchParams?: { mode?: string },
  options: CheckOnboardingRedirectOptions = {}
) {
  const { requireUserType = true } = options
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }
  
  // Cohort gate: must have user_type before any other onboarding step
  if (requireUserType) {
    const { data: userRow } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .maybeSingle()
    const userType = userRow?.user_type ?? null
    const hasUserType = userType === 'student' || userType === 'professional'
    if (!hasUserType) {
      redirect('/onboarding/path')
    }
  }
  
  // Check if this is edit mode - allow editing even if submission exists
  const isEditMode = searchParams?.mode === 'edit'
  
  if (!isEditMode) {
    const { data: submission } = await supabase
      .from('onboarding_submissions')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (submission) {
      redirect('/dashboard')
    }
  }
  
  return user
}
