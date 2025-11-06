/**
 * Safe logging utility that redacts PII (Personally Identifiable Information)
 * to comply with GDPR and privacy regulations.
 */

const REDACTED = '[REDACTED]'

/**
 * Redacts user IDs from strings or objects
 */
function redactUserId(userId: string | undefined | null): string {
  if (!userId) return REDACTED
  // Show first 4 and last 4 chars for debugging, redact middle
  if (userId.length > 8) {
    return `${userId.slice(0, 4)}...${userId.slice(-4)}`
  }
  return REDACTED
}

/**
 * Redacts email addresses
 */
function redactEmail(email: string | undefined | null): string {
  if (!email) return REDACTED
  const [local, domain] = email.split('@')
  if (!domain) return REDACTED
  // Show first char and domain, redact rest
  return `${local?.[0] || ''}***@${domain}`
}

/**
 * Redacts names (first name, last name)
 */
function redactName(name: string | undefined | null): string {
  if (!name) return REDACTED
  if (name.length <= 2) return REDACTED
  // Show first char only
  return `${name[0]}***`
}

/**
 * Redacts phone numbers
 */
function redactPhone(phone: string | undefined | null): string {
  if (!phone) return REDACTED
  // Show last 4 digits only
  if (phone.length >= 4) {
    return `***${phone.slice(-4)}`
  }
  return REDACTED
}

/**
 * Recursively redacts PII from an object
 */
function redactObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    // Check if string looks like a UUID (user ID)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(obj)) {
      return redactUserId(obj)
    }
    // Check if string looks like an email
    if (obj.includes('@') && obj.includes('.')) {
      return redactEmail(obj)
    }
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(redactObject)
  }

  if (typeof obj === 'object') {
    const redacted: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase()
      
      // Redact common PII fields
      if (
        lowerKey.includes('user_id') ||
        lowerKey.includes('userid') ||
        lowerKey === 'id' ||
        lowerKey.includes('suggestion_id') ||
        lowerKey.includes('suggestionid')
      ) {
        redacted[key] = redactUserId(value as string)
      } else if (
        lowerKey.includes('email') ||
        lowerKey.includes('e_mail')
      ) {
        redacted[key] = redactEmail(value as string)
      } else if (
        lowerKey.includes('first_name') ||
        lowerKey.includes('firstname') ||
        lowerKey.includes('last_name') ||
        lowerKey.includes('lastname') ||
        lowerKey.includes('name') && !lowerKey.includes('username')
      ) {
        redacted[key] = redactName(value as string)
      } else if (
        lowerKey.includes('phone') ||
        lowerKey.includes('mobile')
      ) {
        redacted[key] = redactPhone(value as string)
      } else {
        redacted[key] = redactObject(value)
      }
    }
    return redacted
  }

  return obj
}

/**
 * Safe logger that redacts PII before logging
 */
export const safeLogger = {
  /**
   * Log info-level messages with PII redaction
   */
  info(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'production') {
      // In production, only log errors
      return
    }
    const redactedData = data ? redactObject(data) : undefined
    console.log(`[INFO] ${message}`, redactedData || '')
  },

  /**
   * Log error-level messages with PII redaction
   */
  error(message: string, error?: any): void {
    const redactedError = error ? redactObject(error) : undefined
    console.error(`[ERROR] ${message}`, redactedError || '')
  },

  /**
   * Log warning-level messages with PII redaction
   */
  warn(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'production') {
      // In production, only log errors
      return
    }
    const redactedData = data ? redactObject(data) : undefined
    console.warn(`[WARN] ${message}`, redactedData || '')
  },

  /**
   * Log debug-level messages with PII redaction (only in development)
   */
  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV !== 'development') {
      return
    }
    const redactedData = data ? redactObject(data) : undefined
    console.log(`[DEBUG] ${message}`, redactedData || '')
  },

  /**
   * Redact PII from any object (useful for custom logging)
   */
  redact: redactObject
}

