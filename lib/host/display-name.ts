/**
 * Resolve the host name shown on student/admin housing surfaces.
 *
 * Live `host_profiles.display_name` (Host Settings) is the source of truth.
 * `housing_listings.landlord_name` is a denormalized copy kept in sync on
 * profile save for search/admin lists. Fall back to it only when the profile
 * name is missing.
 */
export function resolveListingHostDisplayName(options: {
  landlordName?: string | null
  hostDisplayName?: string | null
  agencyName?: string | null
  hostCompanyName?: string | null
}): string {
  const listingName = (options.landlordName || '').trim()
  const profileName = (options.hostDisplayName || '').trim()
  const agency =
    (options.hostCompanyName || '').trim() || (options.agencyName || '').trim()

  return profileName || listingName || agency || 'Host'
}

/** Fields denormalized onto housing_listings from host_profiles. */
export type HostListingIdentityFields = {
  landlord_name: string
  agency_name: string | null
  landlord_phone: string | null
  agency_license: string | null
}

export function hostProfileToListingIdentity(host: {
  display_name?: string | null
  company_name?: string | null
  phone?: string | null
  agency_license?: string | null
  kvk_number?: string | null
}): HostListingIdentityFields {
  return {
    landlord_name: (host.display_name || '').trim() || 'Host',
    agency_name: host.company_name?.trim() || null,
    landlord_phone: host.phone?.trim() || null,
    agency_license: host.agency_license?.trim() || host.kvk_number?.trim() || null,
  }
}
