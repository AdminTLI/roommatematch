'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { MessengerSidebar } from './messenger-sidebar'
import { MessengerConversation } from './messenger-conversation'
import { MessengerProfilePane } from './messenger-profile-pane'
import { NewChatModal } from './new-chat-modal'
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { queryClient, queryKeys } from '@/app/providers'
import { cn } from '@/lib/utils'
import { useMobileChatChrome } from '@/components/app/mobile-chat-chrome-context'

interface MessengerLayoutProps {
  user: User & { name?: string; email?: string }
  initialChatId?: string | null
  initialOtherUserId?: string | null
  onNewChat?: () => void
}

interface ChatInfo {
  id: string
  partnerName: string
  partnerAvatar?: string
}

/** Must match sheet `duration-300` */
const MOBILE_SHEET_TRANSITION_MS = 300

export function MessengerLayout({ user, initialChatId, initialOtherUserId, onNewChat }: MessengerLayoutProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId || null)
  const [rightPaneOpen, setRightPaneOpen] = useState(false)
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null)
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  /** Drives bottom-sheet enter animation (translate-y) on mobile */
  const [mobileSheetEntered, setMobileSheetEntered] = useState(false)
  const mobileSheetCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()
  const { setActiveMobileConversation } = useMobileChatChrome()

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

  // Below lg: hide floating dock + Domu while in a thread; restore when back to chat list.
  useEffect(() => {
    const body = document.body
    const active = !isDesktop && !!selectedChatId
    setActiveMobileConversation(active)
    if (active) {
      body.classList.add('mobile-chat-active-conversation')
    } else {
      body.classList.remove('mobile-chat-active-conversation')
    }
    return () => {
      setActiveMobileConversation(false)
      body.classList.remove('mobile-chat-active-conversation')
    }
  }, [isDesktop, selectedChatId, setActiveMobileConversation])

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

  // Bottom sheet: slide up after mount so transition runs from translate-y-full
  useEffect(() => {
    if (isDesktop || !rightPaneOpen || !selectedChatId) {
      setMobileSheetEntered(false)
      return
    }

    setMobileSheetEntered(false)
    let raf1 = 0
    let raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setMobileSheetEntered(true)
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [isDesktop, rightPaneOpen, selectedChatId])

  useEffect(() => {
    return () => {
      if (mobileSheetCloseTimerRef.current) {
        clearTimeout(mobileSheetCloseTimerRef.current)
      }
    }
  }, [])

  /** Slide sheet down, then unmount (matches open animation). Desktop closes immediately. */
  const closeMobileProfileSheet = useCallback(() => {
    if (isDesktop) {
      setRightPaneOpen(false)
      return
    }
    if (mobileSheetCloseTimerRef.current) {
      clearTimeout(mobileSheetCloseTimerRef.current)
      mobileSheetCloseTimerRef.current = null
    }
    setMobileSheetEntered(false)
    mobileSheetCloseTimerRef.current = setTimeout(() => {
      mobileSheetCloseTimerRef.current = null
      setRightPaneOpen(false)
    }, MOBILE_SHEET_TRANSITION_MS)
  }, [isDesktop])

  // Update selected chat when initialChatId changes
  useEffect(() => {
    if (initialChatId) {
      setSelectedChatId(initialChatId)
    }
  }, [initialChatId])

  // If we arrive from a notification without a chatId, resolve/create a direct chat from userId.
  useEffect(() => {
    const resolveChatFromOtherUser = async () => {
      if (!initialOtherUserId || initialOtherUserId === user.id || selectedChatId) {
        return
      }

      try {
        const response = await fetchWithCSRF('/api/chat/get-or-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ other_user_id: initialOtherUserId }),
        })

        if (!response.ok) return

        const data = await response.json()
        if (data?.chat_id) {
          setSelectedChatId(data.chat_id)
          queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })
        }
      } catch (error) {
        console.error('Failed to resolve chat from user id:', error)
      }
    }

    resolveChatFromOtherUser()
  }, [initialOtherUserId, selectedChatId, user.id])

  // Fetch chat info when chat is selected (without profiles API - MessengerConversation handles profiles)
  useEffect(() => {
    const fetchChatInfo = async () => {
      if (!selectedChatId) {
        setChatInfo(null)
        return
      }

      try {
        const { data: memberships } = await supabase
          .from('chat_members')
          .select('user_id')
          .eq('chat_id', selectedChatId)

        if (!memberships) return

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
    if (!isDesktop && rightPaneOpen) {
      closeMobileProfileSheet()
    }
  }

  const handleToggleRightPane = () => {
    if (!isDesktop && rightPaneOpen) {
      closeMobileProfileSheet()
      return
    }
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
    if (mobileSheetCloseTimerRef.current) {
      clearTimeout(mobileSheetCloseTimerRef.current)
      mobileSheetCloseTimerRef.current = null
    }
    setMobileSheetEntered(false)
    setRightPaneOpen(false)
  }

  const handleChatCreated = (chatId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })
    setSelectedChatId(chatId)
    setIsNewChatModalOpen(false)
  }

  const conversationEl = selectedChatId ? (
    <MessengerConversation
      chatId={selectedChatId}
      user={user}
      onToggleProfile={handleToggleRightPane}
      onBack={handleBackToList}
      partnerName={chatInfo?.partnerName ?? 'User'}
      partnerAvatar={chatInfo?.partnerAvatar}
      hideComposer={!isDesktop && rightPaneOpen}
    />
  ) : null

  const emptyStateEl = (
    <div className="flex flex-1 items-center justify-center bg-white dark:bg-gray-950">
      <div className="max-w-md px-6 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <svg
            className="h-10 w-10 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Select a conversation</h2>
        <p className="text-gray-600 dark:text-gray-400">Choose a chat from the list to start messaging</p>
      </div>
    </div>
  )

  return (
    <div
      data-messenger-chat
      className="flex h-full w-full flex-row overflow-hidden"
      style={{
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
      }}
    >
      {/* Desktop sidebar */}
      <div className="hidden w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 lg:flex">
        <MessengerSidebar
          user={user}
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatId}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Center: mobile sliding stack + desktop conversation column */}
      <div
        className="messenger-conversation-wrapper relative flex min-h-0 flex-1 min-w-0 flex-col overflow-hidden lg:rounded-lg lg:border lg:border-gray-200 lg:dark:border-gray-800"
        style={{
          height: '100%',
          maxHeight: '100%',
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Mobile: list + sliding conversation */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-gray-950 lg:hidden">
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col transition-[transform,opacity] duration-300 ease-out',
              selectedChatId && '-translate-x-1/4 opacity-50 pointer-events-none',
            )}
          >
            <MessengerSidebar
              user={user}
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChatId}
              onNewChat={handleNewChat}
            />
          </div>

          <div
            className={cn(
              'absolute inset-0 z-20 flex min-h-0 flex-col bg-white transition-transform duration-300 ease-out dark:bg-gray-950',
              selectedChatId ? 'translate-x-0' : 'pointer-events-none translate-x-full',
            )}
          >
            {conversationEl}
          </div>
        </div>

        {/* Desktop: conversation or empty */}
        <div className="hidden min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-gray-950 lg:flex">
          {conversationEl ?? emptyStateEl}
        </div>
      </div>

      {/* Desktop profile column */}
      {isDesktop && selectedChatId && rightPaneOpen && (
        <div
          data-messenger-profile
          className="hidden h-full max-h-full min-h-0 w-96 flex-shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-zinc-50 lg:flex dark:border-slate-800 dark:bg-zinc-950"
        >
          <MessengerProfilePane chatId={selectedChatId} isOpen={rightPaneOpen} onClose={handleToggleRightPane} />
        </div>
      )}

      {/* Mobile profile: backdrop + bottom sheet (85vh max) */}
      {!isDesktop && selectedChatId && rightPaneOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close profile"
            className="absolute inset-0 bg-black/60 transition-opacity duration-300 ease-out"
            onClick={handleToggleRightPane}
          />
          <div
            data-mobile-profile-sheet
            className={cn(
              'absolute bottom-0 left-0 right-0 z-[110] flex flex-col overflow-hidden rounded-t-2xl border-t border-gray-200 bg-zinc-100 shadow-2xl transition-transform duration-300 ease-out dark:border-slate-700 dark:bg-zinc-900',
              // Flush to bottom; ~8% backdrop remains for tap-to-dismiss. Inner flex fills solid color (no transparent hole).
              'h-[92dvh] max-h-[92dvh] min-h-0',
              mobileSheetEntered ? 'translate-y-0' : 'translate-y-full',
            )}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 flex-col items-center bg-zinc-100 pt-2 pb-1 dark:bg-slate-900/95 dark:backdrop-blur-sm">
              <button
                type="button"
                aria-label="Close profile sheet"
                className="mb-1 h-11 w-full max-w-[120px] touch-manipulation rounded-full py-2"
                onClick={handleToggleRightPane}
              >
                <span className="mx-auto block h-1 w-10 rounded-full bg-gray-400 dark:bg-slate-500" />
              </button>
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              <MessengerProfilePane chatId={selectedChatId} isOpen={rightPaneOpen} onClose={handleToggleRightPane} />
            </div>
          </div>
        </div>
      )}

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        user={user}
        onChatCreated={handleChatCreated}
      />
    </div>
  )
}
