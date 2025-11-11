'use client'

import { Button } from '@/components/ui/button'
import { useApp } from '@/app/providers'
import { Languages, Check } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import type { Locale } from '@/lib/i18n'

interface LanguageSwitcherProps {
  showLabel?: boolean
  variant?: 'default' | 'minimal' | 'dropdown'
}

export function LanguageSwitcher({ 
  showLabel = false, 
  variant = 'default' 
}: LanguageSwitcherProps) {
  const { locale, setLocale, dictionary } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
    { code: 'nl' as Locale, name: 'Nederlands', flag: '🇳🇱' }
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale)
    setIsOpen(false)
    // The locale state change will trigger a re-render with the new dictionary
    // No page reload needed since all components using useApp() will get the new dictionary
  }

  const currentLanguage = languages.find(lang => lang.code === locale)

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-1" role="group" aria-label={dictionary.nav?.language || 'Language'}>
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`px-2 py-1 text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
              locale === language.code
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label={`Switch to ${language.name}`}
            aria-pressed={locale === language.code}
            title={language.name}
          >
            {language.flag}
          </button>
        ))}
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={dictionary.nav?.language || 'Language'}
        >
          <Languages className="h-4 w-4" />
          {currentLanguage?.flag}
          {showLabel && <span>{currentLanguage?.name}</span>}
        </Button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-md last:rounded-b-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  role="menuitem"
                  aria-selected={locale === language.code}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                    {language.name}
                  </span>
                  {locale === language.code && (
                    <Check className="h-4 w-4 text-brand-primary" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {dictionary.nav?.language || 'Language'}:
        </span>
      )}
      
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary ${
              locale === language.code
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
            aria-label={`Switch to ${language.name}`}
            aria-pressed={locale === language.code}
          >
            <span className="text-sm">{language.flag}</span>
            <span className="hidden sm:inline">{language.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
