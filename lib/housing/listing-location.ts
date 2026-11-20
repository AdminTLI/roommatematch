/**
 * Helpers for student-facing listing location display and map coordinates.
 */

export type ListingLocationFields = {
  address?: string | null
  city?: string | null
  postalCode?: string | null
  postal_code?: string | null
  houseNumber?: string | null
  house_number?: string | null
  houseLetter?: string | null
  house_letter?: string | null
  houseNumberAddition?: string | null
  house_number_addition?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
  neighborhoodLat?: number | string | null
  neighborhood_lat?: number | string | null
  neighborhoodLng?: number | string | null
  neighborhood_lng?: number | string | null
}

export function parseCoord(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return null
}

/** Street line for students; empty when address is missing or equals the city name. */
export function composeStreetLine(fields: ListingLocationFields): string {
  const address = (fields.address || '').trim()
  const city = (fields.city || '').trim()
  if (!address) return ''
  if (city && address.toLowerCase() === city.toLowerCase()) return ''
  return address
}

/**
 * Student-facing location line.
 * Prefers street + city + postcode; avoids "Breda, Breda 4811AA" when address is city-only.
 * Never prefixes a leading comma when the street is missing.
 */
export function formatListingLocationLine(fields: ListingLocationFields): string {
  const city = (fields.city || '').trim()
  const postal = (fields.postalCode || fields.postal_code || '').trim()
  const street = composeStreetLine(fields)

  // Match feed cards: "Breda 4811AA" (city then postcode)
  const cityPostal = [city, postal].filter(Boolean).join(' ')
  if (street && cityPostal) return `${street}, ${cityPostal}`
  if (street) return street
  return cityPostal || 'Location TBD'
}

/** Exact map pin from stored lat/lng (null when missing/invalid). */
export function listingMapCoords(fields: ListingLocationFields): {
  lat: number
  lng: number
} | null {
  const lat = parseCoord(fields.latitude)
  const lng = parseCoord(fields.longitude)
  if (lat == null || lng == null) return null
  // Reject null-island / clearly unset
  if (lat === 0 && lng === 0) return null
  return { lat, lng }
}

/** Normalize amenity keys so "air conditioning" and "air_conditioning" match. */
export function normalizeAmenityKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_')
}

export function normalizeAmenityList(values: unknown): string[] {
  if (!Array.isArray(values)) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const raw of values) {
    if (typeof raw !== 'string' || !raw.trim()) continue
    const key = normalizeAmenityKey(raw)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(key)
  }
  return out
}
