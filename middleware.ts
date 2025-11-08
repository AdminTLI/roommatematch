import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createCSRFTokenCookie, validateCSRFToken } from '@/lib/csrf'
import { checkRateLimit, getIPRateLimitKey } from '@/lib/rate-limit'
import { isFeatureEnabled } from '@/lib/feature-flags'

export async function middleware(req: NextRequest) {
  // Allow public routes without checks
  const publicPrefixes = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/callback',
    '/auth/verify-email',
    '/api/public',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ]

  const { pathname } = req.nextUrl
  const isApiRoute = pathname.startsWith('/api')
  const method = req.method.toUpperCase()

  // Handle API routes with CSRF and rate limiting
  if (isApiRoute) {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      // Rate limiting for POST/PUT/DELETE API routes
      const clientIp = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      const rateLimitKey = getIPRateLimitKey('api', clientIp)
      const rateLimitResult = await checkRateLimit('api', rateLimitKey)

      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }

      // CSRF validation for state-changing requests
      const isValidCSRF = await validateCSRFToken(req)
      if (!isValidCSRF) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        )
      }
    }

    // Continue to API route handler
    return NextResponse.next()
  }

  // Skip middleware for static assets and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    publicPrefixes.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next()
  }

  // Create a response we can modify cookies on
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Set CSRF token cookie for authenticated users
  if (user) {
    const csrfCookie = await createCSRFTokenCookie()
    // Set httpOnly cookie for server-side validation
    res.cookies.set(csrfCookie.httpOnlyCookie.name, csrfCookie.httpOnlyCookie.value, csrfCookie.httpOnlyCookie.options)
    // Also set non-httpOnly cookie so client can read it for header
    res.cookies.set('csrf-token-header', csrfCookie.exposedToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24
    })
  }

  if (user && !user.email_confirmed_at) {
    // Redirect unverified users to verify page and auto-trigger resend via query
    const url = req.nextUrl.clone()
    url.pathname = '/auth/verify-email'
    url.searchParams.set('auto', '1')
    return NextResponse.redirect(url)
  }

  // Feature flag gating for housing and move-in routes
  if (user) {
    if (pathname.startsWith('/housing') && !isFeatureEnabled('housing')) {
      // Allow admins to access even if feature is disabled
      const { data: adminRecord } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!adminRecord) {
        const url = req.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }

    if (pathname.startsWith('/move-in') && !isFeatureEnabled('move_in')) {
      // Allow admins to access even if feature is disabled
      const { data: adminRecord } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!adminRecord) {
        const url = req.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  // Verification gating for onboarding, matches and chat routes
  if (user) {
    const protectedRoutes = ['/onboarding', '/matches', '/chat']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (isProtectedRoute) {
      // Check if demo chat is allowed (only for matches/chat, not onboarding)
      const allowDemoChat = process.env.ALLOW_DEMO_CHAT === 'true'
      const isDemoUser = process.env.DEMO_USER_EMAIL && user.email === process.env.DEMO_USER_EMAIL
      const isOnboardingRoute = pathname.startsWith('/onboarding')
      
      // Onboarding always requires verification (no demo bypass)
      // Matches/chat can bypass if ALLOW_DEMO_CHAT is true
      if (isOnboardingRoute || (!allowDemoChat || !isDemoUser)) {
        // Check verification status
        const { data: profile } = await supabase
          .from('profiles')
          .select('verification_status')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profile && profile.verification_status !== 'verified') {
          const url = req.nextUrl.clone()
          url.pathname = '/verify'
          url.searchParams.set('redirect', pathname)
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (Next.js internals)
     * - static (static files)
     * - images (image files)
     * - favicon.ico, robots.txt, sitemap.xml (static assets)
     * - api routes are matched but handled separately in middleware
     */
    '/((?!_next|static|images|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}


