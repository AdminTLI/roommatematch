/**
 * Consent-aware Sentry client lifecycle.
 * Allows granting/withdrawing error tracking without a full page reload.
 */

import type { Integration } from '@sentry/core'
import * as Sentry from '@sentry/nextjs'
import { getClientConsents } from '@/lib/privacy/cookie-consent-client'

const isClientSentryEnabled =
  process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_CLIENT_SENTRY === 'true'

function hasErrorTrackingConsent(): boolean {
  const consents = getClientConsents()
  return consents?.error_tracking === true
}

function hasSessionReplayConsent(): boolean {
  const consents = getClientConsents()
  return consents?.session_replay === true
}

function hasPIIConsent(): boolean {
  return hasErrorTrackingConsent()
}

let syncInFlight: Promise<void> | null = null
let listenerInstalled = false

function buildInitOptions(): Parameters<typeof Sentry.init>[0] {
  const integrations: Integration[] = [
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
  ]

  if (hasSessionReplayConsent()) {
    integrations.push(Sentry.replayIntegration())
  }

  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    integrations,
    enableLogs: true,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: false,
    beforeSend(event) {
      if (
        process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'development' &&
        !process.env.SENTRY_ENABLE_DEV
      ) {
        return null
      }

      if (event.request?.headers) {
        delete event.request.headers.cookie
        delete event.request.headers.authorization
        delete event.request.headers['x-csrf-token']
        delete event.request.headers['x-admin-secret']
      }

      if (event.user) {
        if (hasPIIConsent()) {
          event.user = {
            id: event.user.id,
            email: event.user.email
              ? event.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
              : undefined,
          }
        } else {
          delete event.user.email
          delete event.user.username
          delete event.user.ip_address
        }
      }

      return event
    },
    ignoreErrors: [
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'atomicFindClose',
      'fb_xd_fragment',
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      'NetworkError',
      'Network request failed',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],
    denyUrls: [/extensions\//i, /^chrome:\/\//i, /^chrome-extension:\/\//i],
    replaysSessionSampleRate: hasSessionReplayConsent() ? 0.1 : 0,
    replaysOnErrorSampleRate: hasSessionReplayConsent() ? 1.0 : 0,
    sendDefaultPii: hasPIIConsent(),
  }
}

/**
 * Init or tear down the browser Sentry client to match current consent.
 */
export async function syncSentryWithConsent(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!isClientSentryEnabled || !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return
  }

  if (syncInFlight) {
    return syncInFlight
  }

  syncInFlight = (async () => {
    const wantsTracking = hasErrorTrackingConsent()
    const client = Sentry.getClient()

    if (!wantsTracking) {
      if (client) {
        await Sentry.close(2000)
      }
      return
    }

    // Re-init when already running so replay / PII options match latest consent.
    if (client) {
      await Sentry.close(2000)
    }

    Sentry.init(buildInitOptions())
  })().finally(() => {
    syncInFlight = null
  })

  return syncInFlight
}

/** Listen for same-tab consent updates (and run an initial sync). */
export function installSentryConsentListener(): void {
  if (typeof window === 'undefined' || listenerInstalled) return
  listenerInstalled = true

  void syncSentryWithConsent().catch(() => {
    // Non-fatal: consent sync must not break the page
  })

  window.addEventListener('consent-changed', () => {
    void syncSentryWithConsent().catch(() => {})
  })
}
