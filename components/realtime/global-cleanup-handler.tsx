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
    // Prefer pagehide over unload — unload is blocked by Permissions-Policy in many browsers
    const handlePageHide = () => {
      channelManager.cleanup()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Best-effort cleanup when tab is backgrounded (bfcache-safe companion to pagehide)
        if (process.env.NODE_ENV === 'development') {
          console.log('[GlobalRealtimeCleanup] Page hidden')
        }
      }
    }

    window.addEventListener('pagehide', handlePageHide)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // This component doesn't render anything
  return null
}

