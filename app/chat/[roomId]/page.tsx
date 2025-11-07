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
  
  console.log(`[ChatRoom] User authenticated: ${user.id}`, {
    email: user.email,
    isDemoUser: process.env.DEMO_USER_EMAIL && user.email === process.env.DEMO_USER_EMAIL
  })

  // Note: Demo user check removed - demo users should be able to access chats they're members of
  // If you need to block demo users, do it at the chat creation level, not at access level

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
  // Use admin client to bypass RLS and verify membership exists
  const { createAdminClient } = await import('@/lib/supabase/server')
  const admin = await createAdminClient()
  
  // Use admin client directly to bypass RLS issues
  // This ensures we can check membership even if RLS policies are restrictive
  const { data: chatMember, error: chatMemberError } = await admin
    .from('chat_members')
    .select('id, chat_id, user_id, last_read_at')
    .eq('chat_id', roomId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (chatMemberError) {
    console.error(`[ChatRoom] Error checking membership for chat ${roomId}:`, {
      error: chatMemberError,
      roomId,
      userId: user.id,
      errorCode: chatMemberError.code,
      errorMessage: chatMemberError.message
    })
    redirect('/chat')
  }

  if (!chatMember) {
    // Check if chat exists at all for debugging
    const { data: chatExists } = await admin
      .from('chats')
      .select('id, is_group, created_at')
      .eq('id', roomId)
      .maybeSingle()
    
    // Also check all memberships for this user to see what chats they have access to
    const { data: userMemberships } = await admin
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', user.id)
      .limit(10)
    
    console.warn(`[ChatRoom] User ${user.id} is not a member of chat ${roomId}`, {
      roomId,
      userId: user.id,
      chatExists: !!chatExists,
      chatId: chatExists?.id,
      userHasMemberships: userMemberships?.length || 0,
      userChatIds: userMemberships?.map(m => m.chat_id) || []
    })
    redirect('/chat')
  }

  console.log(`[ChatRoom] Membership verified for user ${user.id} in chat ${roomId}`, {
    membershipId: chatMember.id,
    lastReadAt: chatMember.last_read_at
  })

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
