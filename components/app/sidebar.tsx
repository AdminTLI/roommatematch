'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageCircle, 
  Home,
  Award,
  FileText,
  Calendar,
  Shield,
  BarChart3,
  Video
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
  onClose?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Matches', href: '/matches', icon: Users },
  { name: 'Housing', href: '/housing', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Agreements', href: '/agreements', icon: FileText },
  { name: 'Move-in', href: '/move-in', icon: Calendar },
  { name: 'Safety', href: '/safety', icon: Shield },
  { name: 'Reputation', href: '/reputation', icon: Award },
  { name: 'Video Intros', href: '/video-intros', icon: Video },
  { name: 'Admin', href: '/admin', icon: BarChart3 },
]

export function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [unreadChatCount, setUnreadChatCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial unread message count
    const fetchUnreadCount = async () => {
      try {
        // Get all chat rooms where user is a member
        const { data: chatMembers, error: membersError } = await supabase
          .from('chat_members')
          .select('chat_id')
          .eq('user_id', user.id)

        if (membersError || !chatMembers) {
          console.error('Error fetching chat members:', membersError)
          return
        }

        if (chatMembers.length === 0) {
          setUnreadChatCount(0)
          return
        }

        const chatIds = chatMembers.map(cm => cm.chat_id)

        // Count unread messages (messages not from current user, marked as unread or no read status)
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .in('chat_id', chatIds)
          .neq('user_id', user.id)
          .eq('is_read', false)

        if (messagesError) {
          console.error('Error fetching unread messages:', messagesError)
          return
        }

        setUnreadChatCount(messages?.length || 0)
      } catch (error) {
        console.error('Error in fetchUnreadCount:', error)
      }
    }

    fetchUnreadCount()

    // Subscribe to real-time message updates
    const channel = supabase
      .channel('sidebar-chat-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user.id])

  return (
    <div className="flex flex-col h-full bg-surface-0 dark:bg-surface-1 border-r border-line dark:border-ink-700">
      {/* Navigation - starts at top */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link href={item.href} onClick={onClose}>
                <Button
                  variant={isActive ? "primary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3 transition-colors",
                    isActive 
                      ? "bg-brand-600/10 text-brand-600 dark:bg-brand-600/20 dark:text-brand-accent border-l-4 border-brand-600 rounded-l-none" 
                      : "text-ink-600 dark:text-ink-400 hover:bg-surface-2 dark:hover:bg-ink-800"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.name === 'Chat' && unreadChatCount > 0 && (
                    <Badge variant="destructive" size="sm" className="ml-auto">
                      {unreadChatCount > 99 ? '99+' : unreadChatCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </motion.div>
          )
        })}
      </nav>
    </div>
  )
}
