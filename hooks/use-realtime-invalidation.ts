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
  /** Optional callback function to call when subscription errors occur */
  onError?: (error: string, status: string) => void
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
  onError,
}: RealtimeInvalidationOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const retryAttemptsRef = useRef(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUnmountingRef = useRef(false)
  const supabase = createClient()
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    // In development we see a lot of noisy CHANNEL_ERROR / CLOSED logs when
    // components rapidly mount/unmount during Fast Refresh. Avoid opening a
    // subscription at all when explicitly disabled.
    if (!enabled) {
      return
    }

    isUnmountingRef.current = false
    retryAttemptsRef.current = 0

    const setupSubscription = () => {
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
        .subscribe((status, err) => {
          if (isDevelopment) {
            console.log('[RealtimeInvalidation] Subscription status:', {
              channel,
              table,
              status,
            })
          }

          if (status === 'SUBSCRIBED') {
            channelRef.current = realtimeChannel
            retryAttemptsRef.current = 0 // Reset retry attempts on success
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            const maxRetries = 10
            if (retryAttemptsRef.current < maxRetries && !isUnmountingRef.current) {
              if (isDevelopment) {
                console.warn(`[RealtimeInvalidation] ⚠️ ${status === 'TIMED_OUT' ? 'Timeout' : 'Error'} for table "${table}" - will retry`)
              }
              
              const errorMessage = status === 'TIMED_OUT' 
                ? 'Subscription timeout'
                : (typeof err === 'string' ? err : (err as any)?.message || 'Channel error')
              
              onError?.(errorMessage, status)
              
              // Calculate exponential backoff delay (2s initial, 1.5x multiplier, max 30s)
              const delay = Math.min(2000 * Math.pow(1.5, retryAttemptsRef.current), 30000)
              retryAttemptsRef.current++
              
              // Clear existing timeout if any
              if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current)
              }
              
              // Retry subscription
              retryTimeoutRef.current = setTimeout(() => {
                if (!isUnmountingRef.current) {
                  if (isDevelopment) {
                    console.log(`[RealtimeInvalidation] 🔄 Retrying subscription for table "${table}" (attempt ${retryAttemptsRef.current}/${maxRetries})`)
                  }
                  setupSubscription()
                }
                retryTimeoutRef.current = null
              }, delay)
            } else {
              // Max retries reached - silently fail and reset for next attempt
              // This is expected behavior during connection issues and will auto-recover
              const errorMessage = status === 'TIMED_OUT' 
                ? 'Subscription timeout - max retries reached'
                : 'Channel error - max retries reached'
              onError?.(errorMessage, status)
              // Reset retry attempts so it can try again on next render/effect
              retryAttemptsRef.current = 0
            }
          }
        })
    }

    setupSubscription()

    // Cleanup on unmount
    return () => {
      isUnmountingRef.current = true
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      retryAttemptsRef.current = 0
    }
  }, [table, event, filter, enabled, channelName, onInvalidate, onError, supabase, isDevelopment, queryKeys])
}

