/**
 * Cookie Consent Management - Client Side
 * 
 * Client-side functions for cookie consent management (localStorage)
 * This file is safe to import in client components
 */

export type ConsentType = 'essential' | 'analytics' | 'error_tracking' | 'session_replay' | 'marketing'
export type ConsentStatus = 'granted' | 'withdrawn' | 'pending'

// Consent categories that require opt-in (non-essential)
export const NON_ESSENTIAL_CONSENTS: ConsentType[] = [
  'analytics',
  'error_tracking',
  'session_replay',
  'marketing'
]

// Essential consents are always granted (required for site functionality)
export const ESSENTIAL_CONSENTS: ConsentType[] = ['essential']

/**
 * Client-side consent storage (for anonymous users)
 */
export const CONSENT_STORAGE_KEY = 'domu_consent_preferences'
export const CONSENT_VERSION = '1.0'

export interface ClientConsentPreferences {
  version: string
  essential: boolean
  analytics: boolean
  error_tracking: boolean
  session_replay: boolean
  marketing: boolean
  last_updated: string
}

/**
 * Get consent preferences from localStorage (client-side)
 */
export function getClientConsents(): ClientConsentPreferences | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) {
      return null
    }

    const preferences = JSON.parse(stored) as ClientConsentPreferences
    
    // Validate version
    if (preferences.version !== CONSENT_VERSION) {
      return null
    }

    return preferences
  } catch (error) {
    console.error('Failed to parse consent preferences', error)
    return null
  }
}

/**
 * Save consent preferences to localStorage (client-side)
 */
export function saveClientConsents(preferences: Partial<ClientConsentPreferences>): void {
  if (typeof window === 'undefined') {
    return
  }

  const existing = getClientConsents()
  const updated: ClientConsentPreferences = {
    version: CONSENT_VERSION,
    essential: true, // Always true
    analytics: preferences.analytics ?? existing?.analytics ?? false,
    error_tracking: preferences.error_tracking ?? existing?.error_tracking ?? false,
    session_replay: preferences.session_replay ?? existing?.session_replay ?? false,
    marketing: preferences.marketing ?? existing?.marketing ?? false,
    last_updated: new Date().toISOString()
  }

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save consent preferences', error)
  }
}

/**
 * Check if consent banner should be shown (client-side)
 */
export function shouldShowConsentBanner(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const preferences = getClientConsents()
  return preferences === null // Show banner if no preferences stored
}

