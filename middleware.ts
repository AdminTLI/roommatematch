import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createCSRFTokenCookie, validateCSRFToken } from '@/lib/csrf'
import { checkRateLimit, getIPRateLimitKey } from '@/lib/rate-limit'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { checkUserVerificationStatus, getVerificationRedirectUrl } from '@/lib/auth/verification-check'
import { safeLogger } from '@/lib/utils/logger'
import { createAdminClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

// In-memory cache for user lookups with TTL
interface CachedUser {
  user: User | null
  expiresAt: number
}

const userCache = new Map<string, CachedUser>()
const CACHE_TTL_MS = 60 * 1000 // 60 seconds

// Admin check cache (for feature flags) - 30 seconds TTL
interface CachedAdminCheck {
  isAdmin: boolean
  expiresAt: number
}

const adminCheckCache = new Map<string, CachedAdminCheck>()
const ADMIN_CACHE_TTL_MS = 30 * 1000 // 30 seconds

// CSRF token cache - only regenerate if missing or expired
const csrfTokenCache = new Map<string, { token: string; expiresAt: number }>()
const CSRF_CACHE_TTL_MS = 23 * 60 * 60 * 1000 // 23 hours (slightly less than 24h cookie)

// Helper to get cache key from request
function getCacheKey(req: NextRequest): string {
  // Use session cookie or auth header as cache key
  const sessionCookie = req.cookies.get('sb-access-token')?.value || 
                       req.cookies.get('sb-refresh-token')?.value ||
                       req.headers.get('authorization') ||
                       'anonymous'
  return sessionCookie
}

// Clean up expired cache entries periodically
if (typeof global !== 'undefined') {
  // Only run cleanup in Node.js environment
  setInterval(() => {
    const now = Date.now()
    for (const [key, cached] of userCache.entries()) {
      if (cached.expiresAt < now) {
        userCache.delete(key)
      }
    }
    for (const [key, cached] of adminCheckCache.entries()) {
      if (cached.expiresAt < now) {
        adminCheckCache.delete(key)
      }
    }
    for (const [key, cached] of csrfTokenCache.entries()) {
      if (cached.expiresAt < now) {
        csrfTokenCache.delete(key)
      }
    }
  }, 60000) // Clean up every minute
}

export async function middleware(req: NextRequest) {
  // Allow public routes without checks
  const publicPrefixes = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/callback',
    '/auth/verify-email',
    '/auth/reset-password',
    '/rent-calculator',
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
    // Rate limiting for auth endpoints (sign-in, sign-up)
    if (pathname === '/api/auth/sign-in' || pathname === '/api/auth/sign-up' || 
        pathname === '/auth/sign-in' || pathname === '/auth/sign-up') {
      const clientIp = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      const rateLimitKey = getIPRateLimitKey('auth', clientIp)
      const rateLimitResult = await checkRateLimit('auth', rateLimitKey)
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: 'Too many authentication attempts',
            retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': '10',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }
    }
    
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
      // Skip CSRF for verification endpoints that are called from Persona widget
      // These are authenticated via session cookie and Persona's own security
      // Also skip CSRF for public forms that don't require authentication
      // Skip CSRF for analytics tracking endpoint (read-only tracking, not state-changing)
      // Skip CSRF for resend-verification since users may not be fully authenticated yet
      const skipCSRFRoutes = [
        '/api/verification/persona-complete',
        '/api/verification/provider-webhook',
        '/api/verification/sync', // Repair sync for users with approved verification but out-of-sync profile
        '/api/careers/apply',
        '/api/universities/request-demo',
        '/api/analytics/track-event',
        '/api/admin/sync-updates', // Admin endpoint for syncing deployment updates
        '/api/auth/resend-verification' // Resend verification email (users may not be authenticated)
      ]
      // Normalize pathname (remove trailing slash) for consistent matching
      const normalizedPathname = pathname.replace(/\/$/, '')
      const shouldSkipCSRF = skipCSRFRoutes.some(route => 
        normalizedPathname === route || normalizedPathname.startsWith(route + '/')
      )

      if (shouldSkipCSRF) {
        // Log when skipping CSRF for debugging
        safeLogger.debug('[Middleware] Skipping CSRF check for:', normalizedPathname)
      } else {
        // Validate CSRF token for state-changing requests
        const isValidCSRF = await validateCSRFToken(req as any)
        if (!isValidCSRF) {
          const csrfHeader = req.headers.get('x-csrf-token')
          const csrfCookie = req.cookies.get('csrf-token')
          const csrfCookieValue = csrfCookie?.value || null
          console.warn('[Middleware] CSRF validation failed for:', pathname, {
            normalizedPathname,
            skipRoutes: skipCSRFRoutes,
            hasHeader: !!csrfHeader,
            hasCookie: !!csrfCookie,
            headerValue: csrfHeader && typeof csrfHeader === 'string' ? csrfHeader.substring(0, 10) + '...' : null,
            cookieValue: csrfCookieValue && typeof csrfCookieValue === 'string' ? csrfCookieValue.substring(0, 10) + '...' : null
          })
          return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403 }
          )
        }
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

  // Get user with caching
  const cacheKey = getCacheKey(req)
  const cachedUser = userCache.get(cacheKey)
  const now = Date.now()

  let user: User | null = null

  if (cachedUser && cachedUser.expiresAt > now) {
    // Cache hit
    user = cachedUser.user
  } else {
    // Cache miss - fetch user
    const { data } = await supabase.auth.getUser()
    user = data.user
    // Cache the result
    userCache.set(cacheKey, {
      user,
      expiresAt: now + CACHE_TTL_MS,
    })
  }

  // Set CSRF token cookie for authenticated users (only if missing or expired)
  if (user) {
    const csrfCacheKey = cacheKey
    const cachedCSRF = csrfTokenCache.get(csrfCacheKey)
    const csrfExpires = now + CSRF_CACHE_TTL_MS

    let csrfCookie
    
    if (cachedCSRF && cachedCSRF.expiresAt > now) {
      // Reuse existing token
      csrfCookie = {
        httpOnlyCookie: {
          name: 'csrf-token',
          value: cachedCSRF.token,
          options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const, // Changed from 'strict' to 'lax' for better compatibility
        maxAge: 60 * 60 * 24 // 24 hours
          }
        },
        exposedToken: cachedCSRF.token
      }
    } else {
      // Generate new token
      csrfCookie = await createCSRFTokenCookie()
      // Cache the token
      csrfTokenCache.set(csrfCacheKey, {
        token: csrfCookie.exposedToken,
        expiresAt: csrfExpires
      })
    }

    // Set httpOnly cookie for server-side validation only
    // Client should fetch token from /api/csrf-token endpoint (requires authentication)
    // This prevents XSS attacks from reading the CSRF token
    res.cookies.set(csrfCookie.httpOnlyCookie.name, csrfCookie.httpOnlyCookie.value, csrfCookie.httpOnlyCookie.options)
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
    '/auth/reset-password', // Password reset pages (both initial and confirm)
    '/verify', // Persona verification page (will check email verification internally)
  ]

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route))

  // CRITICAL: For authenticated users, ALWAYS check email verification first
  // This applies to ALL routes except auth pages and email verification page itself
  // Skip email verification check for password reset pages (users need to reset password even if email not verified)
  if (user && pathname !== '/auth/verify-email' && !pathname.startsWith('/auth/')) {
    // Check email verification FIRST before anything else
    const emailVerified = Boolean(
      user.email_confirmed_at &&
      typeof user.email_confirmed_at === 'string' &&
      user.email_confirmed_at.length > 0 &&
      !isNaN(Date.parse(user.email_confirmed_at)) &&
      new Date(user.email_confirmed_at).getTime() > 0
    )

    // If email is not verified, redirect to email verification IMMEDIATELY
    // This is the FIRST and MOST IMPORTANT check
    if (!emailVerified) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/verify-email'
      if (user.email) {
        url.searchParams.set('email', user.email)
      }
      url.searchParams.set('auto', '1')
      url.searchParams.set('reason', 'email_verification_required')
      // Preserve intended destination
      if (pathname !== '/verify') {
        url.searchParams.set('redirect', pathname)
      }
      return NextResponse.redirect(url)
    }
  }

  // Admin route protection - check before other protected routes
  if (user && pathname.startsWith('/admin')) {
    // Use admin client to bypass RLS for admin checks
    const adminClient = createAdminClient()
    
    // Check user_roles table first (primary source of truth)
    const { data: userRole, error: userRoleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (userRoleError) {
      safeLogger.warn('[Middleware] Error checking user_roles', { error: userRoleError.message })
    }
    
    const role = userRole?.role as string | undefined
    const isAdminOrSuperAdmin = role === 'admin' || role === 'super_admin'
    
    // Fallback: Check admins table for backward compatibility (any admin role grants access)
    const { data: adminRecord, error: adminError } = await adminClient
      .from('admins')
      .select('id, role')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (adminError) {
      safeLogger.warn('[Middleware] Error checking admins table', { error: adminError.message })
    }
    
    const isAdminFromAdminsTable = !!adminRecord
    
    // Allow admins via metadata fallback if explicit admin row is missing (production convenience)
    const isMetadataAdmin = !!user?.user_metadata?.role && (
      String(user.user_metadata.role).toLowerCase() === 'admin' || 
      String(user.user_metadata.role).toLowerCase() === 'super_admin'
    )
    
    if (!isAdminOrSuperAdmin && !isAdminFromAdminsTable && !isMetadataAdmin) {
      // Not an admin - redirect to dashboard
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('reason', 'admin_access_denied')
      safeLogger.warn('[Middleware] Non-admin user attempted to access admin route', {
        userId: user.id,
        path: pathname,
        userRole: role || 'none',
        hasAdminRecord: !!adminRecord,
        adminRecordRole: adminRecord?.role || 'none',
        metadataRole: user?.user_metadata?.role || 'none',
        userRoleError: userRoleError?.message,
        adminError: adminError?.message
      })
      return NextResponse.redirect(url)
    }
  }

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
        url.searchParams.set('reason', verificationStatus.needsEmailVerification 
          ? 'email_verification_required' 
          : 'verification_required')
      }
      
      // Preserve redirect path for after verification
      if (redirectUrl === '/verify') {
        url.searchParams.set('redirect', pathname)
        url.searchParams.set('reason', verificationStatus.needsPersonaVerification 
          ? 'persona_verification_required' 
          : 'verification_required')
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
      url.searchParams.set('reason', 'email_verification_required')
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
  // Only check admin status for routes that need it
  if (user && (pathname.startsWith('/housing') || pathname.startsWith('/move-in'))) {
    // Check if feature is enabled
    const featureKey = pathname.startsWith('/housing') ? 'housing' : 'move_in'
    const isFeatureEnabledValue = isFeatureEnabled(featureKey)

    if (!isFeatureEnabledValue) {
      // Feature is disabled - check if user is admin (with caching)
      const adminCacheKey = `${user.id}-${featureKey}`
      const cachedAdmin = adminCheckCache.get(adminCacheKey)
      let isAdmin = false

      if (cachedAdmin && cachedAdmin.expiresAt > now) {
        // Cache hit
        isAdmin = cachedAdmin.isAdmin
      } else {
        // Cache miss - check admin status
        const { data: adminRecord } = await supabase
          .from('admins')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        isAdmin = !!adminRecord
        // Cache the result
        adminCheckCache.set(adminCacheKey, {
          isAdmin,
          expiresAt: now + ADMIN_CACHE_TTL_MS,
        })
      }

      if (!isAdmin) {
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


