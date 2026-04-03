import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { assertSupabaseRestProjectUrl } from '@/lib/supabase/assert-rest-project-url'

/**
 * Server Supabase clients use the same HTTPS project URL as the browser: PostgREST + Auth + Realtime over HTTP.
 * Transaction pooling (Supavisor, port 6543) applies to DATABASE_URL for direct Postgres only — not to supabase-js.
 */

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
    )
  }

  assertSupabaseRestProjectUrl(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL')

  return createServerClient(
    supabaseUrl,
    supabaseKey,
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
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
    )
  }

  assertSupabaseRestProjectUrl(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL')

  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for admin client
        },
      },
    }
  )
}

/**
 * Add timeout wrapper for long-running queries
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ])
}

export async function requireVerifiedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { ok: false as const, status: 401 as const, user: null }
  }
  if (!user.email_confirmed_at) {
    return { ok: false as const, status: 403 as const, user: null }
  }
  return { ok: true as const, status: 200 as const, user }
}
