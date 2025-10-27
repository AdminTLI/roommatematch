import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Server-side redirect helper for onboarding pages
 * Checks if user is authenticated and if they already have a submission
 * Redirects to appropriate page based on status
 */
export async function checkOnboardingRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }
  
  // Check if user already has a submission - redirect to dashboard if so
  const { data: submission } = await supabase
    .from('onboarding_submissions')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  
  if (submission) {
    redirect('/dashboard')
  }
  
  return user
}
