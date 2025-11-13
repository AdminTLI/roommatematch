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

interface CookiePreferenceCenterProps {
  locale?: 'en' | 'nl'
  onClose?: () => void
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

export function CookiePreferenceCenter({ locale = 'en', onClose }: CookiePreferenceCenterProps) {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    error_tracking: false,
    session_replay: false,
    marketing: false
  })

  useEffect(() => {
    // Load existing preferences
    const existing = getClientConsents()
    if (existing) {
      setPreferences({
        essential: existing.essential,
        analytics: existing.analytics,
        error_tracking: existing.error_tracking,
        session_replay: existing.session_replay,
        marketing: existing.marketing
      })
    }
  }, [])

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Cookie className="h-6 w-6 text-gray-600" />
            <CardTitle className="text-xl sm:text-2xl">
              {locale === 'nl' ? 'Cookie Voorkeuren' : 'Cookie Preferences'}
            </CardTitle>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto flex-1 pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <CardDescription>
            {locale === 'nl' 
              ? 'Beheer uw cookie voorkeuren. U kunt deze instellingen op elk moment wijzigen.'
              : 'Manage your cookie preferences. You can change these settings at any time.'}
          </CardDescription>

          {/* Essential Cookies */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-base font-semibold">{t.essential.title}</Label>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">{t.essential.description}</p>
            </div>
            <Switch
              checked={preferences.essential}
              disabled
              className="opacity-50"
            />
          </div>

          {/* Analytics */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1 pr-4">
              <Label className="text-base font-semibold mb-2 block">{t.analytics.title}</Label>
              <p className="text-sm text-gray-600">{t.analytics.description}</p>
            </div>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(checked) => handleToggle('analytics', checked)}
            />
          </div>

          {/* Error Tracking */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1 pr-4">
              <Label className="text-base font-semibold mb-2 block">{t.error_tracking.title}</Label>
              <p className="text-sm text-gray-600">{t.error_tracking.description}</p>
            </div>
            <Switch
              checked={preferences.error_tracking}
              onCheckedChange={(checked) => handleToggle('error_tracking', checked)}
            />
          </div>

          {/* Session Replay */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1 pr-4">
              <Label className="text-base font-semibold mb-2 block">{t.session_replay.title}</Label>
              <p className="text-sm text-gray-600">{t.session_replay.description}</p>
            </div>
            <Switch
              checked={preferences.session_replay}
              onCheckedChange={(checked) => handleToggle('session_replay', checked)}
            />
          </div>

          {/* Marketing */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1 pr-4">
              <Label className="text-base font-semibold mb-2 block">{t.marketing.title}</Label>
              <p className="text-sm text-gray-600">{t.marketing.description}</p>
            </div>
            <Switch
              checked={preferences.marketing}
              onCheckedChange={(checked) => handleToggle('marketing', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t flex-shrink-0">
            <Button
              onClick={handleSave}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white"
            >
              {locale === 'nl' ? 'Voorkeuren Opslaan' : 'Save Preferences'}
            </Button>
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                {locale === 'nl' ? 'Annuleren' : 'Cancel'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

