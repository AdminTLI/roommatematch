/**
 * CSRF-aware fetch wrapper
 * Automatically includes CSRF token from cookie in request headers
 */

/**
 * Get CSRF token from authenticated API endpoint
 * This is more secure than reading from cookie (prevents XSS attacks)
 */
async function getCSRFToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  
  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include',
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.token || null
    }
  } catch (error) {
    console.error('[CSRF] Failed to fetch CSRF token:', error)
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








