'use client'

import { useState, useEffect, startTransition, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate position to center panel on bell icon
  useEffect(() => {
    if (!isOpen || isMobile || !mounted) return

    const updatePosition = () => {
      // Find the bell button in the header
      const bellButton = document.querySelector('[aria-label="Notifications"]') as HTMLElement
      if (!bellButton) return

      const bellRect = bellButton.getBoundingClientRect()
      const bellCenterX = bellRect.left + bellRect.width / 2
      const panelWidth = 384 // w-96 = 384px
      const panelLeft = bellCenterX - panelWidth / 2

      // Ensure panel doesn't go off-screen
      const padding = 16 // 1rem padding from screen edge
      const left = Math.max(padding, Math.min(panelLeft, window.innerWidth - panelWidth - padding))

      setDropdownPosition({
        top: bellRect.bottom + window.scrollY + 8,
        left: left + window.scrollX,
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, isMobile, mounted])

  // Fetch notifications with React Query
  const fetchNotifications = useCallback(async (): Promise<Notification[]> => {
    const desiredLimit = Math.min(
      Math.max(counts?.unread ?? 20, 20),
      200
    )
    const params = new URLSearchParams({
      limit: desiredLimit.toString(),
    })
    
    // Add filter based on active tab
    if (activeTab === 'unread') {
      params.append('is_read', 'false')
    }
    
    const response = await fetch(`/api/notifications/my?${params}`)
    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }
    const data = await response.json()
    const notifications = data.notifications || []
    
    // Process notifications to check acceptance status for match_created and match_accepted types
    const processedNotifications = await Promise.all(notifications.map(async (notif: Notification) => {
      // Safety check: For match_created and match_accepted notifications, verify both users accepted
      if (notif.type === 'match_created' || notif.type === 'match_accepted') {
        let bothUsersAccepted = false
        
        // First, check if message contains a name that needs sanitization
        let hasName = false
        let genericMessage = ''
        
        if (notif.type === 'match_created' && notif.message && notif.message.includes('match with')) {
          // Check if message contains a name - if it has text between "with" and "!" that's not generic, it's a name
          const matchWithPattern = /match with ([^!]+)!/i
          const match = notif.message.match(matchWithPattern)
          if (match) {
            const namePart = match[1].toLowerCase().trim()
            hasName = !namePart.includes('someone') && 
                     !namePart.includes('a potential roommate') &&
                     !namePart.includes('user') &&
                     namePart.length > 0
          }
          genericMessage = 'You have matched with someone! Check out your matches to see who.'
        } else if (notif.type === 'match_accepted' && notif.message && notif.message.includes('accepted your match request')) {
          // Check if message contains a name (not just "Someone")
          hasName = !notif.message.includes('Someone') && 
                   !notif.message.includes('someone') &&
                   !notif.message.includes('Someone accepted your match request')
          genericMessage = 'Someone accepted your match request!'
        }
        
        // Only verify if we detected a name (optimization)
        if (hasName && notif.metadata?.match_id) {
          try {
            // First try match_suggestions table (new system)
            const { data: suggestion } = await supabase
              .from('match_suggestions')
              .select('status, accepted_by, member_ids')
              .eq('id', notif.metadata.match_id)
              .single()
            
            if (suggestion) {
              const acceptedBy = suggestion.accepted_by || []
              const memberIds = suggestion.member_ids || []
              bothUsersAccepted = suggestion.status === 'confirmed' || 
                (memberIds.length === 2 && memberIds.every((id: string) => acceptedBy.includes(id)))
            } else {
              // If not found in match_suggestions, try old matches table
              const { data: match } = await supabase
                .from('matches')
                .select('status, a_user, b_user')
                .eq('id', notif.metadata.match_id)
                .single()
              
              if (match) {
                // In old matches table, status 'confirmed' means both accepted
                bothUsersAccepted = match.status === 'confirmed'
              }
            }
          } catch (error) {
            // If we can't verify, assume not both accepted (safer for privacy)
            logger.warn('Failed to verify match acceptance status, assuming not both accepted', error)
            bothUsersAccepted = false
          }
        }
        
        // If name detected AND (both users haven't accepted OR we couldn't verify), sanitize
        // Also sanitize if no match_id but name detected (fallback for edge cases)
        if (hasName && (!bothUsersAccepted || !notif.metadata?.match_id)) {
          notif.message = genericMessage
        }
      }
      
      return notif
    }))
    
    return processedNotifications
  }, [counts?.unread, supabase, activeTab])

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'dropdown', userId, counts?.unread, activeTab],
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
      await refreshCounts()
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
        <Bell className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-gray-900 dark:text-gray-100" />
        <h2 className="text-base sm:text-lg font-semibold whitespace-nowrap text-gray-900 dark:text-gray-100">Notifications</h2>
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
          className="h-9 w-9 p-0 m-0 flex items-center justify-center hover:bg-white/10 dark:hover:bg-white/10 rounded-lg backdrop-blur-sm relative z-10 min-w-[36px] transition-all"
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
          className="h-9 w-9 p-0 m-0 flex items-center justify-center hover:bg-white/10 dark:hover:bg-white/10 rounded-lg backdrop-blur-sm relative z-10 min-w-[36px] transition-all"
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
            className="h-9 w-9 p-0 m-0 flex items-center justify-center hover:bg-white/10 dark:hover:bg-white/10 rounded-lg backdrop-blur-sm relative z-10 min-w-[36px] transition-all"
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

  const NotificationList = () => {
    // Filter notifications based on active tab (client-side filtering as backup)
    const filteredNotifications = activeTab === 'unread' 
      ? notifications.filter(n => !n.is_read)
      : notifications

    return (
      <div className="flex flex-col h-[calc(100vh-160px)] sm:h-[400px] md:h-96">
        {/* Professional Tabs */}
        <div className="flex-shrink-0 px-3 sm:px-4 pt-3 pb-3">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
            <TabsList className="grid w-full grid-cols-2 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-lg p-1 h-10">
              <TabsTrigger 
                value="all" 
                className="rounded-md text-xs sm:text-sm font-semibold transition-all duration-200 data-[state=active]:bg-white/90 dark:data-[state=active]:bg-white/15 data-[state=active]:shadow-md data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=inactive]:text-gray-500 dark:data-[state=inactive]:text-gray-400 hover:data-[state=inactive]:text-gray-700 dark:hover:data-[state=inactive]:text-gray-300"
              >
                All
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-4 min-w-[16px] px-1.5 text-[10px] font-medium bg-white/30 dark:bg-white/15 text-gray-700 dark:text-gray-300 border-0">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="unread" 
                className="rounded-md text-xs sm:text-sm font-semibold transition-all duration-200 data-[state=active]:bg-white/90 dark:data-[state=active]:bg-white/15 data-[state=active]:shadow-md data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=inactive]:text-gray-500 dark:data-[state=inactive]:text-gray-400 hover:data-[state=inactive]:text-gray-700 dark:hover:data-[state=inactive]:text-gray-300"
              >
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1.5 h-4 min-w-[16px] px-1.5 text-[10px] font-medium">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                {activeTab === 'unread' 
                  ? 'All caught up! New notifications will appear here.'
                  : "We'll notify you about matches, messages, and updates"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-3 sm:p-4">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="flex justify-center">
                  <div className="w-full max-w-full">
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={async (id) => {
                        await onMarkAsRead(id)
                        await refreshCounts()
                      }}
                      onNavigate={handleNotificationClick}
                    />
                  </div>
                </div>
              ))}
              {activeTab === 'unread' && counts && counts.unread > filteredNotifications.length && (
                <p className="text-xs text-gray-500 dark:text-gray-400 px-2 pb-2">
                  Showing the first {filteredNotifications.length} of {counts.unread} unread notifications. 
                  Tap "View all notifications" to open the full list.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render mobile Sheet or desktop dropdown based on screen size
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          data-notification-dropdown
          side="right" 
          className="w-full p-4 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-white/10"
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
      {/* Backdrop for desktop - no blur, just overlay */}
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[1000]" 
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
        className="fixed w-96 z-[1001] shadow-2xl"
        style={dropdownPosition ? { top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` } : { display: 'none' }}
        onClick={(e) => {
          // Prevent clicks inside dropdown from closing it
          e.stopPropagation()
        }}
      >
        <Card className="border border-gray-200/50 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl overflow-hidden">
          <CardHeader 
            className="pb-3 px-4 pt-4 border-b border-gray-200/30 dark:border-white/10"
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
          <CardContent className="p-0 bg-transparent">
            <NotificationList />
          </CardContent>
        </Card>
      </div>
    </>,
    document.body
  )
}
