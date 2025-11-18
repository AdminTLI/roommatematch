import { ChatSplitView } from './components/chat-split-view'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkUserVerificationStatus, getVerificationRedirectUrl } from '@/lib/auth/verification-check'
import { getUserProfile } from '@/lib/auth/user-profile'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check verification status (backup check - middleware also enforces this)
  const verificationStatus = await checkUserVerificationStatus(user)
  const redirectUrl = getVerificationRedirectUrl(verificationStatus)
  if (redirectUrl) {
    if (redirectUrl === '/auth/verify-email' && user.email) {
      redirect(`/auth/verify-email?email=${encodeURIComponent(user.email)}&auto=1`)
    } else if (redirectUrl === '/verify') {
      redirect('/verify?redirect=/chat')
    } else {
      redirect(redirectUrl)
    }
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

  // Get user profile with proper name
  const userProfile = await getUserProfile(user.id)
  if (!userProfile) {
    redirect('/auth/sign-in')
  }

  return (
    <AppShell 
      user={userProfile}
      showQuestionnairePrompt={true}
    >
      <div className="w-full h-full -m-4 sm:-m-6 lg:-m-8 overflow-hidden">
        <div className="h-full w-full bg-bg-surface rounded-2xl overflow-hidden shadow-lg relative">
          <ChatSplitView user={user} />
        </div>
      </div>
    </AppShell>
  )
}
