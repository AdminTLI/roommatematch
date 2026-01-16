'use client'

import { useState, useEffect } from 'react'
import { ChatList } from './chat-list'
import { ChatInterface } from '../[roomId]/components/chat-interface'
import { ProfileCompatibilityPane } from './profile-compatibility-pane'
import { User } from '@supabase/supabase-js'
import { MessageCircle } from 'lucide-react'

interface ChatThreeColumnLayoutProps {
  user: User
  initialChatId?: string | null
}

export function ChatThreeColumnLayout({ user, initialChatId }: ChatThreeColumnLayoutProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId || null)
  const [showChatView, setShowChatView] = useState(false) // For mobile: true = show chat, false = show list
  const [rightPaneOpen, setRightPaneOpen] = useState(false)

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
    setRightPaneOpen(false)
  }

  const handleToggleRightPane = () => {
    setRightPaneOpen(prev => !prev)
  }

  // Mobile: Show either list, chat, or right pane (one at a time)
  // Desktop: Show all three columns simultaneously
  return (
    <div
      className="flex flex-row h-full w-full min-h-0 overflow-hidden gap-2"
      style={{ 
        height: '100%', 
        maxHeight: '100%', 
        minHeight: 0,
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'row',
        width: '100%'
      }}
    >
      {/* Left Sidebar - Chat List */}
      <div
        className={`
          flex-shrink-0 bg-white dark:bg-gray-900
          ${showChatView ? 'hidden lg:flex' : 'flex'}
          w-full lg:w-80
          flex-col min-h-0
          overflow-hidden
          relative
          rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm
        `}
      >
        <ChatList
          user={user}
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatId || undefined}
        />
      </div>

      {/* Middle Column - Chat Interface */}
      <div
        className={`
          flex-1 flex flex-col bg-chat-bg-primary overflow-hidden min-h-0 w-full
          ${showChatView ? 'flex' : 'hidden lg:flex'}
          relative rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm
        `}
        style={{ 
          height: '100%', 
          maxHeight: '100%', 
          minHeight: 0,
          flex: '1 1 0%',
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        {selectedChatId ? (
          <ChatInterface
            roomId={selectedChatId}
            user={user}
            onBack={handleBackToList}
            onToggleRightPane={handleToggleRightPane}
            rightPaneOpen={rightPaneOpen}
          />
        ) : (
          // Empty state when no chat selected (desktop only)
          <div className="flex-1 flex items-center justify-center bg-chat-bg-primary overflow-hidden relative">
            <div className="text-center max-w-md px-6 py-12 relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-indigo-600/20 backdrop-blur-xl border border-indigo-500/30 flex items-center justify-center shadow-[0_8px_32px_-8px_rgba(99,102,241,0.3)]">
                <MessageCircle className="h-12 w-12 text-indigo-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
                Select a conversation to start messaging
              </h2>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Profile/Compatibility Pane */}
      {selectedChatId && rightPaneOpen && (
        <div
          className={`
            flex-shrink-0
            flex
            w-full lg:w-96
            flex-col min-h-0
            overflow-hidden
            rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm
            transition-all duration-300 ease-in-out
            bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950
          `}
        >
          <ProfileCompatibilityPane
            chatId={selectedChatId}
            userId={user.id}
            isOpen={rightPaneOpen}
            onClose={handleToggleRightPane}
          />
        </div>
      )}
    </div>
  )
}
