'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
// ScrollArea not available, using div with overflow styling
import { NotificationItem } from './notification-item'
import { Notification, NotificationCounts } from '@/lib/notifications/types'
import { createClient } from '@/lib/supabase/client'
import { 
  Bell, 
  Settings, 
  CheckCheck, 
  Eye,
  MoreHorizontal,
  X
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

  // Add backdrop overlay for desktop dropdown (only show on desktop)
  const Backdrop = () => (
    <div 
      className="hidden sm:block fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
      onClick={onClose}
      aria-hidden="true"
    />
  )

  const HeaderContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex items-center justify-between ${isMobile ? 'gap-2' : 'gap-4'}`}>
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
        <Bell className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        <h2 className="text-base sm:text-lg font-semibold whitespace-nowrap">Notifications</h2>
        {counts && counts.unread > 0 && (
          <Badge variant="destructive" className="ml-1 sm:ml-2 flex-shrink-0 text-xs">
            {counts.unread}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={!counts || counts.unread === 0}
                className="h-9 w-9 p-0 hover:bg-gray-100"
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
                <span className="sr-only">Mark all as read</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Mark all as read</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  router.push('/notifications')
                  onClose()
                }}
                className="h-9 w-9 p-0 hover:bg-gray-100"
                title="View all notifications"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View all notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>View all notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Only show X button on desktop - mobile Sheet has built-in close button */}
        {!isMobile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-9 w-9 p-0 hover:bg-gray-100"
                  title="Close notifications"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Close</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )

  const NotificationList = () => (
    <div className="h-[calc(100vh-160px)] sm:h-[400px] md:h-96 overflow-y-auto">
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
  )

  return (
    <>
      {/* Backdrop for desktop */}
      {isOpen && <Backdrop />}
      
      {/* Mobile: Full-screen Sheet */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:hidden p-4 z-50">
          <SheetHeader className="mb-4 pr-12">
            <SheetTitle className="pr-0">
              <HeaderContent isMobile={true} />
            </SheetTitle>
          </SheetHeader>
          <NotificationList />
        </SheetContent>
      </Sheet>

      {/* Desktop: Card Dropdown with portal-like positioning */}
      {isOpen && (
        <div className="hidden sm:block fixed right-4 top-16 w-96 z-50">
          <Card className="shadow-xl border-2 bg-white">
            <CardHeader className="pb-3 px-4 pt-4 border-b">
              <CardTitle className="text-base">
                <HeaderContent isMobile={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <NotificationList />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
