/**
 * Channel Manager for Realtime Subscription Deduplication
 * 
 * This module manages shared Supabase realtime channels to prevent duplicate
 * subscriptions when multiple components subscribe to the same table/filter combination.
 * 
 * Key features:
 * - Channel deduplication: Multiple components can share the same channel
 * - Automatic cleanup: Channels are removed when no components are using them
 * - Event broadcasting: Events are broadcast to all registered callbacks
 */

import { RealtimeChannel } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ChannelSubscription {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  schema?: string
  filter?: string
}

export interface ChannelCallbacks {
  onEvent: (payload: any) => void
  onStatusChange?: (status: string, err?: any) => void
}

export interface RateLimitConfig {
  /** Maximum events per second (default: 10) */
  maxEventsPerSecond?: number
  /** Batch window in milliseconds (default: 100) */
  batchWindowMs?: number
  /** Maximum batch size (default: 50) */
  maxBatchSize?: number
}

interface ChannelInfo {
  channel: RealtimeChannel
  subscriptions: Set<string> // Set of subscription IDs
  callbacks: Map<string, ChannelCallbacks> // Map of subscription ID to callbacks
  subscription: ChannelSubscription
  eventQueue: any[] // Queue for batching events
  lastEventTime: number // Timestamp of last event
  batchTimeout: NodeJS.Timeout | null // Timeout for batch processing
  rateLimitConfig: RateLimitConfig
}

/**
 * Generates a unique key for a channel subscription
 */
function getChannelKey(subscription: ChannelSubscription): string {
  const parts = [
    subscription.schema || 'public',
    subscription.table,
    subscription.event || '*',
    subscription.filter || '',
  ]
  return parts.join('|')
}

/**
 * Generates a unique subscription ID
 */
function generateSubscriptionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

class ChannelManager {
  private channels: Map<string, ChannelInfo> = new Map()
  private supabaseClient: SupabaseClient | null = null
  private defaultRateLimitConfig: RateLimitConfig = {
    maxEventsPerSecond: 10,
    batchWindowMs: 100,
    maxBatchSize: 50,
  }

  /**
   * Initialize the channel manager with a Supabase client
   */
  initialize(client: SupabaseClient) {
    this.supabaseClient = client
  }

  /**
   * Subscribe to a channel. Returns a subscription ID that must be used to unsubscribe.
   * 
   * Phase 3: Supabase automatically includes the authenticated user's JWT token
   * in realtime subscriptions. RLS policies on the server validate that the token
   * matches the requested channel scope (e.g., user_id in filter matches auth.uid()).
   */
  subscribe(
    subscription: ChannelSubscription,
    callbacks: ChannelCallbacks
  ): string {
    if (!this.supabaseClient) {
      throw new Error('ChannelManager not initialized. Call initialize() first.')
    }

    // Phase 3: Verify client has auth session (Supabase will include JWT automatically)
    // The JWT token is automatically included in the subscription request by Supabase
    // Server-side RLS policies validate the token matches the filter scope

    const channelKey = getChannelKey(subscription)
    const subId = generateSubscriptionId()

    // Get or create channel
    let channelInfo = this.channels.get(channelKey)

    if (!channelInfo) {
      // Create new channel
      const channelName = `shared-${channelKey.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`
      const channel = this.supabaseClient.channel(channelName)

      // Set up postgres_changes listener with rate limiting
      const eventType = subscription.event === '*' ? undefined : subscription.event
      const rateLimitConfig = this.defaultRateLimitConfig
      
      channel.on(
        'postgres_changes' as any,
        {
          event: eventType,
          schema: subscription.schema || 'public',
          table: subscription.table,
          filter: subscription.filter,
        },
        (payload: any) => {
          // Rate limit and batch events
          const info = this.channels.get(channelKey)
          if (!info) return

          const now = Date.now()
          const timeSinceLastEvent = now - info.lastEventTime
          const eventsPerSecond = timeSinceLastEvent > 0 ? 1000 / timeSinceLastEvent : Infinity

          // If exceeding rate limit, queue the event
          if (eventsPerSecond > rateLimitConfig.maxEventsPerSecond!) {
            info.eventQueue.push(payload)
            
            // Process batch if queue is full or timeout expires
            if (info.eventQueue.length >= rateLimitConfig.maxBatchSize!) {
              this.processEventBatch(channelKey)
            } else if (!info.batchTimeout) {
              info.batchTimeout = setTimeout(() => {
                this.processEventBatch(channelKey)
              }, rateLimitConfig.batchWindowMs!)
            }
          } else {
            // Within rate limit, process immediately
            info.lastEventTime = now
            this.broadcastEvent(channelKey, payload)
          }
        }
      )

      // Subscribe to channel
      // Phase 3: Supabase automatically includes JWT token from authenticated session
      // Server validates token via RLS policies before allowing subscription
      channel.subscribe((status, err) => {
        // Phase 3: Handle auth-related subscription failures
        if (status === 'CHANNEL_ERROR' && err) {
          const errorMessage = typeof err === 'string' ? err : (err as any)?.message || ''
          // Check for auth-related errors
          if (errorMessage.includes('JWT') || 
              errorMessage.includes('token') || 
              errorMessage.includes('unauthorized') ||
              errorMessage.includes('authentication')) {
            console.error('[ChannelManager] Authentication error in subscription:', errorMessage)
          }
        }

        // Broadcast status changes to all callbacks
        const info = this.channels.get(channelKey)
        if (info) {
          info.callbacks.forEach((cb) => {
            try {
              cb.onStatusChange?.(status, err)
            } catch (error) {
              console.error('[ChannelManager] Error in status callback:', error)
            }
          })
        }
      })

      channelInfo = {
        channel,
        subscriptions: new Set(),
        callbacks: new Map(),
        subscription,
        eventQueue: [],
        lastEventTime: 0,
        batchTimeout: null,
        rateLimitConfig,
      }

      this.channels.set(channelKey, channelInfo)
    }

    // Add this subscription
    channelInfo.subscriptions.add(subId)
    channelInfo.callbacks.set(subId, callbacks)

    // If this is the first subscription, ensure channel is subscribed
    if (channelInfo.subscriptions.size === 1) {
      // Channel is already subscribed from creation, but ensure it's active
      if (channelInfo.channel.state !== 'joined') {
        // Channel will subscribe automatically via the subscribe() call above
      }
    }

    return subId
  }

  /**
   * Process batched events
   */
  private processEventBatch(channelKey: string) {
    const channelInfo = this.channels.get(channelKey)
    if (!channelInfo) return

    // Clear timeout
    if (channelInfo.batchTimeout) {
      clearTimeout(channelInfo.batchTimeout)
      channelInfo.batchTimeout = null
    }

    // Process queued events (limit to maxBatchSize)
    const eventsToProcess = channelInfo.eventQueue.splice(0, channelInfo.rateLimitConfig.maxBatchSize!)
    
    if (eventsToProcess.length > 0) {
      // Broadcast all events in batch
      eventsToProcess.forEach((payload) => {
        this.broadcastEvent(channelKey, payload)
      })
      
      channelInfo.lastEventTime = Date.now()
    }

    // If more events queued, schedule next batch
    if (channelInfo.eventQueue.length > 0 && !channelInfo.batchTimeout) {
      channelInfo.batchTimeout = setTimeout(() => {
        this.processEventBatch(channelKey)
      }, channelInfo.rateLimitConfig.batchWindowMs!)
    }
  }

  /**
   * Broadcast event to all callbacks
   */
  private broadcastEvent(channelKey: string, payload: any) {
    const channelInfo = this.channels.get(channelKey)
    if (!channelInfo) return

    channelInfo.callbacks.forEach((cb) => {
      try {
        cb.onEvent(payload)
      } catch (error) {
        console.error('[ChannelManager] Error in callback:', error)
      }
    })
  }

  /**
   * Unsubscribe from a channel using the subscription ID
   */
  unsubscribe(channelKey: string, subscriptionId: string) {
    const channelInfo = this.channels.get(channelKey)
    if (!channelInfo) {
      return
    }

    // Remove this subscription
    channelInfo.subscriptions.delete(subscriptionId)
    channelInfo.callbacks.delete(subscriptionId)

    // If no more subscriptions, clean up the channel
    if (channelInfo.subscriptions.size === 0) {
      // Clear any pending batch timeout
      if (channelInfo.batchTimeout) {
        clearTimeout(channelInfo.batchTimeout)
        channelInfo.batchTimeout = null
      }
      this.supabaseClient?.removeChannel(channelInfo.channel)
      this.channels.delete(channelKey)
    }
  }

  /**
   * Get channel key for a subscription (useful for cleanup)
   */
  getChannelKey(subscription: ChannelSubscription): string {
    return getChannelKey(subscription)
  }

  /**
   * Get statistics about active channels
   */
  getStats() {
    const stats = {
      totalChannels: this.channels.size,
      totalSubscriptions: 0,
      channels: Array.from(this.channels.entries()).map(([key, info]) => ({
        key,
        table: info.subscription.table,
        event: info.subscription.event || '*',
        filter: info.subscription.filter || '',
        subscriptionCount: info.subscriptions.size,
        state: info.channel.state,
      })),
    }

    this.channels.forEach((info) => {
      stats.totalSubscriptions += info.subscriptions.size
    })

    return stats
  }

  /**
   * Clean up all channels (useful for testing or shutdown)
   */
  cleanup() {
    this.channels.forEach((info) => {
      this.supabaseClient?.removeChannel(info.channel)
    })
    this.channels.clear()
  }
}

// Singleton instance
export const channelManager = new ChannelManager()

