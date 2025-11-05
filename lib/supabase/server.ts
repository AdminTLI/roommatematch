import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

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
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-key',
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

export async function requireVerifiedUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { ok: false as const, status: 401 as const, user: null }
  }
  if (!user.email_confirmed_at) {
    return { ok: false as const, status: 403 as const, user: null }
  }
  return { ok: true as const, status: 200 as const, user }
}
