'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { initializeSessionTracking, trackPageView } from '@/lib/analytics/session-tracker'
import { usePathname } from 'next/navigation'

/**
 * Provider component that initializes session tracking
 * Add this to your app layout or providers
 */
export function SessionTrackerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const supabaseRef = useRef(createClient())
  const initializedRef = useRef(false)

  useEffect(() => {
    // Get current user and initialize session tracking (only once)
    if (!initializedRef.current) {
      const initTracking = async () => {
        try {
          const { data: { user } } = await supabaseRef.current.auth.getUser()
          if (user) {
            initializeSessionTracking(user.id)
          } else {
            // Initialize for anonymous users too
            initializeSessionTracking()
          }
          initializedRef.current = true
        } catch (error) {
          // Silently fail - don't break the app if tracking fails
          console.warn('Failed to initialize session tracking:', error)
        }
      }

      initTracking()
    }
  }, [])

  // Track page views when pathname changes
  useEffect(() => {
    if (pathname && initializedRef.current) {
      const trackView = async () => {
        try {
          const { data: { user } } = await supabaseRef.current.auth.getUser()
          // Use full URL including query params to capture UTM parameters
          const fullUrl = typeof window !== 'undefined' 
            ? window.location.href 
            : pathname
          trackPageView(fullUrl, user?.id, {
            timestamp: new Date().toISOString()
          })
        } catch (error) {
          // Silently fail - don't break the app if tracking fails
        }
      }
      trackView()
    }
  }, [pathname])

  return <>{children}</>
}

