/**
 * CSRF Middleware Helper for API Routes
 * Use this in API routes to validate CSRF tokens
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateCSRFToken } from './csrf'

/**
 * Middleware helper to validate CSRF token in API routes
 * Returns null if valid, or a 403 response if invalid
 */
export async function requireCSRFToken(request: NextRequest): Promise<NextResponse | null> {
  const method = request.method.toUpperCase()
  
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null
  }

  const isValid = await validateCSRFToken(request)
  
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    )
  }

  return null
}

