// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { getClientConsents } from '@/lib/privacy/cookie-consent'

/**
 * Check if user has consented to error tracking
 */
function hasErrorTrackingConsent(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const consents = getClientConsents()
  // If no consent preferences stored, default to false (opt-in)
  if (!consents) {
    return false
  }

  return consents.error_tracking === true
}

/**
 * Check if user has consented to session replay
 */
function hasSessionReplayConsent(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const consents = getClientConsents()
  // If no consent preferences stored, default to false (opt-in)
  if (!consents) {
    return false
  }

  return consents.session_replay === true
}

/**
 * Check if user has consented to sending PII
 */
function hasPIIConsent(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const consents = getClientConsents()
  // If no consent preferences stored, default to false (opt-in)
  if (!consents) {
    return false
  }

  // PII consent requires both error tracking and explicit consent
  return consents.error_tracking === true
}

// Only initialize Sentry if user has consented to error tracking
if (hasErrorTrackingConsent()) {
  const integrations: Sentry.Integration[] = []

  // Only add replay integration if user has consented
  if (hasSessionReplayConsent()) {
    integrations.push(Sentry.replayIntegration())
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://9b5230729711b3133aaa42487105a217@o4510329648906240.ingest.de.sentry.io/4510330161070160',
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

    // Add optional integrations for additional features
    integrations,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Capture unhandled promise rejections
    captureUnhandledRejections: true,

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'development' && !process.env.SENTRY_ENABLE_DEV) {
        return null
      }

      // Remove sensitive data from event
      if (event.request) {
        // Remove cookies and authorization headers
        if (event.request.headers) {
          delete event.request.headers.cookie
          delete event.request.headers.authorization
          delete event.request.headers['x-csrf-token']
          delete event.request.headers['x-admin-secret']
        }
      }

      // Remove sensitive data from user context
      if (event.user) {
        // Only include PII if user has explicitly consented
        if (hasPIIConsent()) {
          event.user = {
            id: event.user.id,
            email: event.user.email ? event.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : undefined
          }
        } else {
          // Remove all PII
          delete event.user.email
          delete event.user.username
          delete event.user.ip_address
        }
      }

      return event
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'atomicFindClose',
      'fb_xd_fragment',
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // Network errors that are not actionable
      'NetworkError',
      'Network request failed',
      // ResizeObserver errors
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications'
    ],

    // Filter out certain URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
    ],

    // Replay can be used to capture user interactions (only if consented)
    replaysSessionSampleRate: hasSessionReplayConsent() ? 0.1 : 0,
    replaysOnErrorSampleRate: hasSessionReplayConsent() ? 1.0 : 0,

    // Enable sending user PII only if user has explicitly consented
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: hasPIIConsent(),
  })
} else {
  // Sentry not initialized - user has not consented to error tracking
  console.log('[Sentry] Error tracking disabled - user has not consented')
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
