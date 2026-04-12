'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Cookie, Settings } from 'lucide-react'
import { 
  shouldShowConsentBanner, 
  saveClientConsents, 
  getClientConsents,
  getOrCreateAnonymousSessionId,
} from '@/lib/privacy/cookie-consent-client'
import { CookiePreferenceCenter } from './cookie-preference-center'

interface CookieConsentBannerProps {
  locale?: 'en' | 'nl'
}

const translations = {
  en: {
    title: 'Cookie Consent',
    description:
      'We use cookies, local storage, and similar technologies to run the site, measure usage when you allow it, and support optional features. You can choose what to allow.',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    customize: 'Customize',
    essential:
      'Essential cookies and storage are required for secure login, CSRF protection, and core site operation.',
    learnMore: 'Learn more in our',
    cookiePolicy: 'Cookie & local storage policy'
  },
  nl: {
    title: 'Cookie Toestemming',
    description:
      'We gebruiken cookies, local storage en vergelijkbare technologieën om de site te laten werken, gebruik te meten als u dat toestaat, en optionele functies te ondersteunen. U kiest zelf wat u toestaat.',
    acceptAll: 'Alles Accepteren',
    rejectAll: 'Alles Weigeren',
    customize: 'Aanpassen',
    essential:
      'Essentiële cookies en opslag zijn nodig voor veilig inloggen, CSRF-bescherming en de kern van de site.',
    learnMore: 'Meer informatie in ons',
    cookiePolicy: 'Cookie- en localStorage-beleid'
  }
}

function isChatPath(pathname: string | null) {
  return pathname === '/chat' || pathname?.startsWith('/chat/')
}

function isDashboardPath(pathname: string | null) {
  return pathname === '/dashboard'
}

export function CookieConsentBanner({ locale = 'en' }: CookieConsentBannerProps) {
  const pathname = usePathname()
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showReopenControl, setShowReopenControl] = useState(false)
  const t = translations[locale]

  const onChat = isChatPath(pathname)
  const onDashboard = isDashboardPath(pathname)

  useEffect(() => {
    if (onChat && showPreferences) {
      setShowPreferences(false)
    }
  }, [onChat, showPreferences])

  useEffect(() => {
    // Check if banner should be shown
    if (shouldShowConsentBanner()) {
      setShowBanner(true)
      setShowReopenControl(false)
    } else if (getClientConsents()) {
      // User already saved choices  -  offer a persistent way to reopen the preference center
      setShowReopenControl(true)
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

  if (showPreferences) {
    if (onChat) {
      return null
    }
    return (
      <CookiePreferenceCenter
        locale={locale}
        consentBaseline={getClientConsents() ? 'from_storage' : 'customize_first_visit'}
        onClose={() => {
          setShowPreferences(false)
          // Check if user has made selections
          const prefs = getClientConsents()
          if (prefs) {
            setShowBanner(false)
            setShowReopenControl(true)
          }
        }}
      />
    )
  }

  if (onChat) {
    return null
  }

  if (!showBanner && !(showReopenControl && onDashboard)) {
    return null
  }

  return (
    <>
    {showBanner && (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="container mx-auto max-w-4xl">
        <Card className="border border-white/80 bg-white/90 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/85 dark:border-white/15 dark:bg-slate-900/90 dark:text-slate-50 dark:shadow-[0_24px_64px_rgba(0,0,0,0.45)] dark:supports-[backdrop-filter]:bg-slate-900/80">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-violet-400 mt-0.5 sm:mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-1.5 sm:mb-2">
                  {t.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-2 sm:mb-3 leading-relaxed">
                  {t.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 sm:mb-4 leading-relaxed">
                  {t.essential}
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                  <Button
                    onClick={handleAcceptAll}
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto rounded-full bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 dark:bg-violet-600 dark:shadow-violet-600/25 dark:hover:bg-violet-700"
                  >
                    {t.acceptAll}
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto rounded-full border-slate-200/90 bg-white/70 text-slate-900 hover:bg-white dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {t.rejectAll}
                  </Button>
                  <Button
                    onClick={handleCustomize}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto rounded-full text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                  >
                    <Settings className="h-4 w-4" />
                    {t.customize}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 sm:mt-4">
                  {t.learnMore}{' '}
                  <a
                    href="/cookies"
                    className="font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-violet-400 dark:hover:text-violet-300"
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
    )}
    {showReopenControl && !showBanner && onDashboard && (
      <div className="fixed left-4 z-40 print:hidden bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:bottom-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreferences(true)}
          className="sm:hidden h-10 w-10 rounded-full p-0 border-slate-200/90 bg-white/90 text-slate-800 shadow-md backdrop-blur-md dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-100"
          aria-label={locale === 'nl' ? 'Cookie-instellingen' : 'Cookie settings'}
        >
          <Cookie className="h-4 w-4" aria-hidden />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreferences(true)}
          className="hidden sm:inline-flex rounded-full border-slate-200/90 bg-white/90 text-xs font-medium text-slate-800 shadow-md backdrop-blur-md dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-100"
        >
          <Cookie className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          {locale === 'nl' ? 'Cookie-instellingen' : 'Cookie settings'}
        </Button>
      </div>
    )}
    </>
  )
}

