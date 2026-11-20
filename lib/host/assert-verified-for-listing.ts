import { createAdminClient } from '@/lib/supabase/server'
import { isHostVerified } from './verification'

/**
 * Returns whether students may apply / book viewings / pin for this listing.
 */
export async function listingAllowsStudentActions(listingId: string): Promise<{
  ok: boolean
  hostVerified: boolean
  hostId?: string
  error?: string
}> {
  const admin = await createAdminClient()
  const { data: listing } = await admin
    .from('housing_listings')
    .select('id, status, moderation_status, host_id, host_profiles(id, email_verified, id_verified)')
    .eq('id', listingId)
    .maybeSingle()

  if (!listing) {
    return { ok: false, hostVerified: false, error: 'Listing not found' }
  }

  if (
    listing.status !== 'active' ||
    listing.moderation_status !== 'approved'
  ) {
    return {
      ok: false,
      hostVerified: false,
      error: 'listing_unavailable',
    }
  }

  const host = listing.host_profiles as
    | { id?: string; email_verified?: boolean; id_verified?: boolean }
    | null
    | Array<{ id?: string; email_verified?: boolean }>

  const hostRow = Array.isArray(host) ? host[0] : host
  const verified = isHostVerified(hostRow)

  return {
    ok: verified,
    hostVerified: verified,
    hostId: hostRow?.id,
    error: verified ? undefined : 'host_unverified',
  }
}
