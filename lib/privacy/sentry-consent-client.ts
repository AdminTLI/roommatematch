/**
 * Consent-aware Sentry client lifecycle.
 * Sentry is dynamically imported so marketing pages do not pay for the SDK
 * on the LCP / TBT critical path.
 */

import type { Integration } from '@sentry/core'
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
let sentryActive = false

async function loadSentry() {
  return import('@sentry/nextjs')
}

async function buildInitOptions(): Promise<
  Parameters<Awaited<ReturnType<typeof loadSentry>>['init']>[0]
> {
  const Sentry = await loadSentry()
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
 * Returns true when a client is (or remains) active.
 */
export async function syncSentryWithConsent(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!isClientSentryEnabled || !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return false
  }

  if (syncInFlight) {
    await syncInFlight
    return sentryActive
  }

  syncInFlight = (async () => {
    const wantsTracking = hasErrorTrackingConsent()

    if (!wantsTracking) {
      // Do not download the SDK just to discover there is nothing to tear down.
      if (sentryActive) {
        const Sentry = await loadSentry()
        if (Sentry.getClient()) {
          await Sentry.close(2000)
        }
        sentryActive = false
      }
      return
    }

    const Sentry = await loadSentry()
    if (Sentry.getClient()) {
      await Sentry.close(2000)
    }
    Sentry.init(await buildInitOptions())
    sentryActive = true
  })().finally(() => {
    syncInFlight = null
  })

  await syncInFlight
  return sentryActive
}

/**
 * Listen for same-tab consent updates (and run an initial sync).
 * Returns whether Sentry is active after the initial pass.
 */
export async function installSentryConsentListener(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  if (!listenerInstalled) {
    listenerInstalled = true
    window.addEventListener('consent-changed', () => {
      void syncSentryWithConsent().catch(() => {})
    })
  }

  // Skip the SDK download entirely until consent exists (or is granted later).
  if (!hasErrorTrackingConsent()) {
    return false
  }

  return syncSentryWithConsent().catch(() => false)
}
