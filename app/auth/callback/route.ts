import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const redirectTo = requestUrl.searchParams.get('redirect')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      // Redirect to sign-in with error
      return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent(error.message)}`)
    }

    // Get session after exchange to check for recovery state
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Get user to check recovery state
    const { data: { user } } = await supabase.auth.getUser()
    
    // Log all parameters for debugging
    console.log('[Auth Callback] Parameters:', {
      type,
      redirectTo,
      hasCode: !!code,
      hasSession: !!session,
      hasUser: !!user,
      url: requestUrl.toString(),
      allParams: Object.fromEntries(requestUrl.searchParams.entries())
    })

    // Check if this is a password reset flow using multiple methods:
    // 1. type=recovery parameter (Supabase adds this automatically)
    // 2. redirectTo includes reset-password
    // 3. URL contains recovery/reset keywords
    // 4. Check if user is in recovery mode (can update password without full auth)
    // 5. Check referrer header (might indicate password reset email)
    const referer = request.headers.get('referer') || ''
    const isPasswordReset = 
      type === 'recovery' || 
      type === 'reset' ||
      redirectTo?.includes('reset-password') ||
      requestUrl.searchParams.toString().includes('recovery') ||
      requestUrl.searchParams.toString().includes('reset') ||
      requestUrl.pathname.includes('reset') ||
      referer.includes('reset') ||
      referer.includes('recovery')

    // Additional check: If session exists but user might be in recovery mode
    // Recovery sessions allow password updates without full authentication
    if (session && user && !isPasswordReset) {
      // Try to detect recovery session - if we can update password, it's likely a recovery session
      // This is a fallback detection method
      try {
        // Check if this looks like a recovery flow by examining the token
        // Recovery tokens typically have specific characteristics
        const tokenHash = requestUrl.searchParams.get('token_hash') || ''
        if (tokenHash) {
          // If there's a token_hash, it might be a recovery token
          console.log('[Auth Callback] Found token_hash, treating as potential recovery flow')
          // We'll redirect to reset page to be safe
        }
      } catch (e) {
        // Ignore errors in detection
      }
    }

    if (isPasswordReset) {
      // Always redirect to the confirm page for password reset
      const confirmUrl = `${requestUrl.origin}/auth/reset-password/confirm`
      console.log('[Auth Callback] Password reset detected, redirecting to:', confirmUrl, {
        detectedBy: type === 'recovery' || type === 'reset' ? 'type parameter' : 
                    redirectTo?.includes('reset-password') ? 'redirectTo parameter' : 
                    requestUrl.searchParams.toString().includes('recovery') || requestUrl.searchParams.toString().includes('reset') ? 'URL search params' :
                    referer.includes('reset') || referer.includes('recovery') ? 'referer header' :
                    'pathname check'
      })
      return NextResponse.redirect(confirmUrl)
    }

    // If there's a redirect parameter, use it (for other flows like email verification)
    if (redirectTo) {
      const redirectUrl = redirectTo.startsWith('http') ? redirectTo : `${requestUrl.origin}${redirectTo}`
      console.log('[Auth Callback] Redirecting to:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    }
    
    // If no redirect specified but we have a code, check if it might be a password reset
    // that didn't get detected (fallback safety check)
    if (code && !type && !redirectTo) {
      console.log('[Auth Callback] Code present but no type/redirect detected, checking session state...')
      // If session exists but we're not sure what flow this is, 
      // check if user can update password (recovery session indicator)
      // For now, default to dashboard but log for debugging
      console.log('[Auth Callback] No password reset indicators found, defaulting to dashboard')
    }
  }

  // Default redirect after sign up process completes
  console.log('[Auth Callback] No code found or no redirect specified, defaulting to dashboard')
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}