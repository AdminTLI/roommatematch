import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api') || // APIs enforce auth separately
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

  if (user && !user.email_confirmed_at) {
    // Redirect unverified users to verify page and auto-trigger resend via query
    const url = req.nextUrl.clone()
    url.pathname = '/auth/verify-email'
    url.searchParams.set('auto', '1')
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next|static|images|favicon.ico|robots.txt|sitemap.xml|api|auth/verify-email|auth/sign-in|auth/sign-up|auth/callback).*)',
  ],
}


