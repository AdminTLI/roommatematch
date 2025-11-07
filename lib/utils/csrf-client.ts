/**
 * Client-side CSRF token utility
 * Reads the CSRF token from the cookie set by middleware
 */

/**
 * Get CSRF token from document cookies
 * The middleware sets a 'csrf-token-header' cookie that the client can read
 */
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const token = document.cookie
    .split('; ')
    .find((c) => c.startsWith('csrf-token-header='))
    ?.split('=')[1]

  return token || null
}

/**
 * Create headers object with CSRF token for API requests
 */
export function getCSRFHeaders(): Record<string, string> {
  const token = getCSRFToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['x-csrf-token'] = token
  }

  return headers
}

