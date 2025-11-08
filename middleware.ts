import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createCSRFTokenCookie, validateCSRFToken } from '@/lib/csrf'
import { checkRateLimit, getIPRateLimitKey } from '@/lib/rate-limit'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { checkUserVerificationStatus, getVerificationRedirectUrl } from '@/lib/auth/verification-check'

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

  // Define protected routes that require full verification
  const protectedRoutes = [
    '/dashboard',
    '/settings',
    '/matches',
    '/chat',
    '/onboarding',
    '/forum',
    '/notifications',
    '/housing',
    '/move-in',
    '/reputation',
    '/safety',
  ]

  // Define routes that are always allowed (verification pages, auth pages)
  const allowedRoutes = [
    '/auth/verify-email',
    '/auth/sign-up',
    '/auth/sign-in',
    '/auth/callback',
    '/verify', // Persona verification page (will check email verification internally)
  ]

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route))

  // Enforce verification for authenticated users accessing protected routes
  if (user && isProtectedRoute && !isAllowedRoute) {
    const verificationStatus = await checkUserVerificationStatus(user)
    const redirectUrl = getVerificationRedirectUrl(verificationStatus)

    if (redirectUrl) {
      const url = req.nextUrl.clone()
      url.pathname = redirectUrl
      
      // Preserve email for verification page
      if (redirectUrl === '/auth/verify-email' && user.email) {
        url.searchParams.set('email', user.email)
        url.searchParams.set('auto', '1')
      }
      
      // Preserve redirect path for after verification
      if (redirectUrl === '/verify') {
        url.searchParams.set('redirect', pathname)
      }
      
      return NextResponse.redirect(url)
    }
  }

  // Gate /verify route - require email verification first (STRICT CHECK)
  if (user && pathname === '/verify') {
    // Use centralized verification check for consistency
    const verificationStatus = await checkUserVerificationStatus(user)
    
    // STRICT: If email is not verified, redirect immediately - no exceptions
    if (verificationStatus.needsEmailVerification) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/verify-email'
      if (user.email) {
        url.searchParams.set('email', user.email)
      }
      url.searchParams.set('auto', '1')
      return NextResponse.redirect(url)
    }

    // Double-check email_confirmed_at directly as well (defense in depth)
    const emailVerified = Boolean(
      user.email_confirmed_at &&
      typeof user.email_confirmed_at === 'string' &&
      user.email_confirmed_at.length > 0 &&
      !isNaN(Date.parse(user.email_confirmed_at))
    )

    if (!emailVerified) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/verify-email'
      if (user.email) {
        url.searchParams.set('email', user.email)
      }
      url.searchParams.set('auto', '1')
      return NextResponse.redirect(url)
    }
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


