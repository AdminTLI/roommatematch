'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// ScrollArea not available, using div with overflow styling
import { NotificationItem } from './notification-item'
import { Notification, NotificationCounts } from '@/lib/notifications/types'
import { createClient } from '@/lib/supabase/client'
import { 
  Bell, 
  Settings, 
  CheckCheck, 
  Eye,
  MoreHorizontal
} from 'lucide-react'

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationDropdown({ 
  isOpen, 
  onClose, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [counts, setCounts] = useState<NotificationCounts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications/my?limit=10')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch counts
  const fetchCounts = async () => {
    try {
      const response = await fetch('/api/notifications/count')
      if (response.ok) {
        const data = await response.json()
        setCounts(data)
      }
    } catch (error) {
      console.error('Failed to fetch notification counts:', error)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!isOpen) return

    fetchNotifications()
    fetchCounts()

    // Subscribe to notifications changes
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
        },
        () => {
          fetchNotifications()
          fetchCounts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen])

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      onMarkAsRead(notification.id)
    }

    // Navigate based on notification type and metadata
    const { metadata } = notification
    
    switch (notification.type) {
      case 'match_created':
      case 'match_accepted':
      case 'match_confirmed':
        if (metadata.chat_id) {
          router.push(`/chat/${metadata.chat_id}`)
        } else if (metadata.match_id) {
          router.push('/matches')
        }
        break
      case 'chat_message':
        if (metadata.chat_id) {
          router.push(`/chat/${metadata.chat_id}`)
        }
        break
      case 'profile_updated':
        router.push('/settings')
        break
      case 'questionnaire_completed':
        router.push('/matches')
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
        // Could navigate to a specific announcement page
        router.push('/notifications')
        break
      default:
        router.push('/notifications')
    }

    onClose()
  }

  const handleMarkAllAsRead = async () => {
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/notifications/mark-all-read', {
        method: 'POST'
      })
      
      if (response.ok) {
        onMarkAllAsRead()
        // Update local state
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        )
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-full mt-2 w-96 z-50">
      <Card className="shadow-lg border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {counts && counts.unread > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {counts.unread}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={!counts || counts.unread === 0}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  router.push('/notifications')
                  onClose()
                }}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View all
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="h-[400px] sm:h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  We'll notify you about matches, messages, and updates
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onNavigate={handleNotificationClick}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
