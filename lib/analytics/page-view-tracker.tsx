'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/events'
import { createClient } from '@/lib/supabase/client'

/**
 * Automatic Page View Tracker
 * Tracks page views automatically on route changes with UTM parameters
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPathname = useRef<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get current user if available
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user?.id
    }

    // Track page view on route change
    const trackCurrentPage = async () => {
      // Skip if pathname hasn't changed (e.g., only search params changed)
      if (previousPathname.current === pathname) {
        return
      }

      previousPathname.current = pathname

      // Build full URL with search params
      const search = searchParams.toString()
      const fullPath = pathname + (search ? `?${search}` : '')

      // Get user ID
      const userId = await getCurrentUser()

      // Track the page view with UTM params (extracted automatically in trackPageView)
      await trackPageView(fullPath, userId)
    }

    // Small delay to ensure page is fully loaded
    const timeoutId = setTimeout(() => {
      trackCurrentPage()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pathname, searchParams, supabase])

  // This component doesn't render anything
  return null
}



