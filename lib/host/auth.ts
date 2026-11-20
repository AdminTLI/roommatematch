import { createAdminClient, createClient } from '@/lib/supabase/server'
import type { HostProfile } from './types'

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function getHostProfileForUser(userId: string): Promise<HostProfile | null> {
  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('host_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data as HostProfile
}

export async function requireHostProfile(): Promise<
  | { ok: true; userId: string; host: HostProfile }
  | { ok: false; status: number; error: string }
> {
  const userId = await getCurrentUserId()
  if (!userId) return { ok: false, status: 401, error: 'Unauthorized' }

  const host = await getHostProfileForUser(userId)
  if (!host) return { ok: false, status: 403, error: 'Host profile required' }

  return { ok: true, userId, host }
}

export async function assertListingOwnedByHost(
  listingId: string,
  hostId: string
): Promise<boolean> {
  const admin = await createAdminClient()
  const { data } = await admin
    .from('housing_listings')
    .select('id')
    .eq('id', listingId)
    .eq('host_id', hostId)
    .maybeSingle()
  return Boolean(data)
}
