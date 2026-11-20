/**
 * Dutch address lookup via PDOK Locatieserver (BAG).
 * Free official geocoder, no API key. Scoped to adres results in NL.
 */

export type PdokAddressSuggestion = {
  id: string
  label: string
  type: string
}

export type PdokResolvedAddress = {
  street: string
  houseNumber: string
  houseLetter: string
  houseNumberAddition: string
  postalCode: string
  city: string
  /** Combined street line for the listing address field */
  addressLine: string
  latitude: number | null
  longitude: number | null
}

const PDOK_BASE = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1'

function parsePoint(centroide: unknown): { lat: number; lng: number } | null {
  if (typeof centroide !== 'string') return null
  const m = /POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i.exec(centroide)
  if (!m) return null
  const lng = Number(m[1])
  const lat = Number(m[2])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

export async function suggestPdokAddresses(
  query: string,
  signal?: AbortSignal
): Promise<PdokAddressSuggestion[]> {
  const q = query.trim()
  if (q.length < 3) return []

  const url = new URL(`${PDOK_BASE}/suggest`)
  url.searchParams.set('q', q)
  url.searchParams.set('fq', 'type:adres')
  url.searchParams.set('rows', '8')

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error('Address search failed')

  const data = (await res.json()) as {
    response?: { docs?: Array<{ id?: string; weergavenaam?: string; type?: string }> }
  }
  const docs = data.response?.docs ?? []
  return docs
    .filter((d) => d.id && d.weergavenaam)
    .map((d) => ({
      id: String(d.id),
      label: String(d.weergavenaam),
      type: String(d.type || 'adres'),
    }))
}

export async function lookupPdokAddress(
  id: string,
  signal?: AbortSignal
): Promise<PdokResolvedAddress | null> {
  const url = new URL(`${PDOK_BASE}/lookup`)
  url.searchParams.set('id', id)

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error('Address lookup failed')

  const data = (await res.json()) as {
    response?: {
      docs?: Array<Record<string, unknown>>
    }
  }
  const doc = data.response?.docs?.[0]
  if (!doc) return null

  const street = String(doc.straatnaam || '')
  const houseNumber = doc.huisnummer != null ? String(doc.huisnummer) : ''
  const houseLetter = doc.huisletter != null ? String(doc.huisletter) : ''
  const houseNumberAddition =
    doc.huisnummertoevoeging != null ? String(doc.huisnummertoevoeging) : ''
  const postalCode = String(doc.postcode || '').replace(/\s+/g, '')
  const city = String(doc.woonplaatsnaam || '')

  const numberPart = [houseNumber, houseLetter].filter(Boolean).join('')
  const withAddition = houseNumberAddition
    ? `${numberPart}-${houseNumberAddition}`
    : numberPart
  const addressLine = [street, withAddition].filter(Boolean).join(' ').trim()

  const point = parsePoint(doc.centroide_ll)

  return {
    street,
    houseNumber,
    houseLetter,
    houseNumberAddition,
    postalCode,
    city,
    addressLine: addressLine || String(doc.weergavenaam || ''),
    latitude: point?.lat ?? null,
    longitude: point?.lng ?? null,
  }
}
