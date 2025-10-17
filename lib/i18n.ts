// Internationalization utilities
// This module provides locale management and dictionary access

import { en } from '@/app/(i18n)/en'
import { nl } from '@/app/(i18n)/nl'

export type Locale = 'en' | 'nl'
export type Dictionary = typeof en

export const LOCALES: Locale[] = ['en', 'nl']
export const DEFAULT_LOCALE: Locale = 'en'

export const dictionaries = {
  en,
  nl
} as const

/**
 * Get dictionary for a specific locale
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE]
}

/**
 * Get nested dictionary value by path
 */
export function getDictionaryValue(dict: Dictionary, path: string): string {
  const keys = path.split('.')
  let current: any = dict
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return path // Return path if key not found
    }
  }
  
  return typeof current === 'string' ? current : path
}

/**
 * Interpolate template string with values
 */
export function interpolate(template: string, values: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match
  })
}

/**
 * Get localized text with interpolation
 */
export function t(dict: Dictionary, path: string, values?: Record<string, any>): string {
  const text = getDictionaryValue(dict, path)
  return values ? interpolate(text, values) : text
}

/**
 * Check if locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale)
}

/**
 * Get locale from request headers or default
 */
export function getLocaleFromHeaders(headers: Headers): Locale {
  const acceptLanguage = headers.get('accept-language')
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().toLowerCase())
    for (const lang of languages) {
      if (lang === 'nl' || lang.startsWith('nl-')) return 'nl'
      if (lang === 'en' || lang.startsWith('en-')) return 'en'
    }
  }
  return DEFAULT_LOCALE
}

/**
 * Get locale from URL pathname
 */
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && isValidLocale(segments[0])) {
    return segments[0] as Locale
  }
  return DEFAULT_LOCALE
}

/**
 * Remove locale from pathname
 */
export function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && isValidLocale(segments[0])) {
    return '/' + segments.slice(1).join('/')
  }
  return pathname
}

/**
 * Add locale to pathname
 */
export function addLocaleToPathname(pathname: string, locale: Locale): string {
  if (pathname === '/') return `/${locale}`
  return `/${locale}${pathname}`
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date | string, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US')
}

/**
 * Format time according to locale
 */
export function formatTime(date: Date | string, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString(locale === 'nl' ? 'nl-NL' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return locale === 'nl' ? 'net nu' : 'just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return locale === 'nl' 
      ? `${diffInMinutes} minuten geleden`
      : `${diffInMinutes} minutes ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return locale === 'nl'
      ? `${diffInHours} uur geleden`
      : `${diffInHours} hours ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return locale === 'nl'
      ? `${diffInDays} dagen geleden`
      : `${diffInDays} days ago`
  }
  
  return formatDate(dateObj, locale)
}

/**
 * Format currency according to locale
 */
export function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

/**
 * Format number according to locale
 */
export function formatNumber(number: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-US').format(number)
}

/**
 * Get plural form for a given count
 */
export function getPlural(count: number, locale: Locale, forms: Record<string, string>): string {
  const rules = new Intl.PluralRules(locale === 'nl' ? 'nl-NL' : 'en-US')
  const form = rules.select(count)
  return forms[form] || forms.other || String(count)
}

/**
 * RTL (Right-to-Left) support detection
 */
export function isRTL(locale: Locale): boolean {
  // Currently we only support LTR languages (English and Dutch)
  return false
}

/**
 * Get text direction for a locale
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr'
}

/**
 * Localization metadata
 */
export const localeMetadata = {
  en: {
    name: 'English',
    nativeName: 'English',
    direction: 'ltr' as const,
    flag: '🇺🇸'
  },
  nl: {
    name: 'Dutch',
    nativeName: 'Nederlands',
    direction: 'ltr' as const,
    flag: '🇳🇱'
  }
} as const

/**
 * Get locale metadata
 */
export function getLocaleMetadata(locale: Locale) {
  return localeMetadata[locale]
}

/**
 * Get all available locales with metadata
 */
export function getAvailableLocales() {
  return LOCALES.map(locale => ({
    code: locale,
    ...getLocaleMetadata(locale)
  }))
}

/**
 * Language switcher component props
 */
export interface LanguageSwitcherProps {
  currentLocale: Locale
  availableLocales?: Locale[]
  showFlags?: boolean
  showNativeNames?: boolean
}

/**
 * Server-side locale utilities
 */
export class ServerLocale {
  private locale: Locale
  private dictionary: Dictionary

  constructor(locale: Locale) {
    this.locale = locale
    this.dictionary = getDictionary(locale)
  }

  t(path: string, values?: Record<string, any>): string {
    return t(this.dictionary, path, values)
  }

  getLocale(): Locale {
    return this.locale
  }

  getDictionary(): Dictionary {
    return this.dictionary
  }

  formatDate(date: Date | string): string {
    return formatDate(date, this.locale)
  }

  formatTime(date: Date | string): string {
    return formatTime(date, this.locale)
  }

  formatRelativeTime(date: Date | string): string {
    return formatRelativeTime(date, this.locale)
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount, this.locale)
  }

  formatNumber(number: number): string {
    return formatNumber(number, this.locale)
  }
}
