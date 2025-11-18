'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NotificationDropdown } from './notification-dropdown'
import { NotificationCounts } from '@/lib/notifications/types'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { Bell } from 'lucide-react'

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [counts, setCounts] = useState<NotificationCounts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch notification counts
  const fetchCounts = async () => {
    try {
      const response = await fetch('/api/notifications/count')
      if (response.ok) {
        const data = await response.json()
        setCounts(data)
      }
    } catch (error) {
      logger.error('Failed to fetch notification counts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Set up real-time subscription for counts
  useEffect(() => {
    fetchCounts()

    // Subscribe to notifications changes for this user
    const channel = supabase
      .channel('notification-counts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchCounts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

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
        // Update local counts
        setCounts(prev => prev ? {
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          total: prev.total
        } : null)
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
      
      // Update local counts
      setCounts(prev => prev ? {
        ...prev,
        unread: 0,
        total: prev.total
      } : null)
    } catch (error) {
      logger.error('[NotificationBell] Failed to mark all notifications as read:', error)
      throw error // Re-throw so dropdown can handle it
    }
  }

  const unreadCount = counts?.unread || 0

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        counts={counts}
        userId={userId}
        refreshCounts={fetchCounts}
      />
    </div>
  )
}
