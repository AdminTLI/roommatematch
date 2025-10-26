import { StudentMatchesInterface } from './components/student-matches-interface'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check if user has completed onboarding
  const { data: submission } = await supabase
    .from('onboarding_submissions')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!submission) {
    redirect('/onboarding')
  }

  // Check verification status
  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('user_id', user.id)
    .maybeSingle()

  // Comment out verification check for now
  // Will re-enable when verification system is ready
  /*
  if (profile && profile.verification_status !== 'verified') {
    redirect('/verify')
  }
  */

  return (
    <AppShell 
      user={{
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || 'User',
        avatar: user.user_metadata?.avatar_url
      }}
      showQuestionnairePrompt={true}
    >
      <StudentMatchesInterface user={user} />
    </AppShell>
  )
}
