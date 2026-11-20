/**
 * Nearby POI enrichment: Overpass (discovery) + HeiGIT Matrix (durations).
 * Cache-first; respects Standard plan limits (Matrix 500/day, Directions 2000/day).
 */

import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

const HEIGIT_BASE = 'https://api.heigit.org/openrouteservice/v2'
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const USER_AGENT = 'DomuMatch/1.0 (housing-pois; contact@domumatch.nl)'

const MATRIX_DAILY_LIMIT = 500
const DIRECTIONS_DAILY_LIMIT = 2000
const SOFT_STOP_RATIO = 0.8
/** Everyday places (excl. universities). Keep room for student-relevant categories. */
const MAX_POIS = 14
/**
 * Bump when Overpass category set changes so cached listings re-enrich
 * instead of serving a stale, narrower neighbourhood snapshot.
 */
export const POI_ENRICHMENT_VERSION = 2

export type PoiCategory =
  | 'supermarket'
  | 'convenience'
  | 'bus_stop'
  | 'tram_stop'
  | 'train_station'
  | 'university'
  | 'city_centre'
  | 'park'
  | 'pharmacy'
  | 'cafe'
  | 'food'
  | 'gym'
  | 'library'
  | 'shopping'
  | 'entertainment'
  | 'bike_parking'

/** Student-useful everyday spots discovered via OpenStreetMap / Overpass. */
const CATEGORY_QUERIES: Array<{ category: PoiCategory; overpass: string[] }> = [
  {
    category: 'supermarket',
    overpass: ['node["shop"="supermarket"]', 'way["shop"="supermarket"]'],
  },
  {
    category: 'convenience',
    overpass: ['node["shop"="convenience"]', 'way["shop"="convenience"]'],
  },
  { category: 'bus_stop', overpass: ['node["highway"="bus_stop"]'] },
  {
    category: 'tram_stop',
    overpass: [
      'node["railway"="tram_stop"]',
      'node["railway"="subway_entrance"]',
      'node["station"="subway"]',
    ],
  },
  // train_station, city_centre, university: curated via geo_reference_points
  {
    category: 'pharmacy',
    overpass: ['node["amenity"="pharmacy"]', 'way["amenity"="pharmacy"]'],
  },
  {
    category: 'park',
    overpass: ['node["leisure"="park"]', 'way["leisure"="park"]'],
  },
  {
    category: 'cafe',
    overpass: ['node["amenity"="cafe"]', 'way["amenity"="cafe"]'],
  },
  {
    category: 'food',
    overpass: [
      'node["amenity"="fast_food"]',
      'way["amenity"="fast_food"]',
      'node["amenity"="restaurant"]',
      'way["amenity"="restaurant"]',
    ],
  },
  {
    category: 'gym',
    overpass: [
      'node["leisure"="fitness_centre"]',
      'way["leisure"="fitness_centre"]',
      'node["leisure"="sports_centre"]',
      'way["leisure"="sports_centre"]',
    ],
  },
  {
    category: 'library',
    overpass: ['node["amenity"="library"]', 'way["amenity"="library"]'],
  },
  {
    category: 'shopping',
    overpass: [
      'node["shop"="mall"]',
      'way["shop"="mall"]',
      'node["shop"="department_store"]',
      'way["shop"="department_store"]',
      'node["shop"="clothes"]',
      'way["shop"="clothes"]',
    ],
  },
  {
    category: 'entertainment',
    overpass: [
      'node["amenity"="cinema"]',
      'way["amenity"="cinema"]',
      'node["amenity"="theatre"]',
      'way["amenity"="theatre"]',
      'node["amenity"="nightclub"]',
      'node["leisure"="escape_game"]',
    ],
  },
  {
    category: 'bike_parking',
    overpass: [
      'node["amenity"="bicycle_parking"]',
      'way["amenity"="bicycle_parking"]',
    ],
  },
]

function classifyOverpassTags(tags: Record<string, string>): PoiCategory | null {
  if (tags.shop === 'supermarket') return 'supermarket'
  if (tags.shop === 'convenience') return 'convenience'
  if (tags.highway === 'bus_stop') return 'bus_stop'
  if (
    tags.railway === 'tram_stop' ||
    tags.railway === 'subway_entrance' ||
    tags.station === 'subway'
  ) {
    return 'tram_stop'
  }
  if (tags.amenity === 'pharmacy') return 'pharmacy'
  if (tags.leisure === 'park') return 'park'
  if (tags.amenity === 'cafe') return 'cafe'
  if (tags.amenity === 'fast_food' || tags.amenity === 'restaurant') return 'food'
  if (tags.leisure === 'fitness_centre' || tags.leisure === 'sports_centre') {
    return 'gym'
  }
  if (tags.amenity === 'library') return 'library'
  if (
    tags.shop === 'mall' ||
    tags.shop === 'department_store' ||
    tags.shop === 'clothes'
  ) {
    return 'shopping'
  }
  if (
    tags.amenity === 'cinema' ||
    tags.amenity === 'theatre' ||
    tags.amenity === 'nightclub' ||
    tags.leisure === 'escape_game'
  ) {
    return 'entertainment'
  }
  if (tags.amenity === 'bicycle_parking') return 'bike_parking'
  if (tags.amenity === 'university') return 'university'
  return null
}

function fallbackPoiName(category: PoiCategory, tags: Record<string, string>): string {
  if (tags.brand) return tags.brand
  if (tags.operator) return tags.operator
  return category.replace(/_/g, ' ')
}

/** Universities within this radius get Matrix routing when budget allows */
const UNIVERSITY_MATRIX_MAX_M = 15000

function heigitKey(): string | null {
  const key =
    process.env.HEIGIT_API_KEY ||
    process.env.OPENROUTESERVICE_API_KEY ||
    ''
  return key.trim() || null
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function estimateWalkS(distanceM: number): number {
  return Math.round(distanceM / 1.4)
}
function estimateCycleS(distanceM: number): number {
  return Math.round(distanceM / 4.5)
}

async function getUsage(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  endpoint: 'matrix' | 'directions'
): Promise<number> {
  const day = new Date().toISOString().slice(0, 10)
  const { data } = await admin
    .from('heigit_usage_counters')
    .select('call_count')
    .eq('day', day)
    .eq('endpoint', endpoint)
    .maybeSingle()
  return data?.call_count ?? 0
}

async function bumpUsage(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  endpoint: 'matrix' | 'directions',
  n = 1
) {
  const day = new Date().toISOString().slice(0, 10)
  const current = await getUsage(admin, endpoint)
  await admin.from('heigit_usage_counters').upsert(
    { day, endpoint, call_count: current + n },
    { onConflict: 'day,endpoint' }
  )
}

function canCall(
  count: number,
  dailyLimit: number
): boolean {
  return count < dailyLimit * SOFT_STOP_RATIO
}

type RawPoi = {
  category: PoiCategory
  name: string
  lat: number
  lng: number
  distance_m: number
  university_id?: string | null
  city?: string | null
}

function normalizeCity(city: string | null | undefined): string {
  if (!city) return ''
  const raw = city.trim().toLowerCase().replace(/\s+/g, ' ')
  const aliases: Record<string, string> = {
    'the hague': 'den haag',
    "'s-gravenhage": 'den haag',
    's-gravenhage': 'den haag',
    "'s gravenhage": 'den haag',
    'den haag': 'den haag',
    amsterdam: 'amsterdam',
    rotterdam: 'rotterdam',
    utrecht: 'utrecht',
    eindhoven: 'eindhoven',
    tilburg: 'tilburg',
    groningen: 'groningen',
    nijmegen: 'nijmegen',
    maastricht: 'maastricht',
    leiden: 'leiden',
    delft: 'delft',
    breda: 'breda',
    enschede: 'enschede',
    wagningen: 'wageningen',
    wageningen: 'wageningen',
  }
  return aliases[raw] || raw
}

/**
 * Curated NL reference points:
 * - nearest city_centre + train_station (within maxDistanceM)
 * - HBO/WO universities in the listing city (+ optional planned university)
 */
async function fetchNearestReferencePoints(
  lat: number,
  lng: number,
  opts: {
    listingCity?: string | null
    plannedUniversityId?: string | null
    maxDistanceM?: number
  } = {}
): Promise<RawPoi[]> {
  const maxDistanceM = opts.maxDistanceM ?? 25000
  const listingCityKey = normalizeCity(opts.listingCity)
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('geo_reference_points')
      .select('category, name, city, lat, lng, kind, university_id, university_slug')
      .eq('is_active', true)
      .in('category', ['city_centre', 'train_station', 'university'])

    if (error || !data?.length) {
      if (error) safeLogger.warn('geo_reference_points lookup failed', { error: error.message })
      return []
    }

    const bestPlace = new Map<PoiCategory, RawPoi>()
    const universities: RawPoi[] = []

    for (const row of data) {
      const category = row.category as PoiCategory
      const distance_m = Math.round(haversineM(lat, lng, Number(row.lat), Number(row.lng)))
      const poi: RawPoi = {
        category,
        name: row.name,
        lat: Number(row.lat),
        lng: Number(row.lng),
        distance_m,
        university_id: row.university_id,
        city: row.city,
      }

      if (category === 'university') {
        const sameCity =
          !listingCityKey || normalizeCity(row.city) === listingCityKey
        const isPlanned =
          Boolean(opts.plannedUniversityId) &&
          row.university_id === opts.plannedUniversityId
        if (sameCity || isPlanned) {
          universities.push(poi)
        }
        continue
      }

      if (category !== 'city_centre' && category !== 'train_station') continue
      if (distance_m > maxDistanceM) continue
      const existing = bestPlace.get(category)
      if (!existing || distance_m < existing.distance_m) {
        bestPlace.set(category, poi)
      }
    }

    universities.sort((a, b) => {
      const aPlanned = a.university_id && a.university_id === opts.plannedUniversityId ? 0 : 1
      const bPlanned = b.university_id && b.university_id === opts.plannedUniversityId ? 0 : 1
      if (aPlanned !== bPlanned) return aPlanned - bPlanned
      return a.distance_m - b.distance_m
    })
    return [...bestPlace.values(), ...universities]
  } catch (e) {
    safeLogger.warn('geo_reference_points lookup threw', {
      error: e instanceof Error ? e.message : String(e),
    })
    return []
  }
}

async function fetchOverpassNearest(
  lat: number,
  lng: number,
  radiusM = 2000
): Promise<RawPoi[]> {
  const parts = CATEGORY_QUERIES.flatMap(({ overpass }) =>
    overpass.map((selector) => `${selector}(around:${radiusM},${lat},${lng});`)
  ).join('\n')
  // Keep enough elements for multi-category nearest-pick; out center covers ways.
  const query = `[out:json][timeout:25];(${parts});out body center 80;`

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
  })
  if (!res.ok) {
    safeLogger.warn('Overpass failed', { status: res.status })
    return []
  }
  const json = (await res.json()) as {
    elements?: Array<{
      tags?: Record<string, string>
      lat?: number
      lon?: number
      center?: { lat: number; lon: number }
    }>
  }

  const byCategory = new Map<PoiCategory, RawPoi>()
  for (const el of json.elements || []) {
    const plat = el.lat ?? el.center?.lat
    const plng = el.lon ?? el.center?.lon
    if (plat == null || plng == null) continue
    const tags = el.tags || {}
    const category = classifyOverpassTags(tags)
    // train_station / city_centre come from geo_reference_points (curated)
    if (!category || category === 'train_station' || category === 'city_centre') {
      continue
    }
    const distance_m = Math.round(haversineM(lat, lng, plat, plng))
    const existing = byCategory.get(category)
    if (!existing || distance_m < existing.distance_m) {
      byCategory.set(category, {
        category,
        name: tags.name || fallbackPoiName(category, tags),
        lat: plat,
        lng: plng,
        distance_m,
      })
    }
  }

  return [...byCategory.values()]
}

async function matrixDurations(
  origin: [number, number],
  destinations: Array<[number, number]>,
  profile: 'foot-walking' | 'cycling-regular',
  apiKey: string
): Promise<number[] | null> {
  const url = `${HEIGIT_BASE}/matrix/${profile}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify({
      locations: [origin, ...destinations],
      sources: [0],
      destinations: destinations.map((_, i) => i + 1),
      metrics: ['duration', 'distance'],
      units: 'm',
    }),
  })
  if (!res.ok) {
    safeLogger.warn('HeiGIT matrix failed', { status: res.status, profile })
    return null
  }
  const json = (await res.json()) as { durations?: number[][] }
  return json.durations?.[0] ?? null
}

export async function enrichListingPois(
  listingId: string,
  force = false,
  opts: { plannedUniversityId?: string | null } = {}
): Promise<{
  ok: boolean
  approx: boolean
  count: number
  error?: string
}> {
  const admin = await createAdminClient()
  const { data: listing, error } = await admin
    .from('housing_listings')
    .select('id, latitude, longitude, city')
    .eq('id', listingId)
    .maybeSingle()

  if (error || !listing?.latitude || !listing?.longitude) {
    return { ok: false, approx: true, count: 0, error: 'Listing coords missing' }
  }

  const lat = Number(listing.latitude)
  const lng = Number(listing.longitude)

  if (!force) {
    const { data: existing } = await admin
      .from('listing_nearby_pois')
      .select('id, fetched_at, category, source')
      .eq('listing_id', listingId)
    if (existing?.length) {
      const age = Date.now() - new Date(existing[0].fetched_at).getTime()
      const uniCount = existing.filter((p) => p.category === 'university').length
      const versionTag = `_v${POI_ENRICHMENT_VERSION}`
      const hasCurrentSchema = existing.some((p) =>
        String(p.source || '').includes(versionTag)
      )
      // City-filtered caches should stay small; nationwide dumps need refresh.
      // Schema bumps (new student POI categories) force a one-time re-enrich.
      if (
        hasCurrentSchema &&
        age < 30 * 24 * 60 * 60 * 1000 &&
        uniCount <= 12
      ) {
        return { ok: true, approx: false, count: existing.length }
      }
    }
  }

  const [overpassPois, referencePois] = await Promise.all([
    fetchOverpassNearest(lat, lng),
    fetchNearestReferencePoints(lat, lng, {
      listingCity: listing.city,
      plannedUniversityId: opts.plannedUniversityId,
    }),
  ])

  // Everyday places: one per Overpass category (max), then curated centre/station
  const placeByCategory = new Map<PoiCategory, RawPoi>()
  for (const poi of overpassPois) {
    if (poi.category === 'university') continue
    placeByCategory.set(poi.category, poi)
  }
  for (const poi of referencePois) {
    if (poi.category === 'university') continue
    placeByCategory.set(poi.category, poi)
  }

  const placePois = [...placeByCategory.values()]
    .sort((a, b) => a.distance_m - b.distance_m)
    .slice(0, MAX_POIS)

  const universityPois = referencePois
    .filter((p) => p.category === 'university')
    .sort((a, b) => a.distance_m - b.distance_m)

  const rawPois = [...placePois, ...universityPois]
  if (!rawPois.length) {
    return { ok: false, approx: true, count: 0, error: 'No POIs from Overpass or reference points' }
  }

  // Matrix only for everyday places + nearby universities (API budget)
  const matrixTargets = rawPois
    .map((p, index) => ({ p, index }))
    .filter(
      ({ p }) =>
        p.category !== 'university' || p.distance_m <= UNIVERSITY_MATRIX_MAX_M
    )

  const apiKey = heigitKey()
  const matrixUsed = await getUsage(admin, 'matrix')
  const walkByIndex = new Map<number, number>()
  const cycleByIndex = new Map<number, number>()
  let approx = true

  if (apiKey && matrixTargets.length && canCall(matrixUsed, MATRIX_DAILY_LIMIT)) {
    const dests = matrixTargets.map(({ p }) => [p.lng, p.lat] as [number, number])
    const origin: [number, number] = [lng, lat]
    const walk = await matrixDurations(origin, dests, 'foot-walking', apiKey)
    await bumpUsage(admin, 'matrix', 1)
    if (walk) {
      matrixTargets.forEach(({ index }, i) => {
        if (walk[i] != null) walkByIndex.set(index, Math.round(walk[i]))
      })
      approx = false
    }
    if (canCall(matrixUsed + 1, MATRIX_DAILY_LIMIT)) {
      const cycle = await matrixDurations(origin, dests, 'cycling-regular', apiKey)
      await bumpUsage(admin, 'matrix', 1)
      if (cycle) {
        matrixTargets.forEach(({ index }, i) => {
          if (cycle[i] != null) cycleByIndex.set(index, Math.round(cycle[i]))
        })
        approx = false
      }
    }
  }

  await admin.from('listing_nearby_pois').delete().eq('listing_id', listingId)

  const rows = rawPois.map((p, i) => {
    const walk_s = walkByIndex.get(i) ?? estimateWalkS(p.distance_m)
    const cycle_s = cycleByIndex.get(i) ?? estimateCycleS(p.distance_m)
    const usedMatrix = walkByIndex.has(i) || cycleByIndex.has(i)
    return {
      listing_id: listingId,
      category: p.category,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      distance_m: p.distance_m,
      walk_s,
      cycle_s,
      is_approx: !usedMatrix,
      source: usedMatrix
        ? `heigit_matrix_v${POI_ENRICHMENT_VERSION}`
        : `haversine_v${POI_ENRICHMENT_VERSION}`,
      fetched_at: new Date().toISOString(),
    }
  })

  const { error: insertErr } = await admin.from('listing_nearby_pois').insert(rows)
  if (insertErr) {
    return { ok: false, approx, count: 0, error: insertErr.message }
  }

  return { ok: true, approx, count: rows.length }
}

export async function getOrCreatePoiRoute(
  listingId: string,
  poiId: string,
  profile: 'foot-walking' | 'cycling-regular' = 'foot-walking'
): Promise<{ geometry: unknown; duration_s?: number; distance_m?: number; approx?: boolean } | null> {
  const admin = await createAdminClient()
  const { data: cached } = await admin
    .from('listing_poi_routes')
    .select('*')
    .eq('listing_id', listingId)
    .eq('poi_id', poiId)
    .eq('profile', profile)
    .maybeSingle()

  if (cached) {
    return {
      geometry: cached.geometry,
      duration_s: cached.duration_s ?? undefined,
      distance_m: cached.distance_m ?? undefined,
    }
  }

  const { data: listing } = await admin
    .from('housing_listings')
    .select('latitude, longitude')
    .eq('id', listingId)
    .maybeSingle()
  const { data: poi } = await admin
    .from('listing_nearby_pois')
    .select('*')
    .eq('id', poiId)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (!listing?.latitude || !listing?.longitude || !poi) return null

  const apiKey = heigitKey()
  const used = await getUsage(admin, 'directions')
  if (!apiKey || !canCall(used, DIRECTIONS_DAILY_LIMIT)) {
    return {
      geometry: {
        type: 'LineString',
        coordinates: [
          [Number(listing.longitude), Number(listing.latitude)],
          [Number(poi.lng), Number(poi.lat)],
        ],
      },
      duration_s: profile === 'foot-walking' ? poi.walk_s : poi.cycle_s,
      distance_m: poi.distance_m,
      approx: true,
    }
  }

  const url = `${HEIGIT_BASE}/directions/${profile}/geojson`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify({
      coordinates: [
        [Number(listing.longitude), Number(listing.latitude)],
        [Number(poi.lng), Number(poi.lat)],
      ],
    }),
  })
  await bumpUsage(admin, 'directions', 1)

  if (!res.ok) {
    safeLogger.warn('HeiGIT directions failed', { status: res.status })
    return null
  }

  const geojson = await res.json()
  const feature = geojson?.features?.[0]
  const summary = feature?.properties?.summary
  const geometry = feature?.geometry
  if (!geometry) return null

  await admin.from('listing_poi_routes').upsert(
    {
      listing_id: listingId,
      poi_id: poiId,
      profile,
      geometry,
      duration_s: summary?.duration ? Math.round(summary.duration) : null,
      distance_m: summary?.distance ? Math.round(summary.distance) : null,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: 'listing_id,poi_id,profile' }
  )

  return {
    geometry,
    duration_s: summary?.duration ? Math.round(summary.duration) : undefined,
    distance_m: summary?.distance ? Math.round(summary.distance) : undefined,
  }
}
