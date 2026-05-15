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
import { useCookieConsentAppearance } from '@/lib/privacy/cookie-consent-appearance'
import { cn } from '@/lib/utils'

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
  const appearance = useCookieConsentAppearance()
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
    <div className={cn('fixed inset-0 z-[80] flex items-end justify-center p-2 sm:items-center sm:p-4', appearance.overlay)}>
      <Card className={cn('flex w-full max-w-2xl flex-col overflow-hidden max-h-[calc(100dvh-0.75rem)] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl', appearance.panel)}>
        <CardHeader className={cn('flex flex-shrink-0 flex-row items-center justify-between space-y-0 border-b pb-4', appearance.headerBorder)}>
          <div className="flex items-center gap-3">
            <Cookie className={cn('h-6 w-6', appearance.icon)} />
            <CardTitle className={cn('text-xl font-bold tracking-tight sm:text-2xl', appearance.title)}>
              {locale === 'nl' ? 'Cookie Voorkeuren' : 'Cookie Preferences'}
            </CardTitle>
          </div>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={cn('h-10 w-10 shrink-0 rounded-full p-0', appearance.closeBtn)}
              aria-label={locale === 'nl' ? 'Sluiten' : 'Close'}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className={cn('flex-1 space-y-6 overflow-y-auto px-6 pb-6 pt-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent', appearance.scrollbar)}>
          <CardDescription className={appearance.body}>
            {locale === 'nl'
              ? 'Beheer uw cookie voorkeuren. U kunt deze instellingen op elk moment wijzigen.'
              : 'Manage your cookie preferences. You can change these settings at any time.'}
          </CardDescription>

          {/* Essential Cookies */}
          <div className={cn('flex items-start justify-between rounded-2xl border p-4', appearance.rowMuted)}>
            <div className="flex-1 pr-4">
              <div className="mb-2 flex items-center gap-2">
                <Label className={cn('text-base font-semibold', appearance.title)}>{t.essential.title}</Label>
                <Info className={cn('h-4 w-4', appearance.muted)} />
              </div>
              <p className={cn('text-sm leading-relaxed', appearance.body)}>{t.essential.description}</p>
            </div>
            <Switch
              checked={preferences.essential}
              disabled
              className="opacity-50"
            />
          </div>

          {/* Analytics */}
          <div className={cn('flex items-start justify-between rounded-2xl border p-4', appearance.row)}>
            <div className="flex-1 pr-4">
              <Label className={cn('mb-2 block text-base font-semibold', appearance.title)}>{t.analytics.title}</Label>
              <p className={cn('text-sm leading-relaxed', appearance.body)}>{t.analytics.description}</p>
            </div>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(checked) => handleToggle('analytics', checked)}
            />
          </div>

          {/* Error Tracking */}
          <div className={cn('flex items-start justify-between rounded-2xl border p-4', appearance.row)}>
            <div className="flex-1 pr-4">
              <Label className={cn('mb-2 block text-base font-semibold', appearance.title)}>{t.error_tracking.title}</Label>
              <p className={cn('text-sm leading-relaxed', appearance.body)}>{t.error_tracking.description}</p>
            </div>
            <Switch
              checked={preferences.error_tracking}
              onCheckedChange={(checked) => handleToggle('error_tracking', checked)}
            />
          </div>

          {/* Session Replay */}
          <div className={cn('flex items-start justify-between rounded-2xl border p-4', appearance.row)}>
            <div className="flex-1 pr-4">
              <Label className={cn('mb-2 block text-base font-semibold', appearance.title)}>{t.session_replay.title}</Label>
              <p className={cn('text-sm leading-relaxed', appearance.body)}>{t.session_replay.description}</p>
            </div>
            <Switch
              checked={preferences.session_replay}
              onCheckedChange={(checked) => handleToggle('session_replay', checked)}
            />
          </div>

          {/* Marketing */}
          <div className={cn('flex items-start justify-between rounded-2xl border p-4', appearance.row)}>
            <div className="flex-1 pr-4">
              <Label className={cn('mb-2 block text-base font-semibold', appearance.title)}>{t.marketing.title}</Label>
              <p className={cn('text-sm leading-relaxed', appearance.body)}>{t.marketing.description}</p>
            </div>
            <Switch
              checked={preferences.marketing}
              onCheckedChange={(checked) => handleToggle('marketing', checked)}
            />
          </div>
        </CardContent>
        <div className={cn('flex flex-shrink-0 flex-col gap-3 border-t px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex-row', appearance.footer)}>
          <Button
            type="button"
            onClick={handleSave}
            className={cn('flex-1', appearance.primaryBtn)}
          >
            {locale === 'nl' ? 'Voorkeuren Opslaan' : 'Save Preferences'}
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={cn('w-full sm:w-auto', appearance.outlineBtn)}
            >
              {locale === 'nl' ? 'Annuleren' : 'Cancel'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

