/**
 * Cookie Consent Management - Shared Types
 * 
 * Re-exports types and constants for backward compatibility
 * Client and server functions are now in separate files
 */

// Re-export types from client file
export type {
  ConsentType,
  ConsentStatus,
  ClientConsentPreferences
} from './cookie-consent-client'

export {
  NON_ESSENTIAL_CONSENTS,
  ESSENTIAL_CONSENTS,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  getClientConsents,
  saveClientConsents,
  shouldShowConsentBanner
} from './cookie-consent-client'

// Re-export server functions
export type { ConsentRecord } from './cookie-consent-server'
export {
  getUserConsents,
  grantConsent,
  withdrawConsent,
  grantMultipleConsents,
  withdrawAllConsents,
  hasConsent
} from './cookie-consent-server'

