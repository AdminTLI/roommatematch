import { StudentMatchesInterface } from './components/student-matches-interface'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/user-profile'
import { checkUserVerificationStatus, getVerificationRedirectUrl } from '@/lib/auth/verification-check'
import { getOnboardingRedirectUrlIfIncomplete } from '@/lib/onboarding/server-redirect'
import { DomuChatWidget } from '../dashboard/components/domu-chat-widget'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const onboardingRedirect = await getOnboardingRedirectUrlIfIncomplete(user.id)
  if (onboardingRedirect) {
    redirect(onboardingRedirect)
  }

  // Check verification status (backup check - middleware also enforces this)
  const verificationStatus = await checkUserVerificationStatus(user)
  const redirectUrl = getVerificationRedirectUrl(verificationStatus)
  if (redirectUrl) {
    if (redirectUrl === '/auth/verify-email' && user.email) {
      redirect(`/auth/verify-email?email=${encodeURIComponent(user.email)}&auto=1`)
    } else if (redirectUrl === '/verify') {
      redirect('/verify?redirect=/matches')
    } else {
      redirect(redirectUrl)
    }
  }

  // Get user profile with proper name
  const userProfile = await getUserProfile(user.id)
  if (!userProfile) {
    redirect('/auth/sign-in')
  }

  // Get first name from profile for the greeting
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('user_id', user.id)
    .maybeSingle()

  // Create user object with name and first name for StudentMatchesInterface
  const userWithName = {
    id: user.id,
    email: user.email || '',
    name: userProfile.name,
    firstName: profile?.first_name || userProfile.name?.split(' ')[0] || 'Student',
    avatar: userProfile.avatar,
  }

  return (
    <>
      <AppShell 
        user={userProfile}
        showQuestionnairePrompt={true}
      >
        <StudentMatchesInterface user={userWithName} />
      </AppShell>
      <DomuChatWidget />
    </>
  )
}
