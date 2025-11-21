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
      <div 
        data-chat-page
        className="w-full h-full overflow-hidden"
        style={{ 
          height: '100%',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          width: '100%',
          maxWidth: '100%'
        }}
      >
        <div 
          className="h-full w-full bg-bg-surface rounded-none sm:rounded-2xl overflow-hidden shadow-lg relative sm:shadow-lg flex flex-col"
          style={{ 
            height: '100%', 
            maxHeight: '100%', 
            minHeight: 0,
            flex: '1 1 0%',
            width: '100%',
            maxWidth: '100%'
          }}
        >
          <ChatSplitView user={user} />
        </div>
      </div>
    </AppShell>
  )
}

