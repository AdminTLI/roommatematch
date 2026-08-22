'use client'

import { useEffect } from 'react'

const PRESENCE_INTERVAL_MS = 2 * 60 * 1000

function pingPresence() {
  fetch('/api/account/presence', { method: 'POST', credentials: 'include' }).catch(() => {
    // non-critical
  })
}

/**
 * Reports activity for online presence (every ~2 min while tab is open) and
 * inactivity retention (once per session via the throttled activity endpoint).
 */
export function ActivityHeartbeat() {
  useEffect(() => {
    pingPresence()

    fetch('/api/account/activity', { method: 'POST', credentials: 'include' }).catch(() => {
      // non-critical
    })

    const interval = setInterval(pingPresence, PRESENCE_INTERVAL_MS)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pingPresence()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return null
}
