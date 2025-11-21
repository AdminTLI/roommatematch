'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { NotificationDropdown } from './notification-dropdown'
import { NotificationCounts } from '@/lib/notifications/types'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'
import { queryKeys } from '@/app/providers'
import { useRealtimeInvalidation } from '@/hooks/use-realtime-invalidation'
import { Bell } from 'lucide-react'

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch notification counts with React Query
  const fetchCounts = useCallback(async (): Promise<NotificationCounts> => {
    const response = await fetch('/api/notifications/count')
    if (!response.ok) {
      throw new Error('Failed to fetch notification counts')
    }
    const data = await response.json()
    return data
  }, [])

  const { data: counts, isLoading, refetch: refetchCounts } = useQuery({
    queryKey: ['notifications', 'count', userId],
    queryFn: fetchCounts,
    staleTime: 10_000, // 10 seconds for real-time data
    enabled: !!userId,
  })

  // Set up real-time invalidation for notification counts
  useRealtimeInvalidation({
    table: 'notifications',
    event: '*',
    filter: `user_id=eq.${userId}`,
    queryKeys: ['notifications', 'count', userId],
    enabled: !!userId,
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Check if click is inside the bell button container
      const isInsideBell = dropdownRef.current?.contains(target)
      
      // Check if click is inside the dropdown (which is rendered via portal to document.body)
      // The dropdown has a specific class or data attribute we can check
      const dropdownElement = document.querySelector('[data-notification-dropdown]')
      const isInsideDropdown = dropdownElement?.contains(target)
      
      // Only close if click is outside both the bell and the dropdown
      if (!isInsideBell && !isInsideDropdown) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      // Use a small delay to ensure the click event has fully propagated
      document.addEventListener('mousedown', handleClickOutside, true)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [isOpen])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [notificationId]
        })
      })

      if (response.ok) {
        // Invalidate query to refetch
        refetchCounts()
      }
    } catch (error) {
      logger.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      logger.log('[NotificationBell] Marking all notifications as read...')
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/notifications/mark-all-read', {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        logger.error('[NotificationBell] Mark all read failed:', response.status, errorData)
        throw new Error(`Failed to mark all as read: ${response.status}`)
      }

      const result = await response.json().catch(() => ({}))
      logger.log('[NotificationBell] Mark all read success:', result)
      
      // Invalidate query to refetch
      refetchCounts()
    } catch (error) {
      logger.error('[NotificationBell] Failed to mark all notifications as read:', error)
      throw error // Re-throw so dropdown can handle it
    }
  }

  const unreadCount = counts?.unread || 0

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          "min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0",
          "relative inline-flex items-center justify-center",
          "bg-transparent hover:bg-transparent active:bg-transparent",
          "border-0 outline-none rounded-none",
          "p-0 m-0",
          "text-text-primary cursor-pointer",
          "focus-visible:outline-none",
          "disabled:opacity-60 disabled:pointer-events-none",
          "transition-colors"
        )}
        style={{ backgroundColor: 'transparent' }}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-text-primary" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        counts={counts}
        userId={userId}
        refreshCounts={refetchCounts}
      />
    </div>
  )
}
