'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { initializeEventTracker } from '@/lib/events'
import { ReactQueryDevtools } from './(components)/devtools/react-query-devtools-wrapper'
import { SessionTrackerProvider } from '@/components/analytics/session-tracker-provider'
import { AuthSessionTerminationListener } from '@/components/auth/auth-session-termination-listener'

/**
 * Authenticated-app extras: session tracking, auth listeners, event tracker.
 * Skipped on marketing routes to reduce first-visit JS and Supabase work.
 */
export function AppProvidersAddon({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    initializeEventTracker(supabase)
  }, [supabase])

  return (
    <SessionTrackerProvider>
      <AuthSessionTerminationListener />
      {children}
      {process.env.NODE_ENV === 'development' && ReactQueryDevtools && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </SessionTrackerProvider>
  )
}
