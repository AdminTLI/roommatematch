'use client'

import { useEffect, useRef } from 'react'

/**
 * Reports activity for inactivity retention (max once per 15 minutes server-side).
 */
export function ActivityHeartbeat() {
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current) return
    sent.current = true

    fetch('/api/account/activity', { method: 'POST', credentials: 'include' }).catch(() => {
      // non-critical
    })
  }, [])

  return null
}
