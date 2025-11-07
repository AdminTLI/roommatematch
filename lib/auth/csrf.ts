/**
 * CSRF protection utilities
 * Validates Origin header to prevent cross-site request forgery attacks
 */

import { NextRequest } from 'next/server'

/**
 * Validates the Origin header matches the expected origin
 * Returns null if valid, or an error response if invalid
 */
export function validateOrigin(request: NextRequest): { error: string; status: number } | null {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Allow same-origin requests (no origin header for same-origin)
  if (!origin) {
    // For same-origin requests, check referer as fallback
    if (referer) {
      try {
        const refererUrl = new URL(referer)
        const host = request.headers.get('host')
        if (host && refererUrl.host === host) {
          return null // Valid same-origin request
        }
      } catch {
        // Invalid referer URL, but we'll allow it for same-origin requests
      }
    }
    // No origin and no referer (or invalid referer) - allow for same-origin
    return null
  }

  // Validate origin matches expected hosts
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, '').split('/')[0],
    process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '').split('/')[0],
    'localhost:3000',
    '127.0.0.1:3000'
  ].filter(Boolean) as string[]

  try {
    const originUrl = new URL(origin)
    const originHost = originUrl.host
    
    // Check if origin matches any allowed origin
    if (allowedOrigins.some(allowed => originHost === allowed || originHost.endsWith(`.${allowed}`))) {
      return null
    }
    
    // In production, be strict
    if (process.env.NODE_ENV === 'production') {
      return {
        error: 'Invalid origin',
        status: 403
      }
    }
    
    // In development, allow localhost variations
    if (originHost.includes('localhost') || originHost.includes('127.0.0.1')) {
      return null
    }
    
    return {
      error: 'Invalid origin',
      status: 403
    }
  } catch {
    return {
      error: 'Invalid origin format',
      status: 400
    }
  }
}

