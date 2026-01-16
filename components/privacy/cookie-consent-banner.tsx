'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Cookie, X, Settings } from 'lucide-react'
import { 
  shouldShowConsentBanner, 
  saveClientConsents, 
  getClientConsents,
  getOrCreateAnonymousSessionId,
  type ConsentType 
} from '@/lib/privacy/cookie-consent-client'
import { CookiePreferenceCenter } from './cookie-preference-center'

interface CookieConsentBannerProps {
  locale?: 'en' | 'nl'
}

const translations = {
  en: {
    title: 'Cookie Consent',
    description: 'We use cookies and similar technologies to improve your experience, analyze site usage, and assist in our marketing efforts. You can choose which cookies to accept.',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    customize: 'Customize',
    essential: 'Essential cookies are required for the site to function properly.',
    learnMore: 'Learn more in our',
    cookiePolicy: 'Cookie Policy'
  },
  nl: {
    title: 'Cookie Toestemming',
    description: 'We gebruiken cookies en vergelijkbare technologieën om uw ervaring te verbeteren, sitegebruik te analyseren en onze marketinginspanningen te ondersteunen. U kunt kiezen welke cookies u accepteert.',
    acceptAll: 'Alles Accepteren',
    rejectAll: 'Alles Weigeren',
    customize: 'Aanpassen',
    essential: 'Essentiële cookies zijn vereist voor de site om correct te functioneren.',
    learnMore: 'Meer informatie in ons',
    cookiePolicy: 'Cookiebeleid'
  }
}

export function CookieConsentBanner({ locale = 'en' }: CookieConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const t = translations[locale]

  useEffect(() => {
    // Check if banner should be shown
    if (shouldShowConsentBanner()) {
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = async () => {
    saveClientConsents({
      analytics: true,
      error_tracking: true,
      session_replay: true,
      marketing: true
    })

    // Save to server (for both authenticated and anonymous users)
    try {
      const sessionId = getOrCreateAnonymousSessionId()
      const response = await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consents: ['analytics', 'error_tracking', 'session_replay', 'marketing'],
          action: 'grant',
          sessionId: sessionId || undefined
        })
      })
      
      if (response.ok) {
        // Reload page to apply consent
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to save consent', error)
      // Still hide banner even if server save fails
      setShowBanner(false)
    }

    setShowBanner(false)
  }

  const handleRejectAll = async () => {
    saveClientConsents({
      analytics: false,
      error_tracking: false,
      session_replay: false,
      marketing: false
    })

    // Save to server (for both authenticated and anonymous users)
    try {
      const sessionId = getOrCreateAnonymousSessionId()
      const response = await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consents: ['analytics', 'error_tracking', 'session_replay', 'marketing'],
          action: 'withdraw',
          sessionId: sessionId || undefined
        })
      })
      
      if (response.ok) {
        // Reload page to apply consent
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to save consent', error)
      // Still hide banner even if server save fails
      setShowBanner(false)
    }

    setShowBanner(false)
  }

  const handleCustomize = () => {
    setShowPreferences(true)
  }

  if (!showBanner && !showPreferences) {
    return null
  }

  if (showPreferences) {
    return (
      <CookiePreferenceCenter
        locale={locale}
        onClose={() => {
          setShowPreferences(false)
          // Check if user has made selections
          const prefs = getClientConsents()
          if (prefs) {
            setShowBanner(false)
          }
        }}
      />
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-white dark:bg-white border-border-subtle dark:border-border-subtle shadow-xl">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-text-secondary dark:text-text-secondary mt-0.5 sm:mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-900 mb-1.5 sm:mb-2">
                  {t.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary mb-3 sm:mb-4">
                  {t.description}
                </p>
                <p className="text-xs text-text-muted dark:text-text-muted mb-3 sm:mb-4">
                  {t.essential}
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                  <Button
                    onClick={handleAcceptAll}
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {t.acceptAll}
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-gray-900 dark:text-gray-900"
                  >
                    {t.rejectAll}
                  </Button>
                  <Button
                    onClick={handleCustomize}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto text-gray-900 dark:text-gray-900"
                  >
                    <Settings className="h-4 w-4" />
                    {t.customize}
                  </Button>
                </div>
                <p className="text-xs text-text-muted dark:text-text-muted mt-3 sm:mt-4">
                  {t.learnMore}{' '}
                  <a 
                    href="/cookies" 
                    className="text-gray-900 dark:text-gray-900 hover:text-semantic-accent dark:hover:text-semantic-accent hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.cookiePolicy}
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

