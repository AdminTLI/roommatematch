import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCSRFTokenCookie } from '@/lib/csrf'

/**
 * GET /api/csrf-token
 * Returns CSRF token for authenticated users
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get existing CSRF token from httpOnly cookie (set by middleware)
  // If not present, create a new one
  const existingToken = request.cookies.get('csrf-token')?.value
  
  let signedToken: string
  let csrfCookie
  
  if (existingToken) {
    // Use existing signed token from cookie
    // Client will send this in header, server validates it matches cookie
    signedToken = existingToken
  } else {
    // Create new token if none exists
    csrfCookie = await createCSRFTokenCookie()
    // Return the full signed token (token.signature format)
    signedToken = csrfCookie.exposedToken
  }
  
  // Return full signed token in response body (client reads this, not cookie)
  // Client sends this in x-csrf-token header
  // Server validates header token matches httpOnly cookie token
  // This is secure because:
  // 1. Requires authentication to access this endpoint
  // 2. httpOnly cookie cannot be read by XSS
  // 3. Token is only exposed to authenticated users
  const response = NextResponse.json({ token: signedToken })
  
  // Set httpOnly cookie if we created a new one
  if (csrfCookie) {
    response.cookies.set(
      csrfCookie.httpOnlyCookie.name,
      csrfCookie.httpOnlyCookie.value,
      csrfCookie.httpOnlyCookie.options
    )
  }
  
  return response
}

