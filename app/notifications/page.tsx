import { NotificationsPage } from './components/notifications-page'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getOnboardingRedirectUrlIfIncomplete } from '@/lib/onboarding/server-redirect'

export default async function NotificationsPageWrapper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const onboardingRedirect = await getOnboardingRedirectUrlIfIncomplete(user.id)
  if (onboardingRedirect) {
    redirect(onboardingRedirect)
  }

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
      <NotificationsPage user={user} />
    </AppShell>
  )
}
