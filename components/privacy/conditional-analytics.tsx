'use client'

import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getClientConsents } from '@/lib/privacy/cookie-consent-client'

/**
 * Conditionally load analytics based on:
 * 1. Environment variable (NEXT_PUBLIC_DISABLE_ANALYTICS)
 * 2. User consent preferences
 * 
 * Analytics are only loaded if:
 * - NOT disabled by environment variable
 * - User has granted analytics consent
 */
export function ConditionalAnalytics() {
  const [hasConsent, setHasConsent] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    // Check if analytics are disabled via environment variable
    const disabledByEnv = process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === 'true'
    setIsDisabled(disabledByEnv)

    if (disabledByEnv) {
      return // Don't check consent if disabled by env
    }

    // Check consent on mount
    const consents = getClientConsents()
    if (consents?.analytics) {
      setHasConsent(true)
    }

    // Listen for consent changes
    const handleStorageChange = () => {
      const updatedConsents = getClientConsents()
      setHasConsent(updatedConsents?.analytics || false)
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom consent change events
    window.addEventListener('consent-changed', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('consent-changed', handleStorageChange)
    }
  }, [])

  // Don't load analytics if disabled by environment variable or user hasn't consented
  if (isDisabled || !hasConsent) {
    return null
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

