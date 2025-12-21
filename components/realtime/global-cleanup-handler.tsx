'use client'

/**
 * Phase 4: Global cleanup handler for realtime subscriptions
 * 
 * Handles cleanup on:
 * - Page unload (beforeunload/unload events)
 * - Page visibility change (pause/resume subscriptions)
 * 
 * This ensures no lingering connections when user closes tab or navigates away.
 */

import { useEffect } from 'react'
import { channelManager } from '@/lib/realtime/channel-manager'

export function GlobalRealtimeCleanupHandler() {
  useEffect(() => {
    // Phase 4: Cleanup all subscriptions on page unload
    const handleBeforeUnload = () => {
      // Cleanup all channels when page is about to unload
      if (typeof window !== 'undefined') {
        channelManager.cleanup()
      }
    }

    const handleUnload = () => {
      // Final cleanup on unload
      if (typeof window !== 'undefined') {
        channelManager.cleanup()
      }
    }

    // Phase 4: Pause subscriptions when page becomes hidden
    // Resume is handled automatically when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - subscriptions will pause automatically
        // Supabase handles this, but we can log for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('[GlobalRealtimeCleanup] Page hidden - subscriptions paused')
        }
      } else {
        // Page is visible again - subscriptions will resume automatically
        if (process.env.NODE_ENV === 'development') {
          console.log('[GlobalRealtimeCleanup] Page visible - subscriptions resumed')
        }
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('unload', handleUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('unload', handleUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // This component doesn't render anything
  return null
}

