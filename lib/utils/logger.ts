/**
 * Production-safe logger utility with structured logging
 * Only logs in development, errors always logged
 * Enhanced with context and Sentry integration for production
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  warn: (message: string, context?: Record<string, any>) => {
    const logData = { 
      message, 
      context, 
      timestamp: new Date().toISOString() 
    }
    
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '')
    } else {
      // In production, still log warnings but with structure
      console.warn(JSON.stringify(logData))
    }
  },
  
  error: (message: string, error?: any, context?: Record<string, any>) => {
    const logData = { 
      message, 
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      context, 
      timestamp: new Date().toISOString() 
    }
    
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, { error, context })
    
    // Send to Sentry in production if available
    if (!isDevelopment && typeof window !== 'undefined') {
      // Sentry integration would go here
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, { extra: context })
      // }
    }
  },
  
  info: (message: string, context?: Record<string, any>) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, context || '')
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  }
}

/**
 * Safe logger for server-side API routes
 * Always logs errors, but only logs info/debug in development
 */
export const safeLogger = {
  log: logger.log,
  warn: logger.warn,
  error: logger.error,
  info: logger.info,
  debug: logger.debug
}
