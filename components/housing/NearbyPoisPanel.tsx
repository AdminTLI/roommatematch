'use client'

import { useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  Bike,
  BookOpen,
  Building2,
  Bus,
  Clapperboard,
  Coffee,
  Dumbbell,
  Footprints,
  GraduationCap,
  MapPin,
  Pill,
  ShoppingBag,
  Store,
  TrainFront,
  Trees,
  UtensilsCrossed,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NearbyPoisMap, type MapPoi } from './NearbyPoisMap'

type Poi = {
  id: string
  category: string
  name: string | null
  distance_m: number | null
  walk_s: number | null
  cycle_s: number | null
  lat?: number | null
  lng?: number | null
  is_approx?: boolean
}

type RouteGeometry = {
  type?: string
  coordinates?: number[][]
}

function fmtMinutes(seconds: number | null | undefined) {
  if (seconds == null) return '-'
  return `${Math.max(1, Math.round(seconds / 60))} min`
}

function fmtDistance(meters: number | null | undefined) {
  if (meters == null || !Number.isFinite(meters)) return null
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km`
}

function normalizeName(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  supermarket: Store,
  convenience: Store,
  bus_stop: Bus,
  tram_stop: TrainFront,
  train_station: TrainFront,
  university: GraduationCap,
  city_centre: Building2,
  park: Trees,
  pharmacy: Pill,
  cafe: Coffee,
  food: UtensilsCrossed,
  gym: Dumbbell,
  library: BookOpen,
  shopping: ShoppingBag,
  entertainment: Clapperboard,
  bike_parking: Bike,
}

const CATEGORY_LABELS: Record<string, string> = {
  supermarket: 'Supermarket',
  convenience: 'Convenience store',
  bus_stop: 'Bus stop',
  tram_stop: 'Tram / metro',
  train_station: 'Train station',
  university: 'University',
  city_centre: 'City centre',
  park: 'Park',
  pharmacy: 'Pharmacy',
  cafe: 'Café',
  food: 'Food & takeaway',
  gym: 'Gym',
  library: 'Library',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  bike_parking: 'Bike parking',
}

/** Prefer everyday student needs first, then distance within the group. */
const CATEGORY_PRIORITY: Record<string, number> = {
  supermarket: 0,
  convenience: 1,
  bus_stop: 2,
  tram_stop: 3,
  train_station: 4,
  food: 5,
  cafe: 6,
  park: 7,
  gym: 8,
  library: 9,
  shopping: 10,
  entertainment: 11,
  pharmacy: 12,
  bike_parking: 13,
  city_centre: 14,
}

function categoryIcon(category: string): ComponentType<{ className?: string }> {
  const key = category.toLowerCase().replace(/\s+/g, '_')
  if (CATEGORY_ICONS[key]) return CATEGORY_ICONS[key]
  if (key.includes('university') || key.includes('campus') || key.includes('hbo') || key.includes('wo')) {
    return GraduationCap
  }
  if (
    key.includes('city') ||
    key.includes('centre') ||
    key.includes('center') ||
    key.includes('downtown')
  ) {
    return Building2
  }
  if (key.includes('bus')) return Bus
  if (
    key.includes('train') ||
    key.includes('rail') ||
    key.includes('station') ||
    key.includes('metro') ||
    key.includes('tram')
  ) {
    return TrainFront
  }
  return MapPin
}

function categoryLabel(category: string) {
  const key = category.toLowerCase().replace(/\s+/g, '_')
  if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key]
  return category
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function PoiRow({
  poi,
  active,
  highlighted,
  badge,
  onSelect,
}: {
  poi: Poi
  active: boolean
  highlighted?: boolean
  badge?: string | null
  onSelect: () => void
}) {
  const Icon = categoryIcon(poi.category)
  const isUniversity = poi.category === 'university'
  const far = (poi.distance_m ?? 0) > 15000
  const distanceLabel = fmtDistance(poi.distance_m)

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'flex w-full items-center justify-between gap-4 rounded-lg px-2 py-2.5 text-left transition',
          highlighted
            ? 'bg-indigo-50/80 ring-1 ring-inset ring-indigo-100 hover:bg-indigo-50 dark:bg-indigo-950/40 dark:ring-indigo-900/60 dark:hover:bg-indigo-950/55'
            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60',
          active && 'text-indigo-600 dark:text-indigo-400'
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <Icon className="h-4 w-4 shrink-0 text-ink-400" />
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="truncate text-sm font-medium text-ink-900 dark:text-white">
                {isUniversity
                  ? poi.name || 'University'
                  : categoryLabel(poi.category)}
              </p>
              {badge && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {badge}
                </span>
              )}
            </div>
            {isUniversity ? (
              distanceLabel && (
                <p className="truncate text-xs text-ink-500">{distanceLabel}</p>
              )
            ) : (
              poi.name && (
                <p className="truncate text-xs text-ink-500">{poi.name}</p>
              )
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-ink-500">
          {isUniversity && far ? (
            <span className="tabular-nums">{distanceLabel}</span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1">
                <Footprints className="h-3.5 w-3.5" />
                {poi.is_approx ? '~' : ''}
                {fmtMinutes(poi.walk_s)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Bike className="h-3.5 w-3.5" />
                {poi.is_approx ? '~' : ''}
                {fmtMinutes(poi.cycle_s)}
              </span>
            </>
          )}
        </div>
      </button>
    </li>
  )
}

export function NearbyPoisPanel({
  listingId,
  listingCity,
  listingCoords,
  plannedUniversityId,
  plannedUniversityName,
}: {
  listingId: string
  listingCity?: string | null
  listingCoords?: { lat: number; lng: number } | null
  plannedUniversityId?: string | null
  plannedUniversityName?: string | null
}) {
  const [pois, setPois] = useState<Poi[]>([])
  const [attribution, setAttribution] = useState('')
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<string | null>(null)
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(null)
  const [resolvedPlannedName, setResolvedPlannedName] = useState(
    plannedUniversityName ?? null
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/housing/pois/${listingId}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        setPois(j.pois || [])
        setAttribution(j.attribution || '')
        if (j.plannedUniversityName) {
          setResolvedPlannedName(j.plannedUniversityName)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [listingId])

  const plannedNameKey = normalizeName(
    resolvedPlannedName || plannedUniversityName
  )

  const { places, universities } = useMemo(() => {
    const placesList: Poi[] = []
    const uniList: Poi[] = []
    for (const poi of pois) {
      if (poi.category === 'university') uniList.push(poi)
      else placesList.push(poi)
    }

    uniList.sort((a, b) => {
      const aPlanned = plannedNameKey && normalizeName(a.name) === plannedNameKey ? 0 : 1
      const bPlanned = plannedNameKey && normalizeName(b.name) === plannedNameKey ? 0 : 1
      if (aPlanned !== bPlanned) return aPlanned - bPlanned
      return (a.distance_m ?? 0) - (b.distance_m ?? 0)
    })
    placesList.sort((a, b) => {
      const aPriority = CATEGORY_PRIORITY[a.category] ?? 50
      const bPriority = CATEGORY_PRIORITY[b.category] ?? 50
      if (aPriority !== bPriority) return aPriority - bPriority
      return (a.distance_m ?? 0) - (b.distance_m ?? 0)
    })
    return { places: placesList, universities: uniList }
  }, [pois, plannedNameKey])

  const mapPois = useMemo<MapPoi[]>(
    () =>
      pois
        .map((p) => ({
          id: p.id,
          category: p.category,
          name: p.name,
          // Postgres DECIMAL often arrives as string
          lat: Number(p.lat),
          lng: Number(p.lng),
        }))
        .filter(
          (p) =>
            Number.isFinite(p.lat) &&
            Number.isFinite(p.lng) &&
            !(p.lat === 0 && p.lng === 0)
        ),
    [pois]
  )

  const origin =
    listingCoords &&
    Number.isFinite(listingCoords.lat) &&
    Number.isFinite(listingCoords.lng) &&
    (listingCoords.lat !== 0 || listingCoords.lng !== 0)
      ? listingCoords
      : null

  const loadRoute = async (
    poiId: string,
    profile: 'foot-walking' | 'cycling-regular'
  ) => {
    setActive(poiId)
    setRouteGeometry(null)
    const res = await fetch(
      `/api/housing/pois/${listingId}?route_poi_id=${poiId}&profile=${profile}`
    )
    const j = await res.json()
    if (j.route?.geometry) {
      setRouteGeometry(j.route.geometry as RouteGeometry)
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-500">Loading nearby places…</p>
  }

  if (!pois.length) {
    return (
      <p className="text-sm text-ink-500">
        No nearby places available for this listing yet.
      </p>
    )
  }

  const cityLabel = listingCity?.trim() || 'this city'

  const list = (
    <div className="flex h-[25rem] min-h-0 min-w-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1">
        {places.length > 0 && (
          <ul className="space-y-1">
            {places.map((poi) => (
              <PoiRow
                key={poi.id}
                poi={poi}
                active={active === poi.id}
                onSelect={() => loadRoute(poi.id, 'foot-walking')}
              />
            ))}
          </ul>
        )}

        {universities.length > 0 && (
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-white">
                HBO & WO in {cityLabel}
              </p>
              <p className="text-xs text-ink-500">
                Universities in the same city as this listing, nearest first.
              </p>
            </div>
            <ul className="space-y-1">
              {universities.map((poi) => {
                const isPlanned =
                  Boolean(plannedNameKey) &&
                  normalizeName(poi.name) === plannedNameKey
                return (
                  <PoiRow
                    key={poi.id}
                    poi={poi}
                    active={active === poi.id}
                    highlighted={isPlanned}
                    badge={isPlanned ? 'Your Uni' : null}
                    onSelect={() => loadRoute(poi.id, 'foot-walking')}
                  />
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {attribution && (
        <p className="mt-3 shrink-0 text-[11px] text-ink-400">{attribution}</p>
      )}
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-10">
      {list}
      <NearbyPoisMap
        origin={origin}
        pois={mapPois}
        activePoiId={active}
        routeGeometry={routeGeometry}
        className="h-[25rem] w-full"
      />
    </div>
  )
}
