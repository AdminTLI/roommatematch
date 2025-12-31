'use client'

import { useEffect } from 'react'
import { useUser } from '@/lib/auth/use-user'
import { initializeSessionTracking, trackPageView } from '@/lib/analytics/session-tracker'
import { usePathname } from 'next/navigation'

/**
 * Hook to initialize and maintain session tracking
 */
export function useSessionTracking() {
  const { user } = useUser()
  const pathname = usePathname()

  useEffect(() => {
    // Initialize session tracking
    initializeSessionTracking(user?.id)
  }, [user?.id])

  // Track page views when pathname changes
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname, user?.id, {
        timestamp: new Date().toISOString()
      })
    }
  }, [pathname, user?.id])
}



