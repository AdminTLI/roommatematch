'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Notification } from '@/lib/notifications/types'
import { useRealtimeInvalidation } from '@/hooks/use-realtime-invalidation'
import {
  displayMessageForNotification,
  displayTitleForNotification,
  fallbackAvatarUrlForNotification,
  hrefForNotification,
} from '@/lib/notifications/live-toast'
import {
  LiveNotificationCard,
  type LiveNotificationCardModel,
} from '@/app/(components)/notifications/live-notification-card'

const AUTO_DISMISS_MS = 8000

interface PopupNotification extends LiveNotificationCardModel {
  raw: Notification
}

interface MessageNotificationPopupProps {
  userId: string
}

export function MessageNotificationPopup({ userId }: MessageNotificationPopupProps) {
  const [notifications, setNotifications] = useState<PopupNotification[]>([])
  const router = useRouter()
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeNotification = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const hydrateAvatar = useCallback(async (notificationId: string) => {
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/notifications/live-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      if (!response.ok) return
      const data = await response.json()
      if (typeof data?.avatarUrl !== 'string' || !data.avatarUrl) return
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, avatarUrl: data.avatarUrl } : n))
      )
    } catch (error) {
      console.warn('Failed to hydrate live notification avatar:', error)
    }
  }, [])

  const addPopupNotification = useCallback(
    (notification: Notification) => {
      const meta = notification.metadata || {}
      const metaKind = typeof meta.type === 'string' ? meta.type : null

      const popupNotification: PopupNotification = {
        id: notification.id,
        type: notification.type,
        title: displayTitleForNotification(notification),
        message: displayMessageForNotification(notification),
        avatarUrl: fallbackAvatarUrlForNotification(notification),
        createdAtLabel: 'Just now',
        metaKind,
        raw: notification,
      }

      setNotifications((prev) => {
        if (prev.some((existing) => existing.id === popupNotification.id)) {
          return prev
        }
        return [...prev, popupNotification].slice(-3)
      })

      if (
        notification.type === 'chat_message' ||
        notification.type === 'chat_message_reaction'
      ) {
        void hydrateAvatar(notification.id)
      }

      const existing = timersRef.current.get(popupNotification.id)
      if (existing) clearTimeout(existing)

      const timeout = setTimeout(() => {
        removeNotification(popupNotification.id)
      }, AUTO_DISMISS_MS)
      timersRef.current.set(popupNotification.id, timeout)
    },
    [hydrateAvatar, removeNotification]
  )

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer)
      }
      timersRef.current.clear()
    }
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      await fetchWithCSRF('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [notificationId],
        }),
      })
    } catch (error) {
      console.error('Failed to mark popup notification as read:', error)
    }
  }

  const resolveChatHref = async (notification: Notification) => {
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/notifications/open-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notification.id }),
      })
      if (response.ok) {
        const data = await response.json()
        if (typeof data?.href === 'string' && data.href.length > 0) return data.href
      }
    } catch (error) {
      console.warn('Failed to resolve popup chat href:', error)
    }
    return hrefForNotification(notification)
  }

  useRealtimeInvalidation({
    table: 'notifications',
    event: 'INSERT',
    filter: `user_id=eq.${userId}`,
    queryKeys: [],
    enabled: !!userId,
    invalidateQueries: false,
    onPayload: (payload) => {
      const notification = payload.new as Notification | undefined
      if (!notification || notification.user_id !== userId) return
      addPopupNotification(notification)
    },
  })

  const handleOpen = async (notification: PopupNotification) => {
    const targetHref =
      notification.type === 'chat_message' || notification.type === 'chat_message_reaction'
        ? await resolveChatHref(notification.raw)
        : hrefForNotification(notification.raw)
    await markAsRead(notification.id)
    router.push(targetHref)
    removeNotification(notification.id)
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:inset-x-auto sm:right-4 sm:top-16 sm:justify-end sm:px-0 sm:pt-0 lg:right-6"
      aria-live="polite"
    >
      {/*
        Keep this stack pointer-events-none so an empty (or tall) host never blocks
        Match Insights / chat scrolling. Only individual toasts capture clicks.
      */}
      <div className="flex h-fit w-full max-w-[22rem] flex-col gap-3 self-start sm:w-[22rem]">
        <AnimatePresence initial={false}>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              layout
              className="pointer-events-auto"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.18 } }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <LiveNotificationCard
                notification={notification}
                onOpen={() => void handleOpen(notification)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
