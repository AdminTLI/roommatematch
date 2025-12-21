'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { initializeEventTracker } from '@/lib/events'
import { DEFAULT_LOCALE, getDictionary, type Locale } from '@/lib/i18n'
import { ReactQueryDevtools } from './(components)/devtools/react-query-devtools-wrapper'
import { SessionTrackerProvider } from '@/components/analytics/session-tracker-provider'

// Query key factory for consistent keys
export const queryKeys = {
  // Real-time data (chats, notifications, matches)
  chats: (userId?: string) => userId ? ['chats', userId] : ['chats'],
  notifications: (userId?: string) => userId ? ['notifications', userId] : ['notifications'],
  matches: {
    top: (userId?: string) => userId ? ['matches', 'top', userId] : ['matches', 'top'],
    count: (userId?: string) => userId ? ['matches', 'count', userId] : ['matches', 'count'],
    compatibility: (userId?: string) => userId ? ['matches', 'compatibility', userId] : ['matches', 'compatibility'],
    all: (userId?: string) => userId ? ['matches', userId] : ['matches'],
  },
  activity: (userId?: string) => userId ? ['activity', userId] : ['activity'],
  updates: ['updates'],
  
  // Semi-static data (profile, housing)
  profile: (userId?: string) => userId ? ['profile', userId] : ['profile'],
  housingListings: (filters?: Record<string, any>) => filters ? ['housing-listings', filters] : ['housing-listings'],
  
  // Static data (universities, campuses)
  universities: ['universities'],
  campuses: ['campuses'],
  timezones: ['timezones'],
  
  // Compatibility scores (cached for 5 minutes)
  compatibility: (userAId?: string, userBId?: string) => 
    userAId && userBId 
      ? ['compatibility', userAId, userBId] 
      : ['compatibility'],
} as const

// Create a client with granular stale times and enhanced retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time (overridden per query for specific data types)
      staleTime: 5 * 60 * 1000, // 5 minutes default (increased from 1 minute)
      refetchOnWindowFocus: true, // Refetch on window focus for real-time queries
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        // Retry up to 3 times for server errors (5xx) or network errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s (max 30s)
        return Math.min(1000 * Math.pow(2, attemptIndex), 30000)
      },
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
})

// Export queryClient for cache invalidation
export { queryClient }

interface AppContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  dictionary: ReturnType<typeof getDictionary>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within a Providers component')
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    // Initialize from localStorage on client side only
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale
      if (savedLocale && ['en', 'nl'].includes(savedLocale)) {
        return savedLocale
      }
    }
    return DEFAULT_LOCALE
  })
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    // Initialize event tracker
    initializeEventTracker(supabase)
  }, [supabase])

  // Update HTML lang attribute when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }

  // Memoize dictionary to ensure it updates when locale changes
  const dictionary = useMemo(() => getDictionary(locale), [locale])

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider
        value={{
          locale,
          setLocale: handleSetLocale,
          dictionary,
        }}
      >
        <SessionTrackerProvider>
          {children}
        </SessionTrackerProvider>
      </AppContext.Provider>
      {process.env.NODE_ENV === 'development' && ReactQueryDevtools && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
