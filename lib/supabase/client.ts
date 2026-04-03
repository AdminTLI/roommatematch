import { createBrowserClient } from '@supabase/ssr'
import { assertSupabaseRestProjectUrl } from '@/lib/supabase/assert-rest-project-url'

/**
 * Browser-only Supabase client (@supabase/ssr).
 *
 * Must use the project REST/API URL (HTTPS `https://<ref>.supabase.co` or local `http://127.0.0.1:54321`).
 * Never use a Postgres/Supavisor connection string here — that is for DATABASE_URL (port 6543) and direct SQL only.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
    )
  }

  assertSupabaseRestProjectUrl(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL')

  return createBrowserClient(supabaseUrl, supabaseKey)
}
