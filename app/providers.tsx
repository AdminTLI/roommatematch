'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { initializeEventTracker } from '@/lib/events'
import { DEFAULT_LOCALE, getDictionary, type Locale } from '@/lib/i18n'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        return failureCount < 3
      },
    },
  },
})

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
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    // Initialize event tracker
    initializeEventTracker(supabase)

    // Get locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && ['en', 'nl'].includes(savedLocale)) {
      setLocale(savedLocale)
    }
  }, [supabase])

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const dictionary = getDictionary(locale)

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider
        value={{
          locale,
          setLocale: handleSetLocale,
          dictionary,
        }}
      >
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  )
}
