// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

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

    return event
  },
})

