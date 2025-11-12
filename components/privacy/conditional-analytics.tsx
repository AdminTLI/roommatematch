'use client'

import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getClientConsents } from '@/lib/privacy/cookie-consent'

/**
 * Conditionally load analytics based on user consent
 */
export function ConditionalAnalytics() {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
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

  if (!hasConsent) {
    return null
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

