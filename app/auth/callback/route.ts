import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { signOutOtherSessions } from '@/lib/auth/sign-out-other-sessions'

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

    if (data.session) {
      await signOutOtherSessions(supabase)
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

    // Check if this is a password reset flow
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

    if (isPasswordReset) {
      // Always redirect to the confirm page for password reset
      // Use redirectTo if it's set and points to reset-password, otherwise use default
      let confirmUrl: string
      if (redirectTo && redirectTo.includes('reset-password')) {
        confirmUrl = redirectTo.startsWith('http') ? redirectTo : `${requestUrl.origin}${redirectTo}`
      } else {
        confirmUrl = `${requestUrl.origin}/auth/reset-password/confirm`
      }
      console.log('[Auth Callback] Password reset detected, redirecting to:', confirmUrl, {
        detectedBy: type === 'recovery' || type === 'reset' ? 'type parameter' : 
                    redirectTo?.includes('reset-password') ? 'redirectTo parameter' : 
                    requestUrl.searchParams.toString().includes('recovery') || requestUrl.searchParams.toString().includes('reset') ? 'URL search params' :
                    referer.includes('reset') || referer.includes('recovery') ? 'referer header' :
                    'pathname check'
      })
      return NextResponse.redirect(confirmUrl)
    }

    // Admin invite flow — land on institution onboarding (set password + profile)
    if (type === 'invite' || user?.user_metadata?.invited_role) {
      const inviteRedirect = redirectTo || '/institution/onboarding'
      const inviteUrl = inviteRedirect.startsWith('http')
        ? inviteRedirect
        : `${requestUrl.origin}${inviteRedirect}`
      console.log('[Auth Callback] Admin invite detected, redirecting to:', inviteUrl)
      return NextResponse.redirect(inviteUrl)
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