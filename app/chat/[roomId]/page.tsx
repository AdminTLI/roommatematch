import { ChatInterface } from './components/chat-interface'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/user-profile'

interface ChatPageProps {
  params: Promise<{
    roomId: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Block demo user from accessing real chat rooms in production
  // Redirect to chat list instead of dashboard for better UX
  if (process.env.NODE_ENV === 'production' && process.env.DEMO_USER_EMAIL && user.email === process.env.DEMO_USER_EMAIL) {
    redirect('/chat')
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

  // Check if user has access to this chat room
  const { data: chatMember, error: chatMemberError } = await supabase
    .from('chat_members')
    .select('*')
    .eq('chat_id', roomId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (chatMemberError) {
    console.error(`[ChatRoom] Error checking membership for chat ${roomId}:`, chatMemberError)
    redirect('/chat')
  }

  if (!chatMember) {
    console.warn(`[ChatRoom] User ${user.id} is not a member of chat ${roomId}`)
    redirect('/chat')
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
      <ChatInterface 
        roomId={roomId} 
        user={user}
      />
    </AppShell>
  )
}
