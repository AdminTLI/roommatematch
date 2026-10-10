/**
 * CSRF-aware fetch wrapper
 * Automatically includes CSRF token from cookie in request headers
 */

const CSRF_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

let cachedCsrfToken: string | null = null
let cachedCsrfExpiresAt = 0
let csrfFetchInFlight: Promise<string | null> | null = null

function getCachedCsrfToken(): string | null {
  if (cachedCsrfToken && Date.now() < cachedCsrfExpiresAt) {
    return cachedCsrfToken
  }
  return null
}

function setCachedCsrfToken(token: string | null) {
  cachedCsrfToken = token
  cachedCsrfExpiresAt = token ? Date.now() + CSRF_CACHE_TTL_MS : 0
}

/** Clear cached token after CSRF validation failures so the next call refetches. */
export function invalidateCsrfTokenCache() {
  setCachedCsrfToken(null)
}

/**
 * Get CSRF token from authenticated API endpoint
 * This is more secure than reading from cookie (prevents XSS attacks)
 * Includes retry logic for transient failures and a short-lived in-memory cache
 */
export async function getCSRFToken(retries = 2): Promise<string | null> {
  if (typeof window === 'undefined') return null

  const cached = getCachedCsrfToken()
  if (cached) return cached

  if (csrfFetchInFlight) {
    return csrfFetchInFlight
  }

  csrfFetchInFlight = (async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch('/api/csrf-token', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })

        if (response.ok) {
          try {
            const data = await response.json()
            if (data.token) {
              setCachedCsrfToken(data.token)
              return data.token
            }
          } catch (jsonError) {
            console.error('[CSRF] Failed to parse CSRF token response:', jsonError)
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
              continue
            }
          }
        } else if (response.status === 401) {
          // User not authenticated - can't get CSRF token
          return null
        } else {
          if (response.status >= 400 && response.status < 500) {
            console.warn(`[CSRF] CSRF token endpoint returned ${response.status}`)
            return null
          }
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
            continue
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const isNetworkError = error instanceof TypeError && errorMessage === 'Failed to fetch'

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
          continue
        }

        if (isNetworkError) {
          console.warn('[CSRF] Network error fetching CSRF token (may be offline or server unreachable):', errorMessage)
        } else {
          console.error('[CSRF] Failed to fetch CSRF token after retries:', {
            error: errorMessage,
            errorType: error instanceof Error ? error.constructor.name : typeof error
          })
        }
      }
    }

    return null
  })()

  try {
    return await csrfFetchInFlight
  } finally {
    csrfFetchInFlight = null
  }
}

async function isCsrfFailure(response: Response): Promise<boolean> {
  if (response.status !== 403) return false
  try {
    const errorData = await response.clone().json()
    const message = typeof errorData?.error === 'string' ? errorData.error : ''
    return message === 'Invalid CSRF token' || message.includes('CSRF')
  } catch {
    return false
  }
}

/**
 * Fetch with CSRF token automatically included
 * Handles CSRF token failures gracefully with a single automatic retry
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const isStateChanging = options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())

  try {
    const performRequest = async (forceRefreshToken: boolean) => {
      let token: string | null = null

      if (isStateChanging) {
        if (forceRefreshToken) {
          invalidateCsrfTokenCache()
        }

        token = await getCSRFToken()

        // If we couldn't get a token, try one more time after a short delay
        // This handles cases where the cookie might not be set yet
        if (!token) {
          await new Promise(resolve => setTimeout(resolve, 100))
          token = await getCSRFToken()
        }
      }

      const headers = new Headers(options.headers)

      if (token && isStateChanging) {
        headers.set('x-csrf-token', token)
      }

      return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })
    }

    let response = await performRequest(false)

    // Stale client cache vs rotated cookie: refresh token and retry once
    if (isStateChanging && (await isCsrfFailure(response))) {
      console.warn('[fetchWithCSRF] CSRF token validation failed, retrying with a fresh token')
      response = await performRequest(true)
    }

    return response
  } catch (error) {
    // Handle network errors, CORS errors, etc.
    // Re-throw with more context
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      // Network error - could be offline, CORS, or server unreachable
      console.error('[fetchWithCSRF] Network error:', {
        url,
        method: options.method || 'GET',
        error: error instanceof Error ? error.message : String(error)
      })
      throw new Error(`Network error: Unable to reach ${url}. Please check your connection.`)
    }
    throw error
  }
}
