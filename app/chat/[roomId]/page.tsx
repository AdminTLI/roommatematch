import { ChatInterface } from './components/chat-interface'
import { AppHeader } from '@/app/(components)/app-header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface ChatPageProps {
  params: Promise<{
    roomId: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo bypass - create a mock user for demo purposes
  const demoUser = user || {
    id: 'demo-user-id',
    email: 'demo@account.com',
    user_metadata: {
      full_name: 'Demo Student'
    }
  }

  if (!user) {
    // For demo purposes, we'll still show the chat page
    // In a real app, this would redirect to sign-in
    console.log('Demo mode: showing chat room without authentication')
  }

  // Skip access checks for demo mode
  if (user) {
    // Check if user has access to this chat room
    const { data: chatMember } = await supabase
      .from('chat_members')
      .select('*')
      .eq('chat_id', roomId)
      .eq('user_id', user.id)
      .single()

    if (!chatMember) {
      redirect('/matches')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md transition-all duration-200"
      >
        Skip to main content
      </a>

      {/* Header */}
      <AppHeader user={{
        id: demoUser.id,
        email: demoUser.email || '',
        name: demoUser.user_metadata?.full_name,
        avatar: demoUser.user_metadata?.avatar_url
      }} />

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-8">
        <ChatInterface 
          roomId={roomId} 
          user={demoUser}
        />
      </main>
    </div>
  )
}
