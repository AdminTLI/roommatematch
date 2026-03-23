'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface MessageNotification {
  id: string
  content: string
  senderName: string
  chatId: string
  timestamp: string
}

interface MessageNotificationPopupProps {
  userId: string
}

export function MessageNotificationPopup({ userId }: MessageNotificationPopupProps) {
  const [notifications, setNotifications] = useState<MessageNotification[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Subscribe to new messages
    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMessage = payload.new as any
          
          // Check if message is for this user (they're in the chat)
          const { data: chatMember } = await supabase
            .from('chat_members')
            .select('chat_id')
            .eq('chat_id', newMessage.chat_id)
            .eq('user_id', userId)
            .single()

          if (!chatMember || newMessage.user_id === userId) {
            return // Not for this user or message from themselves
          }

          // Get sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('user_id', newMessage.user_id)
            .single()

          const senderName = profile?.first_name || 'User'

          // Add notification
          const notification: MessageNotification = {
            id: newMessage.id,
            content: newMessage.content,
            senderName,
            chatId: newMessage.chat_id,
            timestamp: newMessage.created_at
          }

          setNotifications(prev => [...prev, notification])

          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id))
          }, 5000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleClick = (chatId: string) => {
    router.push(`/chat/${chatId}`)
    setNotifications(prev => prev.filter(n => n.chatId !== chatId))
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => {
          const senderInitial =
            notification.senderName.trim().charAt(0).toUpperCase() || '?'

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-sm w-80 rounded-2xl border border-white/20 bg-white/70 p-4 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/70"
            >
              <div className="flex flex-row gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/90 to-indigo-500/90 text-lg font-semibold text-white shadow-inner dark:from-sky-500/80 dark:to-indigo-600/80"
                  aria-hidden
                >
                  {senderInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {notification.senderName}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-normal text-gray-700 dark:text-gray-300">
                    {notification.content}
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t border-gray-200/50 pt-2 dark:border-gray-700/50">
                <div className="grid w-full grid-cols-2 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    className="h-9 w-full px-3 text-xs"
                    onClick={() => handleClick(notification.chatId)}
                  >
                    Reply
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-9 w-full px-3 text-xs"
                    onClick={() => handleDismiss(notification.id)}
                  >
                    Dismiss
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
