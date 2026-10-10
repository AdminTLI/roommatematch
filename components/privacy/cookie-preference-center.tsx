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
  NON_ESSENTIAL_CONSENTS,
  DIAGNOSTICS_CONSENTS,
} from '@/lib/privacy/cookie-consent-client'
import { useCookieConsentAppearance } from '@/lib/privacy/cookie-consent-appearance'
import { cn } from '@/lib/utils'

export type ConsentBaselineMode = 'from_storage' | 'customize_first_visit'

interface CookiePreferenceCenterProps {
  locale?: 'en' | 'nl'
  onClose?: () => void
  /**
   * `customize_first_visit`: user opened the centre from “Customize” before any saved prefs —
   * keep every non-essential toggle off (never hydrate stale storage into toggles).
   * `from_storage`: load prior choices from localStorage when present.
   */
  consentBaseline?: ConsentBaselineMode
}

const copy = {
  en: {
    title: 'Cookie Preferences',
    intro:
      'Manage optional cookies. Essential cookies for login, security, and core site operation always run and are not optional.',
    essentialNote:
      'Essential cookies and storage (authentication, CSRF protection, language/theme, and storing these choices) always apply. They cannot be turned off.',
    analytics: {
      title: 'Analytics',
      description:
        'Help us understand how visitors use Domu Match (aggregate traffic, performance, and product funnels).',
    },
    diagnostics: {
      title: 'Error monitoring & session replay',
      description:
        'Allow Sentry to report browser errors and record short session replays so we can fix bugs. Replay may capture on-screen text; only enable if you are comfortable with that.',
    },
    save: 'Save Preferences',
    cancel: 'Cancel',
    close: 'Close',
  },
  nl: {
    title: 'Cookie Voorkeuren',
    intro:
      'Beheer optionele cookies. Essentiële cookies voor inloggen, beveiliging en de kern van de site draaien altijd en zijn niet optioneel.',
    essentialNote:
      'Essentiële cookies en opslag (authenticatie, CSRF-bescherming, taal/thema en het bewaren van deze keuzes) gelden altijd. Ze kunnen niet worden uitgeschakeld.',
    analytics: {
      title: 'Analyse',
      description:
        'Helpen ons te begrijpen hoe bezoekers Domu Match gebruiken (verkeer, prestaties en productfunnels).',
    },
    diagnostics: {
      title: 'Foutopsporing & sessieherhaling',
      description:
        'Sta toe dat Sentry browserfouten rapporteert en korte sessieherhalingen opneemt om bugs te verhelpen. Replay kan tekst op het scherm vastleggen; zet dit alleen aan als u daarmee akkoord gaat.',
    },
    save: 'Voorkeuren Opslaan',
    cancel: 'Annuleren',
    close: 'Sluiten',
  },
}

type OptionalPreferences = {
  analytics: boolean
  /** Mirrors both error_tracking and session_replay server/client flags. */
  diagnostics: boolean
}

const DEFAULT_PREFERENCES: OptionalPreferences = {
  analytics: false,
  diagnostics: false,
}

function toStoragePrefs(prefs: OptionalPreferences) {
  return {
    analytics: prefs.analytics,
    error_tracking: prefs.diagnostics,
    session_replay: prefs.diagnostics,
  }
}

async function persistConsents(
  prefs: OptionalPreferences,
  mode: 'toggle' | 'save',
  toggled?: { analytics?: boolean; diagnostics?: boolean }
) {
  const sessionId = getOrCreateAnonymousSessionId()

  if (mode === 'toggle' && toggled) {
    const consents: ConsentType[] = []
    let action: 'grant' | 'withdraw' = 'grant'

    if (toggled.analytics !== undefined) {
      consents.push('analytics')
      action = toggled.analytics ? 'grant' : 'withdraw'
    } else if (toggled.diagnostics !== undefined) {
      consents.push(...DIAGNOSTICS_CONSENTS)
      action = toggled.diagnostics ? 'grant' : 'withdraw'
    }

    if (consents.length === 0) return

    const response = await fetch('/api/privacy/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consents,
        action,
        sessionId: sessionId || undefined,
      }),
    })
    if (!response.ok) {
      console.error('Failed to save consent to server')
    }
    return
  }

  const granted: ConsentType[] = []
  const withdrawn: ConsentType[] = []

  NON_ESSENTIAL_CONSENTS.forEach((type) => {
    const on =
      type === 'analytics' ? prefs.analytics : prefs.diagnostics
    if (on) granted.push(type)
    else withdrawn.push(type)
  })

  if (granted.length > 0) {
    await fetch('/api/privacy/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consents: granted,
        action: 'grant',
        sessionId: sessionId || undefined,
      }),
    })
  }

  if (withdrawn.length > 0) {
    await fetch('/api/privacy/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consents: withdrawn,
        action: 'withdraw',
        sessionId: sessionId || undefined,
      }),
    })
  }
}

export function CookiePreferenceCenter({
  locale = 'en',
  onClose,
  consentBaseline = 'from_storage',
}: CookiePreferenceCenterProps) {
  const appearance = useCookieConsentAppearance()
  const [preferences, setPreferences] = useState<OptionalPreferences>({
    ...DEFAULT_PREFERENCES,
  })
  const t = copy[locale]

  useEffect(() => {
    if (consentBaseline === 'customize_first_visit') {
      setPreferences({ ...DEFAULT_PREFERENCES })
      return
    }
    const existing = getClientConsents()
    if (existing) {
      setPreferences({
        analytics: Boolean(existing.analytics),
        diagnostics: Boolean(existing.error_tracking || existing.session_replay),
      })
    }
  }, [consentBaseline])

  const handleToggle = async (
    group: 'analytics' | 'diagnostics',
    value: boolean
  ) => {
    const updated =
      group === 'analytics'
        ? { ...preferences, analytics: value }
        : { ...preferences, diagnostics: value }

    setPreferences(updated)
    saveClientConsents(toStoragePrefs(updated))

    try {
      await persistConsents(updated, 'toggle', {
        [group]: value,
      })
    } catch (error) {
      console.error('Failed to save consent', error)
    }
  }

  const handleSave = async () => {
    saveClientConsents(toStoragePrefs(preferences))

    try {
      await persistConsents(preferences, 'save')
    } catch (error) {
      console.error('Failed to save consent', error)
    }

    onClose?.()
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[80] flex items-end justify-center p-2 sm:items-center sm:p-4',
        appearance.overlay
      )}
    >
      <Card
        className={cn(
          'flex w-full max-w-2xl flex-col overflow-hidden max-h-[calc(100dvh-0.75rem)] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl',
          appearance.panel
        )}
      >
        <CardHeader
          className={cn(
            'flex flex-shrink-0 flex-row items-center justify-between space-y-0 border-b pb-4',
            appearance.headerBorder
          )}
        >
          <div className="flex items-center gap-3">
            <Cookie className={cn('h-6 w-6', appearance.icon)} />
            <CardTitle
              className={cn(
                'text-xl font-bold tracking-tight sm:text-2xl',
                appearance.title
              )}
            >
              {t.title}
            </CardTitle>
          </div>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={cn('h-10 w-10 shrink-0 rounded-full p-0', appearance.closeBtn)}
              aria-label={t.close}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent
          className={cn(
            'flex-1 space-y-6 overflow-y-auto px-6 pb-6 pt-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent',
            appearance.scrollbar
          )}
        >
          <CardDescription className={appearance.body}>{t.intro}</CardDescription>

          <div
            className={cn(
              'flex items-start gap-3 rounded-2xl border p-4',
              appearance.rowMuted
            )}
          >
            <Info className={cn('mt-0.5 h-4 w-4 shrink-0', appearance.muted)} />
            <p className={cn('text-sm leading-relaxed', appearance.body)}>
              {t.essentialNote}
            </p>
          </div>

          <div
            className={cn(
              'flex items-start justify-between rounded-2xl border p-4',
              appearance.row
            )}
          >
            <div className="flex-1 pr-4">
              <Label
                className={cn('mb-2 block text-base font-semibold', appearance.title)}
              >
                {t.analytics.title}
              </Label>
              <p className={cn('text-sm leading-relaxed', appearance.body)}>
                {t.analytics.description}
              </p>
            </div>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(checked) => handleToggle('analytics', checked)}
            />
          </div>

          <div
            className={cn(
              'flex items-start justify-between rounded-2xl border p-4',
              appearance.row
            )}
          >
            <div className="flex-1 pr-4">
              <Label
                className={cn('mb-2 block text-base font-semibold', appearance.title)}
              >
                {t.diagnostics.title}
              </Label>
              <p className={cn('text-sm leading-relaxed', appearance.body)}>
                {t.diagnostics.description}
              </p>
            </div>
            <Switch
              checked={preferences.diagnostics}
              onCheckedChange={(checked) => handleToggle('diagnostics', checked)}
            />
          </div>
        </CardContent>
        <div
          className={cn(
            'flex flex-shrink-0 flex-col gap-3 border-t px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex-row',
            appearance.footer
          )}
        >
          <Button
            type="button"
            onClick={handleSave}
            className={cn('flex-1', appearance.primaryBtn)}
          >
            {t.save}
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={cn('w-full sm:w-auto', appearance.outlineBtn)}
            >
              {t.cancel}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
