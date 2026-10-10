/**
 * Client-side CSRF token utility
 * Fetches CSRF token from authenticated API endpoint (more secure than reading from cookie)
 *
 * Shares cache with fetch-with-csrf so header tokens stay consistent across call sites.
 */

import {
  getCSRFToken as getSharedCSRFToken,
  invalidateCsrfTokenCache,
} from '@/lib/utils/fetch-with-csrf'

/**
 * Get CSRF token from authenticated API endpoint
 * This is more secure than reading from cookie (prevents XSS attacks)
 */
export async function getCSRFToken(): Promise<string | null> {
  return getSharedCSRFToken()
}

export { invalidateCsrfTokenCache }

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
