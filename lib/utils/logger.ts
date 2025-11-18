/**
 * Production-safe logger utility
 * Only logs in development, errors always logged
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args)
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
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
