import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCSRFTokenCookie, verifySignedToken } from '@/lib/csrf'

/**
 * GET /api/csrf-token
 * Returns CSRF token for authenticated users
 * Always ensures the CSRF cookie is set in the response to prevent validation failures
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get existing CSRF token from httpOnly cookie (set by middleware)
  const existingToken = request.cookies.get('csrf-token')?.value
  
  let signedToken: string
  let csrfCookie
  
  // Check if existing token is valid
  if (existingToken) {
    const isValid = await verifySignedToken(existingToken)
    if (isValid) {
      // Use existing valid token
      signedToken = existingToken
    } else {
      // Existing token is invalid - create a new one
      csrfCookie = await createCSRFTokenCookie()
      signedToken = csrfCookie.exposedToken
    }
  } else {
    // Create new token if none exists
    csrfCookie = await createCSRFTokenCookie()
    signedToken = csrfCookie.exposedToken
  }
  
  // Return full signed token in response body (client reads this, not cookie)
  // Client sends this in x-csrf-token header
  // Server validates header token matches httpOnly cookie token
  const response = NextResponse.json({ token: signedToken })
  
  // Always set the cookie in the response to ensure it's properly set
  // This fixes issues where the cookie might not be sent with subsequent requests
  if (csrfCookie) {
    // We created a new token - set it using the cookie structure
    response.cookies.set(
      csrfCookie.httpOnlyCookie.name,
      csrfCookie.httpOnlyCookie.value,
      csrfCookie.httpOnlyCookie.options
    )
  } else {
    // Use existing token but ensure cookie is set/refreshed
    // This ensures the cookie is properly set even if it was missing from the request
    // Use the same options as createCSRFTokenCookie for consistency
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    }
    response.cookies.set('csrf-token', signedToken, cookieOptions)
  }
  
  return response
}

