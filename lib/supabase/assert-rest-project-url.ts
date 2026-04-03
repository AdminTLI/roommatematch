/**
 * Ensures env values used with @supabase/ssr / supabase-js are HTTP API base URLs,
 * not postgres:// connection strings (direct DB or Supavisor :6543).
 */
export function assertSupabaseRestProjectUrl(url: string, envName: string) {
  const u = url.trim().toLowerCase()
  if (u.startsWith('postgres://') || u.startsWith('postgresql://')) {
    throw new Error(
      `${envName} must be the Supabase API URL (https://…supabase.co or local http), not a postgres:// pooler URL. Use DATABASE_URL for Supavisor (port 6543) with psql/migrations/Postgres drivers only.`
    )
  }
}
