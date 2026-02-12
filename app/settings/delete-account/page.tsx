import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DeleteAccountClient } from './DeleteAccountClient'
import { getUserProfile } from '@/lib/auth/user-profile'

/**
 * Delete Account interstitial page - Retention & Exit Survey flow
 * When user clicks "Delete Account" in settings, they land here first.
 * Flow: Convince (Hide Profile option) -> Exit Survey -> Execution
 */
export default async function DeleteAccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const userProfile = await getUserProfile(user.id)
  if (!userProfile) {
    redirect('/auth/sign-in')
  }

  // Fetch response count for "effort preservation" copy (e.g. "200 questions you answered")
  const { count: responseCount } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fallback to ~200 if no responses (intro section count or item bank size)
  const questionCount = responseCount ?? 200

  // Fetch profile for is_visible (Hide Profile) state
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_visible')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <AppShell user={userProfile}>
      <DeleteAccountClient
        questionCount={questionCount}
        isProfileHidden={profile?.is_visible === false}
      />
    </AppShell>
  )
}
