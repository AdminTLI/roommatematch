/**
 * CSRF-aware fetch wrapper
 * Automatically includes CSRF token from cookie in request headers
 */

/**
 * Get CSRF token from authenticated API endpoint
 * This is more secure than reading from cookie (prevents XSS attacks)
 * Includes retry logic for transient failures
 */
async function getCSRFToken(retries = 2): Promise<string | null> {
  if (typeof window === 'undefined') return null
  
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
            return data.token
          }
        } catch (jsonError) {
          console.error('[CSRF] Failed to parse CSRF token response:', jsonError)
          // If not the last attempt, retry
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
            continue
          }
        }
      } else if (response.status === 401) {
        // User not authenticated - can't get CSRF token
        // This is expected for unauthenticated users, don't log as error
        return null
      } else {
        // Other HTTP errors - log but don't retry for 4xx errors
        if (response.status >= 400 && response.status < 500) {
          console.warn(`[CSRF] CSRF token endpoint returned ${response.status}`)
          return null
        }
        // For 5xx errors, retry if not last attempt
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
          continue
        }
      }
    } catch (error) {
      // Network errors, CORS errors, etc.
      const errorMessage = error instanceof Error ? error.message : String(error)
      const isNetworkError = error instanceof TypeError && errorMessage === 'Failed to fetch'
      
      // If not the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
        continue
      }
      
      // Only log error on final attempt to avoid spam
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
}

/**
 * Fetch with CSRF token automatically included
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const token = await getCSRFToken()
    
    const headers = new Headers(options.headers)
    
    // Only add CSRF token for state-changing requests
    if (token && options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
      headers.set('x-csrf-token', token)
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies
    })
    
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








