import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkUserVerificationStatus, getVerificationRedirectUrl } from '@/lib/auth/verification-check'
import { getUserProfile } from '@/lib/auth/user-profile'
import { getOnboardingRedirectUrlIfIncomplete } from '@/lib/onboarding/server-redirect'
import { MessengerLayout } from './components/messenger-layout'
import { DomuChatWidget } from '../dashboard/components/domu-chat-widget'

interface ChatPageProps {
  searchParams: Promise<{ chatId?: string; userId?: string }>
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams
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

  const onboardingRedirect = await getOnboardingRedirectUrlIfIncomplete(user.id)
  if (onboardingRedirect) {
    redirect(onboardingRedirect)
  }

  // Get user profile with proper name
  const userProfile = await getUserProfile(user.id)
  if (!userProfile) {
    redirect('/auth/sign-in')
  }

  const initialChatId = params.chatId || null
  const initialOtherUserId = params.userId || null

  return (
    <>
      <AppShell 
        user={userProfile}
        showQuestionnairePrompt={true}
      >
        <div data-chat-page className="w-full h-full">
          <MessengerLayout
            user={{
              ...user,
              name: userProfile.name || userProfile.first_name || user.email?.split('@')[0] || 'User',
              email: user.email
            }}
            initialChatId={initialChatId}
            initialOtherUserId={initialOtherUserId}
          />
        </div>
      </AppShell>
      <DomuChatWidget />
    </>
  )
}

