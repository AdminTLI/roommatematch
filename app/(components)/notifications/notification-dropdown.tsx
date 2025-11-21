'use client'

import { useState, useEffect, startTransition, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Tooltip removed from buttons to fix click handlers
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
// ScrollArea not available, using div with overflow styling
import { NotificationItem } from './notification-item'
import { Notification, NotificationCounts } from '@/lib/notifications/types'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { queryKeys } from '@/app/providers'
import { useRealtimeInvalidation } from '@/hooks/use-realtime-invalidation'
import { 
  Bell, 
  Settings, 
  CheckCheck, 
  Eye,
  MoreHorizontal,
  X
} from 'lucide-react'

// Hook to detect if we're on mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  onMarkAsRead: (id: string) => Promise<void>
  onMarkAllAsRead: () => Promise<void>
  counts: NotificationCounts | null
  userId: string
  refreshCounts: () => Promise<void>
}

export function NotificationDropdown({ 
  isOpen, 
  onClose, 
  onMarkAsRead, 
  onMarkAllAsRead,
  counts,
  userId,
  refreshCounts
}: NotificationDropdownProps) {
  const router = useRouter()
  const supabase = createClient()
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch notifications with React Query
  const fetchNotifications = useCallback(async (): Promise<Notification[]> => {
    const desiredLimit = Math.min(
      Math.max(counts?.unread ?? 20, 20),
      200
    )
    const response = await fetch(`/api/notifications/my?limit=${desiredLimit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }
    const data = await response.json()
    return data.notifications || []
  }, [counts?.unread])

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'dropdown', userId, counts?.unread],
    queryFn: fetchNotifications,
    staleTime: 10_000, // 10 seconds for real-time data
    enabled: isOpen && !!userId,
  })

  // Set up real-time invalidation for notifications
  useRealtimeInvalidation({
    table: 'notifications',
    event: '*',
    filter: `user_id=eq.${userId}`,
    queryKeys: ['notifications', userId],
    enabled: isOpen && !!userId,
    onInvalidate: () => {
      refreshCounts()
    },
  })

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      await onMarkAsRead(notification.id)
      markAsReadLocally(notification.id)
      refreshCounts()
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
          router.push(`/chat`)
        }
        break
      case 'group_invitation':
        if (metadata.chat_id) {
          // Navigate to chat page - the invitation will be shown there
          router.push(`/chat`)
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

  if (!isOpen) return null

  const unreadCount = counts?.unread ?? notifications.filter(n => !n.is_read).length

  const handleMarkAllClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (unreadCount === 0) {
      logger.log('[NotificationDropdown] No unread notifications to mark')
      return
    }
    
    try {
      logger.log('[NotificationDropdown] Marking all as read...', { unreadCount })
      await onMarkAllAsRead()
      logger.log('[NotificationDropdown] Mark all as read completed, refreshing...')
      
      // Refresh counts and notifications
      await Promise.all([
        refreshCounts(),
        fetchNotifications()
      ])
      
      logger.log('[NotificationDropdown] Refresh completed')
    } catch (error) {
      logger.error('[NotificationDropdown] Failed to mark all as read:', error)
      // Re-fetch to get accurate state
      await fetchNotifications()
      await refreshCounts()
    }
  }

  const HeaderContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div 
      className={`flex items-center justify-between ${isMobile ? 'gap-2' : 'gap-4'}`}
      onClick={(e) => {
        // Prevent clicks in header from closing dropdown
        e.stopPropagation()
      }}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
        <Bell className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        <h2 className="text-base sm:text-lg font-semibold whitespace-nowrap">Notifications</h2>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-1 sm:ml-2 flex-shrink-0 text-xs">
            {unreadCount}
          </Badge>
        )}
      </div>
      
      <div 
        className="flex items-center justify-end gap-2 flex-shrink-0"
        onClick={(e) => {
          // Prevent button clicks from bubbling
          e.stopPropagation()
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            logger.log('[NotificationDropdown] Mark all button clicked!', { unreadCount })
            e.preventDefault()
            e.stopPropagation()
            handleMarkAllClick(e)
          }}
          disabled={unreadCount === 0}
          className="h-9 w-9 p-0 m-0 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 relative z-10 min-w-[36px]"
          title="Mark all as read"
          type="button"
        >
          <CheckCheck className="h-4 w-4 flex-shrink-0" />
          <span className="sr-only">Mark all as read</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            logger.log('[NotificationDropdown] View all button clicked!')
            e.preventDefault()
            e.stopPropagation()
            // Use window.location for reliable navigation from portal
            // Don't close dropdown here - let navigation handle it
            setTimeout(() => {
              window.location.href = '/notifications'
            }, 0)
          }}
          className="h-9 w-9 p-0 m-0 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 relative z-10 min-w-[36px]"
          title="View all notifications"
          type="button"
        >
          <Eye className="h-4 w-4 flex-shrink-0" />
          <span className="sr-only">View all notifications</span>
        </Button>
        
        {/* Only show X button on desktop - mobile Sheet has built-in close button */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            className="h-9 w-9 p-0 m-0 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 relative z-10 min-w-[36px]"
            title="Close notifications"
            type="button"
          >
            <X className="h-4 w-4 flex-shrink-0" />
            <span className="sr-only">Close</span>
          </Button>
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
        <div className="space-y-2 p-3 sm:p-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex justify-center">
              <div className="w-full max-w-full">
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={async (id) => {
                    await onMarkAsRead(id)
                    markAsReadLocally(id)
                    await refreshCounts()
                  }}
                  onNavigate={handleNotificationClick}
                />
              </div>
            </div>
          ))}
          {counts && counts.unread > notifications.length && (
            <p className="text-xs text-gray-500 px-2 pb-2">
              Showing the first {notifications.length} of {counts.unread} unread notifications. 
              Tap “View all notifications” to open the full list.
            </p>
          )}
        </div>
      )}
    </div>
  )

  // Render mobile Sheet or desktop dropdown based on screen size
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          data-notification-dropdown
          side="right" 
          className="w-full p-4 z-[100]"
          onClick={(e) => {
            // Prevent clicks inside sheet from closing it
            e.stopPropagation()
          }}
        >
          <SheetHeader 
            className="mb-4 pr-12"
            onClick={(e) => {
              // Prevent header clicks from closing sheet
              e.stopPropagation()
            }}
          >
            <SheetTitle 
              className="pr-0"
              onClick={(e) => {
                // Prevent title clicks from closing sheet
                e.stopPropagation()
              }}
            >
              <HeaderContent isMobile={true} />
            </SheetTitle>
          </SheetHeader>
          <NotificationList />
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Card Dropdown
  if (!isOpen || !mounted) return null

  return createPortal(
    <>
      {/* Backdrop for desktop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1000]" 
        onClick={(e) => {
          // Only close if clicking directly on backdrop, not on child elements
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
        aria-hidden="true" 
      />
      {/* Dropdown content */}
      <div 
        data-notification-dropdown
        className="fixed right-4 top-[72px] w-96 z-[1001] shadow-2xl"
        onClick={(e) => {
          // Prevent clicks inside dropdown from closing it
          e.stopPropagation()
        }}
      >
        <Card className="border border-gray-200 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <CardHeader 
            className="pb-3 px-4 pt-4 border-b border-gray-200 dark:border-gray-700"
            onClick={(e) => {
              // Prevent header clicks from closing dropdown
              e.stopPropagation()
            }}
          >
            <CardTitle 
              className="text-base"
              onClick={(e) => {
                // Prevent title clicks from closing dropdown
                e.stopPropagation()
              }}
            >
              <HeaderContent isMobile={false} />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-white dark:bg-gray-800">
            <NotificationList />
          </CardContent>
        </Card>
      </div>
    </>,
    document.body
  )
}
