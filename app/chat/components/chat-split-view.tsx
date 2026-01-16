'use client'

import { useState, useEffect } from 'react'
import { ChatList } from './chat-list'
import { ChatInterface } from '../[roomId]/components/chat-interface'
import { User } from '@supabase/supabase-js'
import { MessageCircle } from 'lucide-react'

interface ChatSplitViewProps {
  user: User
  initialChatId?: string | null
}

export function ChatSplitView({ user, initialChatId }: ChatSplitViewProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId || null)
  const [showChatView, setShowChatView] = useState(false) // For mobile: true = show chat, false = show list

  // Update selected chat when initialChatId changes (e.g., from URL parameter)
  useEffect(() => {
    if (initialChatId) {
      setSelectedChatId(initialChatId)
      // On mobile, switch to chat view when opening a specific chat
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setShowChatView(true)
      }
    }
  }, [initialChatId])

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
    <div
      className="flex h-full w-full min-h-0 overflow-hidden rounded-none sm:rounded-2xl bg-white border border-white shadow-2xl"
      style={{ height: '100%', maxHeight: '100%', minHeight: 0 }}
    >
      {/* Chat List - Left Side */}
      <div
        className={`
          flex-shrink-0 bg-white
          ${showChatView ? 'hidden lg:flex' : 'flex'}
          w-full lg:w-80 xl:w-96
          flex-col min-h-0
          ${showChatView ? '' : 'sm:rounded-l-2xl lg:rounded-r-none'}
          overflow-hidden
          relative
          border-r-0 lg:border-r lg:border-white
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
          flex-1 flex flex-col bg-transparent overflow-hidden min-h-0 w-full
          ${showChatView ? 'flex' : 'hidden lg:flex'}
          ${showChatView ? 'sm:rounded-r-2xl' : 'lg:rounded-r-2xl lg:rounded-l-none'}
          relative
        `}
        style={{ height: '100%', maxHeight: '100%', minHeight: 0 }}
      >
        {selectedChatId ? (
          <ChatInterface
            roomId={selectedChatId}
            user={user}
            onBack={handleBackToList}
          />
        ) : (
          // Empty state when no chat selected (desktop only)
          <div className="flex-1 flex items-center justify-center bg-transparent overflow-hidden relative">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent"></div>
            
            <div className="text-center max-w-md px-6 py-12 relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-indigo-600/20 backdrop-blur-xl border border-indigo-500/30 flex items-center justify-center shadow-[0_8px_32px_-8px_rgba(99,102,241,0.3)]">
                <MessageCircle className="h-12 w-12 text-indigo-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent mb-3">
                Select a conversation
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-medium max-w-sm mx-auto">
                Choose a chat from the list to start messaging with your matches
              </p>
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-500">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-700"></div>
                <span>or start a new conversation</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-700"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

