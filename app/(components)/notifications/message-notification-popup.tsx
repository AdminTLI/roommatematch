'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/lib/notifications/types'
import { MessageCircle } from 'lucide-react'

interface PopupNotification extends Notification {
  primaryActionLabel: string
  secondaryActionLabel?: string
}

interface MessageNotificationPopupProps {
  userId: string
}

export function MessageNotificationPopup({ userId }: MessageNotificationPopupProps) {
  const [notifications, setNotifications] = useState<PopupNotification[]>([])
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const getChatHref = (metadata: Record<string, any>) => {
    if (metadata.chat_id) return `/chat?chatId=${metadata.chat_id}`
    if (metadata.sender_id) return `/chat?userId=${metadata.sender_id}`
    return '/chat'
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
    return getChatHref(notification.metadata || {})
  }

  const getPrimaryAction = (notification: Notification): { label: string; href: string } => {
    const metadata = notification.metadata || {}

    switch (notification.type) {
      case 'match_accepted':
      case 'match_confirmed':
      case 'chat_message':
      case 'group_invitation':
        return { label: 'Open Chat', href: getChatHref(metadata) }
      case 'match_created':
        return { label: 'View Matches', href: '/matches' }
      case 'profile_updated':
        return { label: 'Open Settings', href: '/settings' }
      case 'questionnaire_completed':
        return { label: 'View Matches', href: '/matches' }
      case 'verification_status':
        return { label: 'Open Verify', href: '/verify' }
      case 'housing_update':
        return { label: 'Open Housing', href: '/housing' }
      case 'agreement_update':
        return { label: 'Open Agreements', href: '/agreements' }
      case 'safety_alert':
        return { label: 'Open Safety', href: '/safety' }
      case 'system_announcement':
      case 'admin_alert':
      default:
        return { label: 'View Notifications', href: '/notifications' }
    }
  }

  const addPopupNotification = (notification: Notification) => {
    const action = getPrimaryAction(notification)
    const popupNotification: PopupNotification = {
      ...notification,
      primaryActionLabel: action.label,
      secondaryActionLabel: 'Dismiss',
    }

    setNotifications((prev) => {
      if (prev.some((existing) => existing.id === popupNotification.id)) {
        return prev
      }
      return [...prev, popupNotification]
    })

    // Auto-dismiss after 8 seconds (longer for richer notifications)
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== popupNotification.id))
    }, 8000)
  }

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

  useEffect(() => {
    if (!userId) return

    // Subscribe to all new notifications for this user.
    const channel = supabase
      .channel('in-app-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification
          if (!notification || notification.user_id !== userId) return
          addPopupNotification(notification)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handlePrimaryAction = async (notification: PopupNotification) => {
    const action = getPrimaryAction(notification)
    const targetHref = notification.type === 'chat_message'
      ? await resolveChatHref(notification)
      : action.href
    await markAsRead(notification.id)
    router.push(targetHref)
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
  }

  const truncateText = (value: string, maxChars: number): string => {
    if (value.length <= maxChars) return value
    return `${value.slice(0, maxChars).trimEnd()}...`
  }

  const getDisplayTitle = (notification: PopupNotification): string => {
    const metadata = notification.metadata || {}
    if (notification.type === 'chat_message' && typeof metadata.sender_name === 'string' && metadata.sender_name.trim()) {
      return metadata.sender_name.trim()
    }
    return notification.title
  }

  const getDisplayMessage = (notification: PopupNotification): string => {
    const metadata = notification.metadata || {}
    let message = notification.message || ''

    if (notification.type === 'chat_message') {
      if (typeof metadata.sender_name === 'string' && metadata.sender_name.trim()) {
        const escaped = metadata.sender_name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        message = message.replace(new RegExp(`^${escaped}:\\s*`, 'i'), '')
      } else {
        message = message.replace(/^[^:]{1,40}:\s*/, '')
      }
      return truncateText(message.trim(), 140)
    }

    return truncateText(message.trim(), 180)
  }

  return (
    <div className="fixed top-20 right-6 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => {
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-sm w-80 rounded-2xl border border-black/10 bg-white/70 p-4 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_12px_28px_rgba(15,23,42,0.14),0_3px_10px_rgba(15,23,42,0.10)] ring-1 ring-black/5 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-gray-900/55 dark:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_16px_34px_rgba(0,0,0,0.55),0_4px_12px_rgba(0,0,0,0.35)] dark:ring-white/10 dark:supports-[backdrop-filter]:bg-gray-900/45"
            >
              <div className="flex flex-row gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/35 text-base font-semibold tracking-wide text-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_20px_-10px_rgba(15,23,42,0.75)] backdrop-blur-xl dark:border-white/20 dark:bg-gray-800/40 dark:text-white"
                  aria-hidden
                >
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {getDisplayTitle(notification)}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-normal text-gray-700 dark:text-gray-300">
                    {getDisplayMessage(notification)}
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t border-white/30 pt-2 dark:border-white/10">
                <div className="grid w-full grid-cols-2 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-9 w-full rounded-xl border border-white/40 bg-white/40 px-3 text-xs font-medium text-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_26px_-16px_rgba(15,23,42,0.9)] backdrop-blur-xl transition-all hover:bg-white/55 dark:border-white/20 dark:bg-gray-800/45 dark:text-white dark:hover:bg-gray-800/65"
                    onClick={() => handlePrimaryAction(notification)}
                  >
                    {notification.primaryActionLabel}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-9 w-full rounded-xl border border-white/30 bg-white/25 px-3 text-xs font-medium text-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_22px_-18px_rgba(15,23,42,0.8)] backdrop-blur-xl transition-all hover:bg-white/40 dark:border-white/15 dark:bg-gray-800/30 dark:text-gray-200 dark:hover:bg-gray-800/45"
                    onClick={() => handleDismiss(notification.id)}
                  >
                    {notification.secondaryActionLabel || 'Dismiss'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
