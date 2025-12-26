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
    const { data: { session } } = await supabase.auth.getSession()
    
    // Log all parameters for debugging
    console.log('[Auth Callback] Parameters:', {
      type,
      redirectTo,
      hasCode: !!code,
      hasSession: !!session,
      url: requestUrl.toString()
    })

    // Check if this is a password reset flow
    // Supabase automatically adds type=recovery to password reset email links
    // Also check redirectTo as fallback in case type parameter is missing
    // Additionally, check if the URL contains recovery-related parameters
    const isPasswordReset = 
      type === 'recovery' || 
      redirectTo?.includes('reset-password') ||
      requestUrl.searchParams.toString().includes('recovery') ||
      requestUrl.searchParams.toString().includes('reset')

    if (isPasswordReset) {
      // Always redirect to the confirm page for password reset
      const confirmUrl = `${requestUrl.origin}/auth/reset-password/confirm`
      console.log('[Auth Callback] Password reset detected, redirecting to:', confirmUrl, {
        detectedBy: type === 'recovery' ? 'type parameter' : redirectTo?.includes('reset-password') ? 'redirectTo parameter' : 'URL search params'
      })
      return NextResponse.redirect(confirmUrl)
    }

    // If there's a redirect parameter, use it (for other flows like email verification)
    if (redirectTo) {
      const redirectUrl = redirectTo.startsWith('http') ? redirectTo : `${requestUrl.origin}${redirectTo}`
      console.log('Redirecting to:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Default redirect after sign up process completes
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}