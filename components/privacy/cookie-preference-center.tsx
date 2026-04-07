'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { X, Cookie, Info } from 'lucide-react'
import { 
  saveClientConsents, 
  getClientConsents,
  getOrCreateAnonymousSessionId,
  type ConsentType,
  NON_ESSENTIAL_CONSENTS 
} from '@/lib/privacy/cookie-consent-client'

export type ConsentBaselineMode = 'from_storage' | 'customize_first_visit'

interface CookiePreferenceCenterProps {
  locale?: 'en' | 'nl'
  onClose?: () => void
  /**
   * `customize_first_visit`: user opened the centre from “Customize” before any saved prefs  -  keep every
   * non-essential toggle off (never hydrate stale storage into toggles).
   * `from_storage`: load prior choices from localStorage when present.
   */
  consentBaseline?: ConsentBaselineMode
}

const consentDescriptions = {
  en: {
    essential: {
      title: 'Essential Cookies',
      description: 'Required for the website to function. These cannot be disabled.',
      alwaysOn: true
    },
    analytics: {
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.'
    },
    error_tracking: {
      title: 'Error Tracking',
      description: 'Help us identify and fix technical issues by reporting errors and performance problems.'
    },
    session_replay: {
      title: 'Session Replay',
      description: 'Record user sessions to help us improve the user experience and debug issues. May capture sensitive information.'
    },
    marketing: {
      title: 'Marketing Cookies',
      description: 'Used to track visitors across websites for marketing and advertising purposes.'
    }
  },
  nl: {
    essential: {
      title: 'Essentiële Cookies',
      description: 'Vereist voor de website om te functioneren. Deze kunnen niet worden uitgeschakeld.',
      alwaysOn: true
    },
    analytics: {
      title: 'Analytische Cookies',
      description: 'Helpen ons begrijpen hoe bezoekers met onze website interageren door informatie anoniem te verzamelen en te rapporteren.'
    },
    error_tracking: {
      title: 'Foutopsporing',
      description: 'Helpen ons technische problemen te identificeren en op te lossen door fouten en prestatieproblemen te rapporteren.'
    },
    session_replay: {
      title: 'Sessieherhaling',
      description: 'Neem gebruikerssessies op om ons te helpen de gebruikerservaring te verbeteren en problemen op te lossen. Kan gevoelige informatie vastleggen.'
    },
    marketing: {
      title: 'Marketing Cookies',
      description: 'Gebruikt om bezoekers op verschillende websites te volgen voor marketing- en advertentiedoeleinden.'
    }
  }
}

const DEFAULT_PREFERENCES = {
  essential: true,
  analytics: false,
  error_tracking: false,
  session_replay: false,
  marketing: false
} as const

export function CookiePreferenceCenter({
  locale = 'en',
  onClose,
  consentBaseline = 'from_storage'
}: CookiePreferenceCenterProps) {
  const [preferences, setPreferences] = useState({ ...DEFAULT_PREFERENCES })

  useEffect(() => {
    if (consentBaseline === 'customize_first_visit') {
      setPreferences({ ...DEFAULT_PREFERENCES })
      return
    }
    const existing = getClientConsents()
    if (existing) {
      setPreferences({
        essential: true,
        analytics: Boolean(existing.analytics),
        error_tracking: Boolean(existing.error_tracking),
        session_replay: Boolean(existing.session_replay),
        marketing: Boolean(existing.marketing)
      })
    }
  }, [consentBaseline])

  const handleToggle = async (consentType: ConsentType, value: boolean) => {
    if (consentType === 'essential') {
      return // Cannot toggle essential
    }

    const updated = { ...preferences, [consentType]: value }
    setPreferences(updated)
    saveClientConsents(updated)

    // Save to server (for both authenticated and anonymous users)
    try {
      const sessionId = getOrCreateAnonymousSessionId()
      const response = await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consents: [consentType],
          action: value ? 'grant' : 'withdraw',
          sessionId: sessionId || undefined
        })
      })
      
      if (!response.ok) {
        console.error('Failed to save consent to server')
      }
    } catch (error) {
      console.error('Failed to save consent', error)
    }
  }

  const handleSave = async () => {
    saveClientConsents(preferences)

    // Save all preferences to server (for both authenticated and anonymous users)
    try {
      const sessionId = getOrCreateAnonymousSessionId()
      const granted: ConsentType[] = []
      const withdrawn: ConsentType[] = []

      NON_ESSENTIAL_CONSENTS.forEach(type => {
        if (preferences[type]) {
          granted.push(type)
        } else {
          withdrawn.push(type)
        }
      })

      if (granted.length > 0) {
        await fetch('/api/privacy/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consents: granted,
            action: 'grant',
            sessionId: sessionId || undefined
          })
        })
      }

      if (withdrawn.length > 0) {
        await fetch('/api/privacy/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consents: withdrawn,
            action: 'withdraw',
            sessionId: sessionId || undefined
          })
        })
      }

      // Reload page to apply consent
      window.location.reload()
    } catch (error) {
      console.error('Failed to save consent', error)
      if (onClose) {
        onClose()
      }
    }
  }

  const t = consentDescriptions[locale]

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 p-2 backdrop-blur-sm dark:bg-black/55 sm:items-center sm:p-4">
      <Card className="flex w-full max-w-2xl flex-col overflow-hidden border border-white/80 bg-white/95 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.15)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-50 dark:shadow-[0_24px_80px_rgba(0,0,0,0.5)] dark:supports-[backdrop-filter]:bg-slate-900/90 max-h-[calc(100dvh-0.75rem)] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl">
        <CardHeader className="flex flex-shrink-0 flex-row items-center justify-between space-y-0 border-b border-slate-200/80 pb-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Cookie className="h-6 w-6 text-blue-600 dark:text-violet-400" />
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
              {locale === 'nl' ? 'Cookie Voorkeuren' : 'Cookie Preferences'}
            </CardTitle>
          </div>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 shrink-0 rounded-full p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              aria-label={locale === 'nl' ? 'Sluiten' : 'Close'}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 space-y-6 overflow-y-auto px-6 pb-6 pt-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-track]:bg-transparent">
          <CardDescription className="text-slate-600 dark:text-slate-300">
            {locale === 'nl'
              ? 'Beheer uw cookie voorkeuren. U kunt deze instellingen op elk moment wijzigen.'
              : 'Manage your cookie preferences. You can change these settings at any time.'}
          </CardDescription>

          {/* Essential Cookies */}
          <div className="flex items-start justify-between rounded-2xl border border-slate-200/90 bg-slate-50/90 p-4 dark:border-slate-600 dark:bg-slate-800/60">
            <div className="flex-1 pr-4">
              <div className="mb-2 flex items-center gap-2">
                <Label className="text-base font-semibold text-slate-900 dark:text-slate-50">{t.essential.title}</Label>
                <Info className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.essential.description}</p>
            </div>
            <Switch
              checked={preferences.essential}
              disabled
              className="opacity-50"
            />
          </div>

          {/* Analytics */}
          <div className="flex items-start justify-between rounded-2xl border border-slate-200/90 p-4 dark:border-slate-600">
            <div className="flex-1 pr-4">
              <Label className="mb-2 block text-base font-semibold text-slate-900 dark:text-slate-50">{t.analytics.title}</Label>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.analytics.description}</p>
            </div>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(checked) => handleToggle('analytics', checked)}
            />
          </div>

          {/* Error Tracking */}
          <div className="flex items-start justify-between rounded-2xl border border-slate-200/90 p-4 dark:border-slate-600">
            <div className="flex-1 pr-4">
              <Label className="mb-2 block text-base font-semibold text-slate-900 dark:text-slate-50">{t.error_tracking.title}</Label>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.error_tracking.description}</p>
            </div>
            <Switch
              checked={preferences.error_tracking}
              onCheckedChange={(checked) => handleToggle('error_tracking', checked)}
            />
          </div>

          {/* Session Replay */}
          <div className="flex items-start justify-between rounded-2xl border border-slate-200/90 p-4 dark:border-slate-600">
            <div className="flex-1 pr-4">
              <Label className="mb-2 block text-base font-semibold text-slate-900 dark:text-slate-50">{t.session_replay.title}</Label>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.session_replay.description}</p>
            </div>
            <Switch
              checked={preferences.session_replay}
              onCheckedChange={(checked) => handleToggle('session_replay', checked)}
            />
          </div>

          {/* Marketing */}
          <div className="flex items-start justify-between rounded-2xl border border-slate-200/90 p-4 dark:border-slate-600">
            <div className="flex-1 pr-4">
              <Label className="mb-2 block text-base font-semibold text-slate-900 dark:text-slate-50">{t.marketing.title}</Label>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.marketing.description}</p>
            </div>
            <Switch
              checked={preferences.marketing}
              onCheckedChange={(checked) => handleToggle('marketing', checked)}
            />
          </div>
        </CardContent>
        <div className="flex flex-shrink-0 flex-col gap-3 border-t border-slate-200/80 bg-white/80 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70 sm:flex-row">
          <Button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-full bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 dark:bg-violet-600 dark:shadow-violet-600/20 dark:hover:bg-violet-700"
          >
            {locale === 'nl' ? 'Voorkeuren Opslaan' : 'Save Preferences'}
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full rounded-full border-slate-200/90 bg-white/70 sm:w-auto dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {locale === 'nl' ? 'Annuleren' : 'Cancel'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

