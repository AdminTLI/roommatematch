'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
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
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm w-80"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {notification.senderName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {notification.content}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleClick(notification.chatId)}
                    className="text-xs h-7"
                  >
                    Open Chat
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(notification.id)}
                    className="text-xs h-7 ml-auto"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

