/**
 * Client-side CSRF token utility
 * Fetches CSRF token from authenticated API endpoint (more secure than reading from cookie)
 */

// Cache token to avoid repeated API calls
let csrfTokenCache: { token: string | null; expiresAt: number } | null = null
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

/**
 * Get CSRF token from authenticated API endpoint
 * This is more secure than reading from cookie (prevents XSS attacks)
 */
export async function getCSRFToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null
  }

  // Check cache first
  if (csrfTokenCache && csrfTokenCache.expiresAt > Date.now()) {
    return csrfTokenCache.token
  }

  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include',
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      const token = data.token || null
      
      // Cache the token
      csrfTokenCache = {
        token,
        expiresAt: Date.now() + CACHE_TTL_MS
      }
      
      return token
    }
  } catch (error) {
    // Use console.error here as this is client-side code and safeLogger is server-only
    // This error is not sensitive and helps with debugging client-side CSRF issues
    console.error('[CSRF] Failed to fetch CSRF token:', error)
  }

  return null
}

/**
 * Create headers object with CSRF token for API requests
 * Note: This is now async because it fetches from API endpoint
 */
export async function getCSRFHeaders(): Promise<Record<string, string>> {
  const token = await getCSRFToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['x-csrf-token'] = token
  }

  return headers
}

