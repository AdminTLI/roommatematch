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

        // Get last_read_at for each chat
        const { data: memberships, error: membershipsError } = await supabase
          .from('chat_members')
          .select('chat_id, last_read_at')
          .eq('user_id', user.id)
          .in('chat_id', chatIds)

        if (membershipsError) {
          console.error('Error fetching chat memberships:', membershipsError)
          return
        }

        // Count unread messages using last_read_at (same logic as unread API)
        let totalUnread = 0
        for (const membership of memberships || []) {
          const lastReadAt = membership.last_read_at || new Date(0).toISOString()
          
          const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', membership.chat_id)
            .neq('user_id', user.id)
            .gt('created_at', lastReadAt)

          if (countError) {
            console.error('Error counting unread messages:', countError)
            continue
          }

          totalUnread += count || 0
        }

        setUnreadChatCount(totalUnread)
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
          table: 'messages',
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
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#1E2433] border-r border-gray-200 dark:border-[#2D3548]">
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
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-[#67E8F9] border-l-4 border-blue-600 rounded-l-none" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-[#2D3548] dark:hover:text-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.name === 'Chat' && unreadChatCount > 0 && (
                    <Badge variant="destructive" size="sm" className="ml-auto bg-red-600 text-white font-semibold">
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
