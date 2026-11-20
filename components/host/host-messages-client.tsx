'use client'

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MessengerConversation } from '@/app/chat/components/messenger-conversation'
import { MessengerHousingApplicantPane } from '@/app/chat/components/messenger-housing-applicant-pane'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useMobileChatChrome } from '@/components/app/mobile-chat-chrome-context'
import type { User } from '@supabase/supabase-js'

type Thread = {
  chat_id: string
  application_id: string
  listing_id: string
  listing_title: string
  status: string
  fit_score: number | null
  partner_name: string
  partner_avatar: string | null
  partner_user_id: string
  last_message: { content: string; created_at: string } | null
  unread_count: number
}

type RightPaneMode = 'insights' | null

function threadSubtitle(t: Thread) {
  const status = t.status.replace(/_/g, ' ')
  return `${t.listing_title} · ${status}`
}

function fitPercent(t: Thread) {
  return t.fit_score != null ? Math.round(Number(t.fit_score) * 100) : null
}

export function HostMessagesClient({
  searchParams,
}: {
  searchParams: Promise<{ chatId?: string }>
}) {
  const params = use(searchParams)
  const initialChatId = params.chatId || null
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId)
  const [user, setUser] = useState<User | null>(null)
  const [isDesktop, setIsDesktop] = useState(true)
  const [rightPaneMode, setRightPaneMode] = useState<RightPaneMode>(null)
  const [mobileSheetEntered, setMobileSheetEntered] = useState(false)
  const mobileSheetCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { setActiveMobileConversation } = useMobileChatChrome()

  const rightPaneOpen = rightPaneMode != null

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Match student /chat: lock page scroll + hide dock/topbar while a mobile thread is open
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    root.classList.add('chat-page')
    body.classList.add('chat-page')
    return () => {
      root.classList.remove('chat-page')
      body.classList.remove('chat-page')
      body.classList.remove('mobile-chat-active-conversation')
    }
  }, [])

  useEffect(() => {
    const active = !isDesktop && !!selectedChatId
    setActiveMobileConversation(active)
    const body = document.body
    if (active) body.classList.add('mobile-chat-active-conversation')
    else body.classList.remove('mobile-chat-active-conversation')
    return () => {
      setActiveMobileConversation(false)
      body.classList.remove('mobile-chat-active-conversation')
    }
  }, [isDesktop, selectedChatId, setActiveMobileConversation])

  const load = useCallback(() => {
    fetch('/api/host/messages')
      .then((r) => r.json())
      .then((j) => setThreads(j.threads || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (initialChatId) setSelectedChatId(initialChatId)
  }, [initialChatId])

  useEffect(() => {
    return () => {
      if (mobileSheetCloseTimerRef.current) clearTimeout(mobileSheetCloseTimerRef.current)
    }
  }, [])

  const selected = useMemo(
    () => threads.find((t) => t.chat_id === selectedChatId) || null,
    [threads, selectedChatId]
  )

  const closeRightPane = useCallback(() => {
    if (!isDesktop) {
      setMobileSheetEntered(false)
      if (mobileSheetCloseTimerRef.current) clearTimeout(mobileSheetCloseTimerRef.current)
      mobileSheetCloseTimerRef.current = setTimeout(() => {
        setRightPaneMode(null)
        mobileSheetCloseTimerRef.current = null
      }, 280)
      return
    }
    setRightPaneMode(null)
  }, [isDesktop])

  const openRightPaneMode = useCallback(
    (mode: Exclude<RightPaneMode, null>) => {
      if (mobileSheetCloseTimerRef.current) {
        clearTimeout(mobileSheetCloseTimerRef.current)
        mobileSheetCloseTimerRef.current = null
      }
      setRightPaneMode(mode)
      if (!isDesktop) {
        setMobileSheetEntered(false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setMobileSheetEntered(true))
        })
      }
    },
    [isDesktop]
  )

  const handleOpenInsights = useCallback(() => {
    if (rightPaneMode === 'insights') {
      closeRightPane()
      return
    }
    openRightPaneMode('insights')
  }, [closeRightPane, openRightPaneMode, rightPaneMode])

  const handleSelectChat = useCallback(
    (chatId: string) => {
      setSelectedChatId(chatId)
      if (!isDesktop && rightPaneOpen) closeRightPane()
      else if (isDesktop) setRightPaneMode(null)
    },
    [closeRightPane, isDesktop, rightPaneOpen]
  )

  const handleBackToList = useCallback(() => {
    setSelectedChatId(null)
    if (mobileSheetCloseTimerRef.current) {
      clearTimeout(mobileSheetCloseTimerRef.current)
      mobileSheetCloseTimerRef.current = null
    }
    setMobileSheetEntered(false)
    setRightPaneMode(null)
  }, [])

  const paneContent =
    selectedChatId && rightPaneMode === 'insights' ? (
      <MessengerHousingApplicantPane
        chatId={selectedChatId}
        isOpen
        onClose={closeRightPane}
      />
    ) : null

  const sidebar = (
    <div
      data-messenger-sidebar
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[hsl(var(--chat-bg-primary))]"
    >
      <div className="flex shrink-0 flex-col gap-1 border-b border-black/5 px-4 py-4 dark:border-white/10">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Applicants you accepted — discuss details, then send an offer.
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Loading…</p>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <MessageCircle className="h-8 w-8 text-indigo-500" />
            <p className="max-w-xs text-sm text-gray-600 dark:text-gray-300">
              When you Accept an applicant, your conversation appears here.
            </p>
            <Link
              href="/host/applications"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Review applications
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {threads.map((t) => {
              const active = t.chat_id === selectedChatId
              return (
                <li key={t.chat_id}>
                  <button
                    type="button"
                    onClick={() => handleSelectChat(t.chat_id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition touch-manipulation',
                      active
                        ? 'bg-[hsl(var(--chat-active-fill))] dark:bg-violet-950/40'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                    )}
                  >
                    <Avatar className="h-11 w-11 ring-2 ring-indigo-200/80 dark:ring-indigo-500/30">
                      <AvatarImage src={t.partner_avatar || undefined} alt="" />
                      <AvatarFallback className="bg-indigo-600 text-white">
                        {t.partner_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {t.partner_name}
                        </p>
                        <span className="shrink-0 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                          Applicant
                        </span>
                      </div>
                      <p className="flex items-center gap-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        <Home className="h-3 w-3 shrink-0" />
                        {t.listing_title}
                      </p>
                      {t.last_message ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                          {t.last_message.content}
                        </p>
                      ) : null}
                    </div>
                    {t.unread_count > 0 ? (
                      <span className="rounded-full bg-[#7C3AED] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {t.unread_count > 99 ? '99+' : t.unread_count}
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )

  const conversationEl =
    selected && user ? (
      <MessengerConversation
        chatId={selected.chat_id}
        user={user}
        onToggleProfile={handleOpenInsights}
        onBack={!isDesktop ? handleBackToList : undefined}
        partnerName={selected.partner_name}
        partnerAvatar={selected.partner_avatar || undefined}
        isHousingHostChat
        housingSubtitle={threadSubtitle(selected)}
        housingFitPercent={fitPercent(selected)}
        hideComposer={!isDesktop && rightPaneOpen}
      />
    ) : (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-[hsl(var(--chat-bg-primary))] p-8 text-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/50">
          <MessageCircle className="h-8 w-8 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Select a conversation</h2>
        <p className="max-w-sm text-gray-600 dark:text-gray-400">
          Choose an applicant from the list to continue the housing chat
        </p>
      </div>
    )

  return (
    <div
      data-host-messages
      data-messenger-chat
      className="flex h-full w-full flex-row gap-0 overflow-hidden bg-[hsl(var(--chat-bg-secondary))] lg:gap-3 lg:p-3"
      style={{ height: '100%', maxHeight: '100%', minHeight: 0 }}
    >
      {/* Desktop sidebar */}
      <div className="chat-panel-elev hidden w-80 flex-shrink-0 overflow-hidden rounded-2xl lg:flex">
        {sidebar}
      </div>

      {/* Center column — same sliding stack as student messenger */}
      <div
        className="messenger-conversation-wrapper chat-panel-elev relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:rounded-2xl"
        style={{ height: '100%', maxHeight: '100%', minHeight: 0 }}
      >
        {!isDesktop ? (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[hsl(var(--chat-bg-primary))]">
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col transition-[transform,opacity] duration-300 ease-out',
                selectedChatId && '-translate-x-1/4 opacity-50 pointer-events-none'
              )}
            >
              {sidebar}
            </div>
            <div
              className={cn(
                'absolute inset-0 z-20 flex min-h-0 flex-col bg-[hsl(var(--chat-bg-primary))] transition-transform duration-300 ease-out',
                selectedChatId ? 'translate-x-0' : 'pointer-events-none translate-x-full'
              )}
            >
              {conversationEl}
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[hsl(var(--chat-bg-primary))]">
            {conversationEl}
          </div>
        )}
      </div>

      {/* Desktop side column */}
      {isDesktop && selectedChatId && rightPaneOpen ? (
        <div
          data-messenger-profile
          className="chat-panel-elev relative z-10 hidden h-full max-h-full min-h-0 w-96 flex-shrink-0 flex-col overflow-hidden rounded-2xl bg-[hsl(var(--chat-bg-primary))] lg:flex"
          style={{ height: '100%', maxHeight: '100%', minHeight: 0 }}
        >
          <div className="flex h-full min-h-0 flex-1 flex-col animate-in fade-in slide-in-from-right-2 duration-300">
            {paneContent}
          </div>
        </div>
      ) : null}

      {/* Mobile bottom sheet */}
      {!isDesktop && selectedChatId && rightPaneOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close panel"
            className="absolute inset-0 z-0 bg-black/60 transition-opacity duration-300 ease-out"
            onClick={closeRightPane}
          />
          <div
            data-mobile-profile-sheet
            className={cn(
              'absolute bottom-0 left-0 right-0 z-10 flex flex-col overflow-hidden rounded-t-3xl bg-[hsl(var(--chat-bg-primary))] shadow-2xl transition-transform duration-300 ease-out',
              'h-[92dvh] max-h-[92dvh] min-h-0',
              mobileSheetEntered ? 'translate-y-0' : 'translate-y-full'
            )}
          >
            <div className="relative z-20 flex shrink-0 flex-col items-center bg-[hsl(var(--chat-bg-primary))] pt-2 pb-1">
              <button
                type="button"
                aria-label="Close panel sheet"
                className="mb-1 h-11 w-full max-w-[120px] touch-manipulation rounded-full py-2"
                onClick={closeRightPane}
              >
                <span className="mx-auto block h-1 w-10 rounded-full bg-gray-400 dark:bg-slate-500" />
              </button>
            </div>
            <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[hsl(var(--chat-bg-primary))]">
              {paneContent}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
