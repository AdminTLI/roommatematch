'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus_Jakarta_Sans } from 'next/font/google'
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

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

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
  const listScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate position to center panel on bell icon (only on window scroll/resize, not when scrolling inside panel)
  useEffect(() => {
    if (!isOpen || isMobile || !mounted) return

    const updatePosition = () => {
      const bellButton = document.querySelector('[aria-label="Notifications"]') as HTMLElement
      if (!bellButton) return

      const bellRect = bellButton.getBoundingClientRect()
      const bellCenterX = bellRect.left + bellRect.width / 2
      const panelWidth = 384
      const panelLeft = bellCenterX - panelWidth / 2
      const padding = 16
      const left = Math.max(padding, Math.min(panelLeft, window.innerWidth - panelWidth - padding))

      setDropdownPosition({
        top: bellRect.bottom + window.scrollY + 8,
        left: left + window.scrollX,
      })
    }

    updatePosition()
    // Use passive: false only for resize; for scroll, only listen to window scroll (not capture)
    // so that scrolling inside the panel doesn't trigger this
    const handleScroll = (e: Event) => {
      const target = e.target as Node
      if (listScrollRef.current && listScrollRef.current.contains(target)) return
      updatePosition()
    }
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
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
      <div className={`flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0 ${plusJakarta.className}`}>
        <Bell className="h-5 w-5 flex-shrink-0 text-violet-600 dark:text-violet-400" />
        <h2 className="text-base font-semibold whitespace-nowrap text-zinc-900 dark:text-white tracking-tight">Notifications</h2>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-1 flex-shrink-0 text-[10px] h-4 px-1.5 rounded-full bg-violet-600 hover:bg-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500 border-0 leading-none">
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
          className="h-9 w-9 p-0 min-w-[36px] hover:bg-zinc-100 dark:hover:bg-slate-700 text-zinc-600 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40"
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
          className="h-9 w-9 p-0 min-w-[36px] hover:bg-zinc-100 dark:hover:bg-slate-700 text-zinc-600 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-white"
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
            className="h-9 w-9 p-0 min-w-[36px] hover:bg-zinc-100 dark:hover:bg-slate-700 text-zinc-600 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-white"
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
      <div className="flex flex-col h-full min-h-0">
        {/* Professional Tabs */}
        <div className="flex-shrink-0 px-3 pt-3 pb-2 bg-white dark:bg-slate-800">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
            <TabsList className="grid w-full grid-cols-2 grid-rows-1 h-11 rounded-xl bg-zinc-100 dark:bg-slate-700/50 p-1.5 gap-1.5 items-center">
              <TabsTrigger
                value="all"
                className="w-full text-xs font-medium rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white text-zinc-600 dark:text-slate-300 h-5 min-h-0 flex items-center justify-center gap-1.5 px-2.5 py-0"
              >
                <span>All</span>
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="h-4 min-w-[16px] px-1.5 text-[10px] font-medium rounded-full border-0 bg-zinc-400/80 dark:bg-slate-600/80 text-white leading-none flex items-center justify-center shrink-0">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="w-full text-xs font-medium rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white text-zinc-600 dark:text-slate-300 h-5 min-h-0 flex items-center justify-center gap-1.5 px-2.5 py-0"
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-4 min-w-[16px] px-1.5 text-[10px] font-medium rounded-full bg-violet-600/80 text-white border-0 leading-none flex items-center justify-center shrink-0">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notification List - Scrollable container; ref so window scroll listener ignores scrolls here */}
        <div
          ref={listScrollRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white dark:bg-slate-800 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onWheel={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="p-4 text-center text-zinc-500 dark:text-slate-400 text-xs">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-zinc-900 dark:text-white text-sm font-semibold mb-1">
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-zinc-500 dark:text-slate-400 text-xs mt-1">
                {activeTab === 'unread' 
                  ? 'All caught up! New notifications will appear here.'
                  : "We'll notify you about matches, messages, and updates"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
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
                <p className="text-[10px] text-zinc-400 dark:text-slate-500 px-2 pb-2">
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
          className={`${plusJakarta.className} w-full p-0 z-[100] bg-white dark:bg-slate-800 border-zinc-200 dark:border-slate-700 flex flex-col`}
          onClick={(e) => {
            // Prevent clicks inside sheet from closing it
            e.stopPropagation()
          }}
        >
          <SheetHeader 
            className="mb-0 pr-12 px-4 pt-4 flex-shrink-0"
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
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <NotificationList />
          </div>
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
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1000]" 
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
        className="fixed w-96 z-[1001]"
        style={dropdownPosition ? { top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` } : { display: 'none' }}
        onClick={(e) => {
          // Prevent clicks inside dropdown from closing it
          e.stopPropagation()
        }}
      >
        <Card className={`${plusJakarta.className} shadow-xl overflow-hidden bg-white dark:bg-slate-800 border-zinc-200 dark:border-slate-700 rounded-2xl border`}>
          <CardHeader
            className="pb-3 px-4 pt-4 border-b border-zinc-200 dark:border-slate-700/50 rounded-t-2xl"
            onClick={(e) => {
              // Prevent header clicks from closing dropdown
              e.stopPropagation()
            }}
          >
            <CardTitle
              className="text-base font-semibold"
              onClick={(e) => {
                // Prevent title clicks from closing dropdown
                e.stopPropagation()
              }}
            >
              <HeaderContent isMobile={false} />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-white dark:bg-slate-800 flex flex-col" style={{ height: '500px', maxHeight: '500px', minHeight: 0 }}>
            <NotificationList />
          </CardContent>
        </Card>
      </div>
    </>,
    document.body
  )
}
