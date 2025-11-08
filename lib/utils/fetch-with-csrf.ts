/**
 * CSRF-aware fetch wrapper
 * Automatically includes CSRF token from cookie in request headers
 */

/**
 * Get CSRF token from cookie
 */
function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf-token-header') {
      return decodeURIComponent(value)
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
  const token = getCSRFToken()
  
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

