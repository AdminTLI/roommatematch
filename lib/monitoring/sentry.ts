let Sentry: any = null

try {
  Sentry = require('@sentry/nextjs')
} catch {
  // Sentry not installed, will be handled gracefully
}

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development'

export function initSentry() {
  if (!Sentry) {
    console.warn('[Sentry] Package not available, skipping initialization')
    return
  }

  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured, skipping initialization')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    
    // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Capture unhandled promise rejections
    captureUnhandledRejections: true,
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (SENTRY_ENVIRONMENT === 'development' && !process.env.SENTRY_ENABLE_DEV) {
        return null
      }

      // Remove sensitive data from event
      if (event.request) {
        // Remove cookies and authorization headers
        if (event.request.headers) {
          delete event.request.headers.cookie
          delete event.request.headers.authorization
          delete event.request.headers['x-csrf-token']
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
  })

  console.log('[Sentry] Initialized successfully')
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (!Sentry || !SENTRY_DSN) return

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value)
      })
    }
    Sentry.captureException(error)
  })
}

export function captureMessage(message: string, level: any = 'info', context?: Record<string, any>) {
  if (!Sentry || !SENTRY_DSN) return

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value)
      })
    }
    Sentry.captureMessage(message, level)
  })
}

export function setUser(user: { id: string; email?: string; name?: string } | null) {
  if (!Sentry || !SENTRY_DSN) return

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : undefined,
      username: user.name
    })
  } else {
    Sentry.setUser(null)
  }
}

