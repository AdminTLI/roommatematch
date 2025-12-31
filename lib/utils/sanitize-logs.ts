/**
 * PII (Personally Identifiable Information) Sanitization Utilities
 * 
 * These utilities help prevent sensitive data from being logged.
 * Use these functions to sanitize data before logging.
 */

/**
 * Sanitize email addresses for logging
 * Replaces email with a safe representation (e.g., u***@example.com)
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '[no email]'
  
  const [localPart, domain] = email.split('@')
  if (!domain) return '[invalid email]'
  
  // Show first character and last character of local part, mask the rest
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`
  }
  
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`
}

/**
 * Sanitize user ID for logging (shows first 8 chars only)
 */
export function sanitizeUserId(userId: string | null | undefined): string {
  if (!userId) return '[no user id]'
  return userId.substring(0, 8) + '...'
}

/**
 * Sanitize any string that might contain PII
 * Replaces middle portion with asterisks
 */
export function sanitizeString(value: string | null | undefined, maxVisible: number = 4): string {
  if (!value) return '[empty]'
  if (value.length <= maxVisible * 2) return '***'
  return value.substring(0, maxVisible) + '***' + value.substring(value.length - maxVisible)
}

/**
 * Sanitize an object by removing or masking sensitive fields
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[] = ['email', 'password', 'token', 'secret', 'api_key', 'apiKey', 'access_token', 'refresh_token']
): Partial<T> {
  const sanitized = { ...obj }
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      if (field === 'email') {
        sanitized[field] = sanitizeEmail(sanitized[field]) as any
      } else if (typeof sanitized[field] === 'string') {
        sanitized[field] = '[REDACTED]' as any
      } else {
        delete sanitized[field]
      }
    }
  }
  
  return sanitized
}

/**
 * Sanitize error objects that might contain sensitive data
 */
export function sanitizeError(error: Error | unknown): {
  message: string
  name?: string
  stack?: string
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      // Stack traces are generally safe but can be removed if needed
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    }
  }
  
  return {
    message: String(error)
  }
}













