import type { SupabaseClient } from '@supabase/supabase-js'
import { hostProfileToListingIdentity } from '@/lib/host/display-name'

type HostIdentitySnapshot = {
  id: string
  display_name?: string | null
  company_name?: string | null
  phone?: string | null
  agency_license?: string | null
  kvk_number?: string | null
}

/**
 * Push host profile identity onto the host's listings.
 *
 * - Always refreshes listings whose landlord_name still matches the previous
 *   display name (or is empty) — those are denormalized copies, not overrides.
 * - When `forceAll` is true, updates every listing for the host (repair path).
 */
export async function syncHostListingsIdentity(
  admin: SupabaseClient,
  host: HostIdentitySnapshot,
  options?: {
    previousDisplayName?: string | null
    previousCompanyName?: string | null
    previousPhone?: string | null
    forceAll?: boolean
  }
): Promise<{ updated: number }> {
  const identity = hostProfileToListingIdentity(host)
  const now = new Date().toISOString()
  const patch = {
    ...identity,
    updated_at: now,
  }

  if (options?.forceAll) {
    const { data, error } = await admin
      .from('housing_listings')
      .update(patch)
      .eq('host_id', host.id)
      .select('id')
    if (error) throw error
    return { updated: data?.length ?? 0 }
  }

  const previousName = (options?.previousDisplayName || '').trim()
  const newName = identity.landlord_name

  // Fetch candidate listings and filter in app code so we can match null/old name
  // without fragile PostgREST or() escaping.
  const { data: listings, error: listError } = await admin
    .from('housing_listings')
    .select('id, landlord_name, agency_name, landlord_phone')
    .eq('host_id', host.id)
  if (listError) throw listError

  const idsToUpdate = (listings || [])
    .filter((row) => {
      const name = (row.landlord_name || '').trim()
      // Denormalized copy: empty, equals previous name, or already equals new name
      // but other identity fields may still be stale.
      const nameIsCopy =
        !name ||
        (previousName && name === previousName) ||
        name === newName

      if (!nameIsCopy) {
        // Intentional per-listing override — leave landlord_name alone, but we
        // still may refresh phone/company when those were copies.
        return false
      }
      return true
    })
    .map((row) => row.id)

  if (!idsToUpdate.length) return { updated: 0 }

  const { data, error } = await admin
    .from('housing_listings')
    .update(patch)
    .in('id', idsToUpdate)
    .select('id')
  if (error) throw error
  return { updated: data?.length ?? 0 }
}
