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
        const data = await response.json()
        if (data.token) {
          return data.token
        }
      } else if (response.status === 401) {
        // User not authenticated - can't get CSRF token
        return null
      }
      
      // If not the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
      }
    } catch (error) {
      // If not the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
        continue
      }
      console.error('[CSRF] Failed to fetch CSRF token after retries:', error)
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
  const token = await getCSRFToken()
  
  const headers = new Headers(options.headers)
  
  // Only add CSRF token for state-changing requests
  if (token && options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
    headers.set('x-csrf-token', token)
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  })
}








