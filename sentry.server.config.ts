// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

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
      // Keep only safe user data
      event.user = {
        id: event.user.id,
        email: event.user.email ? event.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : undefined
      }
    }

    return event
  },

  // Ignore certain errors
  ignoreErrors: [
    // Network errors that are not actionable
    'ECONNREFUSED',
    'ETIMEDOUT',
  ],
})

