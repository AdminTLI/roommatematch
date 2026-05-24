/**
 * Dev-only mock token for previewing /unsubscribe without signing in.
 * Never accepted in production.
 */

export const DEV_UNSUBSCRIBE_MOCK_TOKEN = 'dev-mock-unsubscribe-preview'

export function isDevUnsubscribeMockEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV
}

export function isDevUnsubscribeMockToken(token: string | null | undefined): boolean {
  return isDevUnsubscribeMockEnabled() && token === DEV_UNSUBSCRIBE_MOCK_TOKEN
}

const DEFAULT = {
  emailMatches: true,
  emailMessages: true,
  emailUpdates: true,
  pushMatches: true,
  pushMessages: true,
}

/** In-memory prefs for mock mode (resets on server restart). */
let mockPreferences = { ...DEFAULT }

export function getDevMockUnsubscribeState() {
  return {
    email: 'preview.user@example.com',
    firstName: 'Alex',
    preferences: { ...mockPreferences },
  }
}

export function setDevMockUnsubscribePreferences(prefs: typeof DEFAULT) {
  mockPreferences = { ...prefs }
  return mockPreferences
}
