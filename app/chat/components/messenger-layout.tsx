'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { MessengerSidebar } from './messenger-sidebar'
import { MessengerConversation } from './messenger-conversation'
import { MessengerProfilePane } from './messenger-profile-pane'
import { NewChatModal } from './new-chat-modal'
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { queryClient, queryKeys } from '@/app/providers'
import { cn } from '@/lib/utils'

interface MessengerLayoutProps {
  user: User & { name?: string; email?: string }
  initialChatId?: string | null
  onNewChat?: () => void
}

interface ChatInfo {
  id: string
  partnerName: string
  partnerAvatar?: string
}

export function MessengerLayout({ user, initialChatId, onNewChat }: MessengerLayoutProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId || null)
  const [rightPaneOpen, setRightPaneOpen] = useState(false)
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null)
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    root.classList.add('chat-page')
    body.classList.add('chat-page')

    return () => {
      root.classList.remove('chat-page')
      body.classList.remove('chat-page')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const updateIsDesktop = () => setIsDesktop(mediaQuery.matches)

    updateIsDesktop()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateIsDesktop)
      return () => mediaQuery.removeEventListener('change', updateIsDesktop)
    }

    mediaQuery.addListener(updateIsDesktop)
    return () => mediaQuery.removeListener(updateIsDesktop)
  }, [])

  // Update selected chat when initialChatId changes
  useEffect(() => {
    if (initialChatId) {
      setSelectedChatId(initialChatId)
    }
  }, [initialChatId])

  // Fetch chat info when chat is selected (without profiles API - MessengerConversation handles profiles)
  useEffect(() => {
    const fetchChatInfo = async () => {
      if (!selectedChatId) {
        setChatInfo(null)
        return
      }

      try {
        // Get chat members
        const { data: memberships } = await supabase
          .from('chat_members')
          .select('user_id')
          .eq('chat_id', selectedChatId)

        if (!memberships) return

        // Set default chat info (partner name will be updated by MessengerConversation if needed)
        setChatInfo({
          id: selectedChatId,
          partnerName: 'User',
          partnerAvatar: undefined
        })
      } catch (error) {
        console.error('Failed to fetch chat info:', error)
        setChatInfo({
          id: selectedChatId,
          partnerName: 'User',
          partnerAvatar: undefined
        })
      }
    }

    fetchChatInfo()
  }, [selectedChatId, user.id, supabase])

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId)
    // On mobile, close right pane when selecting chat
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setRightPaneOpen(false)
    }
  }

  const handleToggleRightPane = () => {
    setRightPaneOpen(prev => !prev)
  }

  const handleNewChat = () => {
    setIsNewChatModalOpen(true)
    if (onNewChat) {
      onNewChat()
    }
  }

  const handleBackToList = () => {
    setSelectedChatId(null)
    setRightPaneOpen(false)
  }

  const handleChatCreated = (chatId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })
    setSelectedChatId(chatId)
    setIsNewChatModalOpen(false)
  }

  return (
    <div
      data-messenger-chat
      className="flex flex-row h-full w-full overflow-hidden"
      style={{
        height: '100%',
        maxHeight: '100%',
        minHeight: 0
      }}
    >
      {/* Sidebar Column */}
      <div className="flex-shrink-0 w-80 border-r border-gray-200 dark:border-gray-800 hidden lg:flex">
        <MessengerSidebar
          user={user}
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatId}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Mobile Sidebar - Overlay */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        selectedChatId ? 'hidden' : 'block'
      )}>
        <MessengerSidebar
          user={user}
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatId}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Center Column - Conversation */}
      <div 
        className="flex-1 min-w-0 flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 messenger-conversation-wrapper"
        style={{
          height: '100%',
          maxHeight: '100%',
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {selectedChatId && chatInfo ? (
          <MessengerConversation
            chatId={selectedChatId}
            user={user}
            onToggleProfile={handleToggleRightPane}
            onBack={handleBackToList}
            partnerName={chatInfo.partnerName}
            partnerAvatar={chatInfo.partnerAvatar}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="text-center max-w-md px-6">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center">
                <svg
                  className="h-12 w-12 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Select a conversation
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Profile Pane */}
      {isDesktop && selectedChatId && rightPaneOpen && (
        <div
          data-messenger-profile
          className={cn(
            'flex-shrink-0 w-96 border-l border-gray-200 dark:border-gray-800',
            'hidden lg:flex flex-col h-full'
          )}
          style={{
            height: '100%',
            maxHeight: '100%',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          <MessengerProfilePane
            chatId={selectedChatId}
            isOpen={rightPaneOpen}
            onClose={handleToggleRightPane}
          />
        </div>
      )}

      {/* Mobile Profile Pane - Overlay */}
      {!isDesktop && selectedChatId && rightPaneOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/50" onClick={handleToggleRightPane}>
          <div
            className="absolute inset-x-0 top-0 w-full flex flex-col bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950"
            style={{
              height: 'calc(100vh - var(--chat-bottom-offset, 96px))',
              maxHeight: 'calc(100vh - var(--chat-bottom-offset, 96px))'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <MessengerProfilePane
              chatId={selectedChatId}
              isOpen={rightPaneOpen}
              onClose={handleToggleRightPane}
            />
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        user={user}
        onChatCreated={handleChatCreated}
      />
    </div>
  )
}
