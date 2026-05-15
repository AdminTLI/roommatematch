'use client'

import { createContext, useContext } from 'react'
import type { Locale } from '@/lib/i18n'
import type { Dictionary } from '@/lib/i18n/dictionary-loader'

export interface AppContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  dictionary: Dictionary
  dictionaryReady: boolean
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within a Providers component')
  }
  return context
}
