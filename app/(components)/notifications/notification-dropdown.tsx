'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { useRealtimeInvalidation } from '@/hooks/use-realtime-invalidation'
import type { Notification } from '@/lib/notifications/types'
import type { NotificationCounts } from '@/lib/notifications/types'
import { NotificationsModal } from '@/components/notifications/notifications-modal'
import { NotificationsPanel } from '@/components/notifications/notifications-panel'
import {
  NOTIFICATIONS_PAGE_SIZE,
  fetchMyNotifications,
  processNotificationsWithPrivacy,
  attachSenderAvatars,
} from '@/services/notificationsService'
import type { NotificationFilterCategory } from '@/types/notification'
import {
  chatHrefFromMetadata,
  isChatPanelNotificationType,
  notificationBelongsToChatThread,
  threadFromNotificationMetadata,
} from '@/lib/notifications/chat-navigation'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  onMarkAsRead: (notificationIds: string[]) => Promise<void>
  onMarkAllAsRead: () => Promise<void>
  counts: NotificationCounts | null
  userId: string
  refreshCounts: () => Promise<unknown>
}

export function NotificationDropdown({
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  counts,
  userId,
  refreshCounts,
}: NotificationDropdownProps) {
  const router = useRouter()
  const supabase = createClient()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const listScrollRef = useRef<HTMLDivElement>(null)
  const [category, setCategory] = useState<NotificationFilterCategory>('all')
  const [unreadOnly, setUnreadOnly] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setCategory('all')
      setUnreadOnly(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || isMobile || !mounted) return

    const updatePosition = () => {
      const bellButton = document.querySelector('[aria-label="Notifications"]') as HTMLElement
      if (!bellButton) return

      const bellRect = bellButton.getBoundingClientRect()
      const bellCenterX = bellRect.left + bellRect.width / 2
      const panelWidth = 420
      const panelLeft = bellCenterX - panelWidth / 2
      const padding = 16
      const left = Math.max(padding, Math.min(panelLeft, window.innerWidth - panelWidth - padding))

      setDropdownPosition({
        top: bellRect.bottom + window.scrollY + 8,
        left: left + window.scrollX,
      })
    }

    updatePosition()
    const handleScroll = (e: Event) => {
      const target = e.target as Node
      if (listScrollRef.current?.contains(target)) return
      updatePosition()
    }
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, isMobile, mounted])

  const fetchPage = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      const { notifications: raw, hasMore } = await fetchMyNotifications({
        limit: NOTIFICATIONS_PAGE_SIZE,
        offset: pageParam * NOTIFICATIONS_PAGE_SIZE,
        category,
        isRead: unreadOnly ? false : undefined,
      })
      const processed = await processNotificationsWithPrivacy(supabase, raw)
      const items = await attachSenderAvatars(supabase, processed)
      return { items, hasMore }
    },
    [supabase, category, unreadOnly]
  )

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ['notifications', 'dropdown', userId, category, unreadOnly],
    queryFn: fetchPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) => (lastPage.hasMore ? lastPageParam + 1 : undefined),
    enabled: isOpen && !!userId,
    staleTime: 10_000,
  })

  const notifications = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data?.pages])

  useRealtimeInvalidation({
    table: 'notifications',
    event: '*',
    filter: `user_id=eq.${userId}`,
    queryKeys: ['notifications', 'dropdown', userId],
    enabled: isOpen && !!userId,
    onInvalidate: () => {
      void refreshCounts()
    },
  })

  const getChatHref = (metadata: Record<string, unknown>) => chatHrefFromMetadata(metadata)

  const resolveChatHref = async (notification: Notification) => {
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/notifications/open-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notification.id }),
      })
      if (response.ok) {
        const resData = await response.json()
        if (typeof resData?.href === 'string' && resData.href.length > 0) return resData.href
      }
    } catch (error) {
      logger.warn('[NotificationDropdown] Failed to resolve chat href from notification', {
        detail: error instanceof Error ? error.message : String(error),
      })
    }
    return getChatHref((notification.metadata || {}) as Record<string, unknown>)
  }

  const removeThreadFromCache = useCallback(
    (notification: Notification) => {
      const thread = threadFromNotificationMetadata(
        (notification.metadata || {}) as Record<string, unknown>
      )
      queryClient.setQueriesData(
        { queryKey: ['notifications', 'dropdown', userId] },
        (old: { pages: { items: Notification[]; hasMore: boolean }[]; pageParams: unknown[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter(
                (item) =>
                  item.id !== notification.id &&
                  !notificationBelongsToChatThread(item, thread)
              ),
            })),
          }
        }
      )
    },
    [queryClient, userId]
  )

  const handleOpen = useCallback(
    async (notification: Notification) => {
      // Dismiss sheet/panel first so mobile focus is not trapped under the overlay
      onClose()

      const { metadata } = notification
      const meta = (metadata || {}) as Record<string, unknown>

      if (isChatPanelNotificationType(notification.type)) {
        removeThreadFromCache(notification)
      }

      switch (notification.type) {
        case 'match_created':
          if (meta.chat_id) {
            router.push(chatHrefFromMetadata(meta))
          } else {
            router.push('/matches?tab=suggested')
          }
          break
        case 'match_accepted':
          if (meta.chat_id) {
            router.push(chatHrefFromMetadata(meta))
          } else {
            router.push('/matches?tab=pending')
          }
          break
        case 'match_confirmed':
          if (meta.chat_id) {
            router.push(chatHrefFromMetadata(meta))
          } else {
            router.push('/matches?tab=confirmed')
          }
          break
        case 'chat_message':
        case 'chat_message_reaction':
          router.push(await resolveChatHref(notification))
          void queryClient.invalidateQueries({ queryKey: ['notifications'] })
          break
        case 'group_invitation':
          if (meta.chat_id) {
            router.push(chatHrefFromMetadata(meta))
          }
          break
        case 'profile_updated':
          router.push('/settings')
          break
        case 'questionnaire_completed':
          router.push('/matches?tab=suggested')
          break
        case 'verification_status':
          router.push('/verify')
          break
        case 'housing_update':
          router.push('/housing')
          break
        case 'agreement_update':
          router.push('/agreements')
          break
        case 'safety_alert':
          router.push('/safety')
          break
        case 'system_announcement':
        case 'admin_alert':
          if (typeof meta.link === 'string' && meta.link.startsWith('/')) {
            router.push(meta.link)
          } else if (meta.report_status) {
            router.push('/safety')
          } else {
            router.push('/notifications')
          }
          break
        default:
          router.push('/notifications')
      }
    },
    [onClose, queryClient, removeThreadFromCache, router]
  )

  const handleMarkAsReadMany = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return
      await onMarkAsRead(ids)
      await refreshCounts()
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'dropdown', userId] })
    },
    [onMarkAsRead, queryClient, refreshCounts, userId]
  )

  const handleMarkAllClick = useCallback(async () => {
    const unreadTotal = counts?.unread ?? 0
    if (unreadTotal === 0) return
    try {
      await onMarkAllAsRead()
      await refreshCounts()
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'dropdown', userId] })
      await refetch()
    } catch (error) {
      logger.error('[NotificationDropdown] Failed to mark all as read:', error)
      await refetch()
      await refreshCounts()
    }
  }, [counts?.unread, onMarkAllAsRead, queryClient, refetch, refreshCounts, userId])

  const unreadTotal = counts?.unread ?? 0

  const listProps = {
    notifications,
    counts,
    isLoading,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    fetchNextPage: () => void fetchNextPage(),
    category,
    onCategoryChange: setCategory,
    unreadOnly,
    onUnreadOnlyChange: setUnreadOnly,
    onClose,
    onMarkAllAsRead: handleMarkAllClick,
    onMarkAsRead: handleMarkAsReadMany,
    onOpen: handleOpen,
    unreadTotal,
    listScrollRef,
  }

  if (!isOpen) return null

  if (isMobile) {
    return (
      <NotificationsModal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
        {...listProps}
      />
    )
  }

  if (!mounted) return null

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[1000] bg-background/80 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
        aria-hidden="true"
      />
      <div
        data-notification-dropdown
        className="fixed z-[1001] w-[min(100vw-24px,420px)] max-w-[420px]"
        style={
          dropdownPosition
            ? { top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }
            : { display: 'none' }
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notif-glass-panel overflow-hidden rounded-2xl border-white/50 bg-white/65 backdrop-blur-[24px] backdrop-saturate-[1.9] dark:border-white/10 dark:bg-slate-900/70">
          <NotificationsPanel {...listProps} />
        </div>
      </div>
    </>,
    document.body
  )
}
