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

  const csrfCookie = await createCSRFTokenCookie()
  const response = NextResponse.json({ token: csrfCookie.exposedToken })
  
  // Set both cookies
  response.cookies.set(
    csrfCookie.httpOnlyCookie.name,
    csrfCookie.httpOnlyCookie.value,
    csrfCookie.httpOnlyCookie.options
  )
  response.cookies.set('csrf-token-header', csrfCookie.exposedToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24
  })

  return response
}

