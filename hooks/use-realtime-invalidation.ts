'use client'

import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { queryClient } from '@/app/providers'

export interface RealtimeInvalidationOptions {
  /** Table name to subscribe to */
  table: string
  /** Event type to listen for (INSERT, UPDATE, DELETE, or '*' for all) */
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  /** Optional filter string (e.g., 'user_id=eq.123') */
  filter?: string
  /** Query keys to invalidate when event occurs */
  queryKeys: (string | number | undefined)[]
  /** Whether to enable this subscription (default: true) */
  enabled?: boolean
  /** Custom channel name (auto-generated if not provided) */
  channelName?: string
  /** Callback function to call before invalidating cache */
  onInvalidate?: () => void
}

/**
 * Hook that sets up a Supabase real-time subscription and automatically
 * invalidates React Query cache when database changes occur.
 * 
 * @example
 * ```tsx
 * useRealtimeInvalidation({
 *   table: 'messages',
 *   event: 'INSERT',
 *   queryKeys: queryKeys.chats(user.id),
 *   enabled: !!user.id,
 * })
 * ```
 */
export function useRealtimeInvalidation({
  table,
  event = '*',
  filter,
  queryKeys,
  enabled = true,
  channelName,
  onInvalidate,
}: RealtimeInvalidationOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    // In development we see a lot of noisy CHANNEL_ERROR / CLOSED logs when
    // components rapidly mount/unmount during Fast Refresh. Avoid opening a
    // subscription at all when explicitly disabled.
    if (!enabled) {
      return
    }

    const channel = channelName || `realtime-invalidation-${table}-${Date.now()}`

    // Clean up existing channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // Create new channel
    const realtimeChannel = supabase
      .channel(channel)
      .on(
        'postgres_changes',
        {
          event: event === '*' ? undefined : event,
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          if (isDevelopment) {
            console.log('[RealtimeInvalidation] Event received:', {
              table,
              event: payload.eventType,
              payload,
              queryKeys,
            })
          }

          // Call optional callback before invalidation
          onInvalidate?.()

          // Invalidate React Query cache
          queryClient.invalidateQueries({
            queryKey: queryKeys,
          })

          if (isDevelopment) {
            console.log('[RealtimeInvalidation] Cache invalidated:', {
              queryKeys,
              table,
              event: payload.eventType,
            })
          }
        }
      )
      .subscribe((status) => {
        if (isDevelopment) {
          console.log('[RealtimeInvalidation] Subscription status:', {
            channel,
            table,
            status,
          })
        }

        if (status === 'SUBSCRIBED') {
          channelRef.current = realtimeChannel
        }
      })

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, event, filter, enabled, channelName, onInvalidate, supabase, isDevelopment, queryKeys])
}

