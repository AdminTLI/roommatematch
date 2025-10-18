'use client'

import { Button } from '@/components/ui/button'
// Removed useApp import - using default locale
import { Languages, Check } from 'lucide-react'
import { useState } from 'react'

interface LanguageSwitcherProps {
  showLabel?: boolean
  variant?: 'default' | 'minimal' | 'dropdown'
}

export function LanguageSwitcher({ 
  showLabel = false, 
  variant = 'default' 
}: LanguageSwitcherProps) {
  // Using default English locale instead of i18n
  const locale = 'en'
  const setLocale = (newLocale: string) => {
    console.log('Locale change requested:', newLocale)
    // In a real app, you'd update the locale here
  }
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
  ]

  const handleLanguageChange = (newLocale: 'en' | 'nl') => {
    setLocale(newLocale)
    setIsOpen(false)
    
    // Track language change event
    if (typeof window !== 'undefined') {
      // Analytics tracking would go here
      console.log('Language changed to:', newLocale)
    }
  }

  const currentLanguage = languages.find(lang => lang.code === locale)

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-1">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code as 'en' | 'nl')}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              locale === language.code
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
            aria-label={`Switch to ${language.name}`}
          >
            {language.flag}
          </button>
        ))}
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
          aria-expanded={isOpen}
          aria-haspopup="true"
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
                  onClick={() => handleLanguageChange(language.code as 'en' | 'nl')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-md last:rounded-b-md"
                  role="menuitem"
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                    {language.name}
                  </span>
                  {locale === language.code && (
                    <Check className="h-4 w-4 text-primary" />
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
          Language:
        </span>
      )}
      
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code as 'en' | 'nl')}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all ${
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
