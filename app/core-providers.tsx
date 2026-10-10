'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n'
import { loadDictionary, type Dictionary } from '@/lib/i18n/dictionary-loader'
import { AppContext } from '@/app/app-context'
import { queryClient } from '@/app/query-client'
import { en } from '@/app/(i18n)/en'
import { DeferredAppChrome } from '@/components/app/deferred-app-chrome'

interface CoreProvidersProps {
  children: React.ReactNode
  /** Force a theme (e.g. light on marketing) to avoid first-paint flash. */
  forcedTheme?: 'light' | 'dark'
}

/**
 * Shared shell: theme + locale. Dictionary loads one locale at a time (async).
 * English is inlined as the initial fallback so marketing pages can paint copy immediately.
 */
export function CoreProviders({ children, forcedTheme }: CoreProvidersProps) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [dictionary, setDictionary] = useState<Dictionary>(en)
  const [dictionaryReady, setDictionaryReady] = useState(locale === DEFAULT_LOCALE)

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem('locale') as Locale
      if (savedLocale && ['en', 'nl'].includes(savedLocale)) {
        setLocaleState(savedLocale)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setDictionaryReady(locale === DEFAULT_LOCALE)

    if (locale === DEFAULT_LOCALE) {
      setDictionary(en)
      setDictionaryReady(true)
      return
    }

    void loadDictionary(locale).then((dict) => {
      if (!cancelled) {
        setDictionary(dict)
        setDictionaryReady(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [locale])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }, [])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      dictionary,
      dictionaryReady,
    }),
    [locale, setLocale, dictionary, dictionaryReady]
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme={forcedTheme ?? 'dark'}
        forcedTheme={forcedTheme}
        enableSystem={!forcedTheme}
      >
        <AppContext.Provider value={value}>
          {children}
          {/* Must stay inside AppContext so cookie banner can read locale */}
          <DeferredAppChrome />
        </AppContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
