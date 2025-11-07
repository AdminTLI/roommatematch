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
  
  console.log(`[ChatRoom] Page loading for roomId: ${roomId}`)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log(`[ChatRoom] No user, redirecting to sign-in`)
    redirect('/auth/sign-in')
  }
  
  console.log(`[ChatRoom] User authenticated: ${user.id}`)

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
  // Use admin client to bypass RLS if needed, but still verify membership exists
  const { createAdminClient } = await import('@/lib/supabase/server')
  const admin = await createAdminClient()
  
  // First check with regular client (respects RLS)
  const { data: chatMember, error: chatMemberError } = await supabase
    .from('chat_members')
    .select('*')
    .eq('chat_id', roomId)
    .eq('user_id', user.id)
    .maybeSingle()

  // If RLS blocks the query, try with admin client to verify membership exists
  let membershipExists = false
  if (chatMemberError || !chatMember) {
    console.warn(`[ChatRoom] Regular client check failed, trying admin client`, {
      roomId,
      userId: user.id,
      error: chatMemberError,
      hasMember: !!chatMember
    })
    
    const { data: adminCheck } = await admin
      .from('chat_members')
      .select('id')
      .eq('chat_id', roomId)
      .eq('user_id', user.id)
      .maybeSingle()
    
    membershipExists = !!adminCheck
    
    if (!membershipExists) {
      // Check if chat exists at all for debugging
      const { data: chatExists } = await admin
        .from('chats')
        .select('id')
        .eq('id', roomId)
        .maybeSingle()
      
      console.warn(`[ChatRoom] User ${user.id} is not a member of chat ${roomId}`, {
        roomId,
        userId: user.id,
        chatExists: !!chatExists,
        chatId: chatExists?.id,
        adminCheckResult: adminCheck
      })
      redirect('/chat')
    } else {
      console.log(`[ChatRoom] Membership exists but RLS blocked access, proceeding anyway`, {
        roomId,
        userId: user.id
      })
    }
  } else {
    membershipExists = true
    console.log(`[ChatRoom] Membership verified for user ${user.id} in chat ${roomId}`)
  }

  if (!membershipExists) {
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
