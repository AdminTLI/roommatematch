import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

type MiddlewareSupabase = ReturnType<typeof createServerClient>

/**
 * Request-scoped Supabase client for Next.js middleware.
 * Follows the official @supabase/ssr pattern: sync refreshed auth cookies to both
 * the in-flight request and the response so server + browser stay aligned.
 */
export function createMiddlewareSupabaseClient(request: NextRequest): {
  supabase: MiddlewareSupabase
  getResponse: () => NextResponse
} {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value)
            )
          }
        },
      },
    }
  )

  return {
    supabase,
    getResponse: () => supabaseResponse,
  }
}

/** Copy refreshed session cookies onto a redirect (or other) response. */
export function copySupabaseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie)
  })
}

export function redirectWithSupabaseSession(url: URL, sessionResponse: NextResponse) {
  const redirectRes = NextResponse.redirect(url)
  copySupabaseCookies(sessionResponse, redirectRes)
  return redirectRes
}

/**
 * Refresh the session via getClaims(), then load the user when claims exist.
 * getClaims() handles token refresh; getUser() reuses the refreshed session.
 */
export async function getMiddlewareAuthUser(supabase: MiddlewareSupabase): Promise<{
  user: User | null
  error: Error | null
}> {
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError) {
    return { user: null, error: claimsError }
  }

  if (!claimsData?.claims?.sub) {
    return { user: null, error: null }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  return { user, error: userError }
}
