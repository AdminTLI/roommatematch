'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { queryClient } from '@/app/providers'
import { channelManager } from '@/lib/realtime/channel-manager'
import type { ChannelSubscription } from '@/lib/realtime/channel-manager'

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
  const subscriptionIdRef = useRef<string | null>(null)
  const channelKeyRef = useRef<string | null>(null)
  const retryAttemptsRef = useRef(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUnmountingRef = useRef(false)
  const supabase = createClient()
  const isDevelopment = process.env.NODE_ENV === 'development'
  const pathname = usePathname()

  // Initialize channel manager with supabase client
  useEffect(() => {
    channelManager.initialize(supabase)
  }, [supabase])

  // Phase 4: Cleanup subscription on route change
  useEffect(() => {
    // Cleanup subscription when route changes
    return () => {
      if (subscriptionIdRef.current && channelKeyRef.current) {
        if (isDevelopment) {
          console.log('[RealtimeInvalidation] Cleaning up subscription on route change:', {
            table,
            channelKey: channelKeyRef.current,
          })
        }
        channelManager.unsubscribe(channelKeyRef.current, subscriptionIdRef.current)
        subscriptionIdRef.current = null
        channelKeyRef.current = null
      }
      // Clear any pending retries
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [pathname, table, isDevelopment])

  useEffect(() => {
    // In development we see a lot of noisy CHANNEL_ERROR / CLOSED logs when
    // components rapidly mount/unmount during Fast Refresh. Avoid opening a
    // subscription at all when explicitly disabled.
    if (!enabled) {
      return
    }

    isUnmountingRef.current = false
    retryAttemptsRef.current = 0

    // For notifications table, get user first to ensure user_id filter
    const setupSubscription = async () => {
      // Phase 3: Ensure authenticated user token is present before subscribing
      let authenticatedUserId: string | null = null
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          if (isDevelopment) {
            console.error('[RealtimeInvalidation] Auth error:', authError)
          }
          onError?.(`Authentication failed: ${authError.message}`, 'AUTH_ERROR')
          return // Don't subscribe without valid auth
        }

        if (!user) {
          if (isDevelopment) {
            console.warn('[RealtimeInvalidation] No authenticated user - skipping subscription')
          }
          onError?.('No authenticated user', 'AUTH_REQUIRED')
          return // Don't subscribe without authenticated user
        }

        authenticatedUserId = user.id

        // Phase 3: Validate that filter matches authenticated user for user-scoped tables
        if (table === 'notifications') {
          // Extract user_id from filter if present
          const filterUserIdMatch = filter?.match(/user_id=eq\.([a-f0-9-]+)/i)
          if (filterUserIdMatch && filterUserIdMatch[1] !== authenticatedUserId) {
            // Security: Filter user_id doesn't match authenticated user
            const errorMsg = `Filter user_id (${filterUserIdMatch[1]}) does not match authenticated user (${authenticatedUserId})`
            if (isDevelopment) {
              console.error('[RealtimeInvalidation] Security violation:', errorMsg)
            }
            onError?.(errorMsg, 'FILTER_MISMATCH')
            return // Don't subscribe with mismatched filter
          }
        }
      } catch (error) {
        // If we can't verify auth, don't subscribe
        if (isDevelopment) {
          console.error('[RealtimeInvalidation] Failed to verify authentication:', error)
        }
        onError?.(`Authentication verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'AUTH_VERIFICATION_FAILED')
        return
      }

      // For notifications table, ensure user_id filter matches authenticated user
      let effectiveFilter = filter
      if (table === 'notifications' && authenticatedUserId) {
        const userIdFilter = `user_id=eq.${authenticatedUserId}`
        // If filter already has user_id, it should match (we validated above)
        // Otherwise, add it
        if (!filter || !filter.includes('user_id=eq.')) {
          effectiveFilter = userIdFilter
        } else {
          // Filter already validated to match authenticated user
          effectiveFilter = filter
        }
      }

      // Helper to redact PII from payloads for logging
      const redactPayload = (payload: any) => {
        if (!payload || !isDevelopment) return payload
        const redacted = { ...payload }
        // Redact sensitive fields that might contain user data
        if (redacted.new) {
          redacted.new = { ...redacted.new }
          if (redacted.new.user_id) redacted.new.user_id = '[REDACTED]'
          if (redacted.new.content) redacted.new.content = redacted.new.content.substring(0, 50) + '...'
          if (redacted.new.message) redacted.new.message = redacted.new.message.substring(0, 50) + '...'
          if (redacted.new.email) redacted.new.email = '[REDACTED]'
        }
        if (redacted.old) {
          redacted.old = { ...redacted.old }
          if (redacted.old.user_id) redacted.old.user_id = '[REDACTED]'
          if (redacted.old.content) redacted.old.content = redacted.old.content.substring(0, 50) + '...'
          if (redacted.old.message) redacted.old.message = redacted.old.message.substring(0, 50) + '...'
          if (redacted.old.email) redacted.old.email = '[REDACTED]'
        }
        return redacted
      }

      // Create subscription object
      const subscription: ChannelSubscription = {
        table,
        event,
        schema: 'public',
        filter: effectiveFilter,
      }

      const channelKey = channelManager.getChannelKey(subscription)
      channelKeyRef.current = channelKey

      // Unsubscribe from previous subscription if exists
      if (subscriptionIdRef.current && channelKeyRef.current) {
        channelManager.unsubscribe(channelKeyRef.current, subscriptionIdRef.current)
        subscriptionIdRef.current = null
      }

      // Subscribe using channel manager (deduplicates automatically)
      const subId = channelManager.subscribe(subscription, {
        onEvent: (payload: any) => {
          if (isDevelopment) {
            console.log('[RealtimeInvalidation] Event received:', {
              table,
              event: payload.eventType,
              payload: redactPayload(payload),
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
              queryKeys: queryKeys.map(k => typeof k === 'string' && k.length > 36 ? '[REDACTED]' : k),
              table,
              event: payload.eventType,
            })
          }
        },
        onStatusChange: (status, err) => {
          if (isDevelopment) {
            console.log('[RealtimeInvalidation] Subscription status:', {
              channelKey,
              table,
              status,
            })
          }

          if (status === 'SUBSCRIBED') {
            retryAttemptsRef.current = 0 // Reset retry attempts on success
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            // Check if error is due to table not being published for realtime
            const errorMessage = typeof err === 'string' ? err : (err as any)?.message || 'Channel error'
            const isTableNotPublished = errorMessage.includes('publication') || 
                                 errorMessage.includes('replica') ||
                                 errorMessage.includes('not found')
            
            // If table is not published, don't retry (this is expected)
            if (isTableNotPublished && isDevelopment) {
              console.warn(`[RealtimeInvalidation] Table "${table}" may not be published for realtime. This is expected if the table doesn't need realtime updates.`)
              return // Don't retry for publication errors
            }
            
            const maxRetries = 10
            if (retryAttemptsRef.current < maxRetries && !isUnmountingRef.current) {
              if (isDevelopment) {
                console.warn(`[RealtimeInvalidation] ⚠️ ${status === 'TIMED_OUT' ? 'Timeout' : 'Error'} for table "${table}" - will retry`)
              }
              
              const finalErrorMessage = status === 'TIMED_OUT' 
                ? 'Subscription timeout'
                : errorMessage
              
              onError?.(finalErrorMessage, status)
              
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
              const errorMessage = status === 'TIMED_OUT' 
                ? 'Subscription timeout - max retries reached'
                : 'Channel error - max retries reached'
              onError?.(errorMessage, status)
              // Reset retry attempts so it can try again on next render/effect
              retryAttemptsRef.current = 0
            }
          }
        },
      })

      subscriptionIdRef.current = subId
    }

    setupSubscription()

    // Cleanup on unmount
    return () => {
      isUnmountingRef.current = true
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      if (subscriptionIdRef.current && channelKeyRef.current) {
        channelManager.unsubscribe(channelKeyRef.current, subscriptionIdRef.current)
        subscriptionIdRef.current = null
        channelKeyRef.current = null
      }
      retryAttemptsRef.current = 0
    }
  }, [table, event, filter, enabled, channelName, onInvalidate, onError, supabase, isDevelopment, queryKeys])
}

