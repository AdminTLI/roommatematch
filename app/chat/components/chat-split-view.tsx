'use client'

import { useState } from 'react'
import { ChatList } from './chat-list'
import { ChatInterface } from '../[roomId]/components/chat-interface'
import { User } from '@supabase/supabase-js'
import { MessageCircle } from 'lucide-react'

interface ChatSplitViewProps {
  user: User
}

export function ChatSplitView({ user }: ChatSplitViewProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [showChatView, setShowChatView] = useState(false) // For mobile: true = show chat, false = show list

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId)
    // On mobile, switch to chat view
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowChatView(true)
    }
  }

  const handleBackToList = () => {
    setShowChatView(false)
    // Optionally clear selection on mobile
    // setSelectedChatId(null)
  }

  // Mobile: Show either list or chat, not both
  // Desktop: Show both side-by-side
  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl">
      {/* Chat List - Left Side */}
      <div 
        className={`
          flex-shrink-0 bg-bg-surface border-r border-border-subtle
          ${showChatView ? 'hidden lg:flex' : 'flex'}
          w-full lg:w-80 xl:w-96
          flex-col
          ${showChatView ? '' : 'rounded-l-2xl lg:rounded-r-none'}
          overflow-hidden
          relative
        `}
      >
        <ChatList 
          user={user} 
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatId || undefined}
        />
      </div>

      {/* Chat Interface - Right Side - Full width on mobile */}
      <div 
        className={`
          flex-1 flex flex-col bg-bg-surface overflow-hidden
          ${showChatView ? 'flex' : 'hidden lg:flex'}
          ${showChatView ? 'rounded-r-2xl w-full' : 'lg:rounded-r-2xl lg:rounded-l-none'}
          relative
        `}
      >
        {selectedChatId ? (
          <ChatInterface 
            roomId={selectedChatId}
            user={user}
            onBack={handleBackToList}
          />
        ) : (
          // Empty state when no chat selected (desktop only)
          <div className="flex-1 flex items-center justify-center bg-bg-surface overflow-hidden">
            <div className="text-center max-w-md px-6 py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-semantic-accent-soft flex items-center justify-center">
                <MessageCircle className="h-10 w-10 text-semantic-accent" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3">
                Select a conversation
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-normal">
                Choose a chat from the list to start messaging with your matches
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

