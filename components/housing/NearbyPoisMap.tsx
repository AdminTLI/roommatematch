'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CARTO_LEAFLET_TILE_OPTIONS,
  getCartoRasterTileUrl,
} from '@/lib/map/carto-tiles'
import '@/app/housing/leaflet.css'

export type MapPoi = {
  id: string
  category: string
  name: string | null
  lat: number
  lng: number
}

function poiColor(category: string): string {
  const key = category.toLowerCase()
  if (key.includes('university') || key.includes('campus')) return '#6366f1'
  if (key.includes('supermarket') || key.includes('grocery') || key.includes('convenience'))
    return '#10b981'
  if (key.includes('pharmacy')) return '#f43f5e'
  if (key.includes('park')) return '#22c55e'
  if (
    key.includes('bus') ||
    key.includes('train') ||
    key.includes('tram') ||
    key.includes('metro') ||
    key.includes('station')
  ) {
    return '#0ea5e9'
  }
  if (key.includes('city') || key.includes('centre') || key.includes('center'))
    return '#f59e0b'
  if (key.includes('cafe') || key.includes('food') || key.includes('restaurant'))
    return '#ea580c'
  if (key.includes('gym') || key.includes('fitness')) return '#8b5cf6'
  if (key.includes('library')) return '#0d9488'
  if (key.includes('shopping') || key.includes('mall')) return '#db2777'
  if (key.includes('entertainment') || key.includes('cinema')) return '#e11d48'
  if (key.includes('bike')) return '#64748b'
  return '#71717a'
}

function makeDotIcon(
  L: typeof import('leaflet'),
  color: string,
  size: number,
  ring = false
) {
  const ringCss = ring
    ? 'box-shadow:0 0 0 3px rgba(99,102,241,0.35),0 4px 12px rgba(15,23,42,0.3);'
    : 'box-shadow:0 4px 12px rgba(15,23,42,0.3);'
  return L.divIcon({
    className: 'domu-map-pin',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};border:2px solid #fff;
      ${ringCss}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

type RouteGeometry = {
  type?: string
  coordinates?: number[][]
}

export function NearbyPoisMap({
  origin,
  pois,
  activePoiId,
  routeGeometry,
  className,
}: {
  origin: { lat: number; lng: number } | null
  pois: MapPoi[]
  activePoiId?: string | null
  routeGeometry?: RouteGeometry | null
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const layerRef = useRef<import('leaflet').LayerGroup | null>(null)
  const routeRef = useRef<import('leaflet').Polyline | null>(null)
  const LRef = useRef<typeof import('leaflet') | null>(null)
  const [mapReady, setMapReady] = useState(false)

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false
    let resizeObserver: ResizeObserver | null = null

    const init = async () => {
      const L = await import('leaflet')
      if (cancelled || !containerRef.current) return

      const center: [number, number] = origin
        ? [origin.lat, origin.lng]
        : [52.0907, 5.1214]

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      }).setView(center, 14)

      L.tileLayer(getCartoRasterTileUrl(), {
        ...CARTO_LEAFLET_TILE_OPTIONS,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      const layers = L.layerGroup().addTo(map)
      mapRef.current = map
      layerRef.current = layers
      LRef.current = L

      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize({ animate: false })
      })
      resizeObserver.observe(containerRef.current)
      requestAnimationFrame(() => map.invalidateSize())
      if (!cancelled) setMapReady(true)
    }

    void init()

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      setMapReady(false)
      mapRef.current?.remove()
      mapRef.current = null
      layerRef.current = null
      routeRef.current = null
      LRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, [])

  // Markers + bounds (re-run when map becomes ready OR pois change)
  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    const layers = layerRef.current
    const L = LRef.current
    if (!map || !layers || !L) return

    layers.clearLayers()

    const bounds: [number, number][] = []

    if (origin && Number.isFinite(origin.lat) && Number.isFinite(origin.lng)) {
      L.marker([origin.lat, origin.lng], {
        icon: makeDotIcon(L, '#4f46e5', 18, true),
        zIndexOffset: 1000,
        title: 'This listing',
      }).addTo(layers)
      bounds.push([origin.lat, origin.lng])
    }

    for (const poi of pois) {
      const lat = Number(poi.lat)
      const lng = Number(poi.lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
      const active = poi.id === activePoiId
      L.marker([lat, lng], {
        icon: makeDotIcon(L, poiColor(poi.category), active ? 16 : 12, active),
        zIndexOffset: active ? 900 : 0,
        title: poi.name || poi.category,
      }).addTo(layers)
      bounds.push([lat, lng])
    }

    if (bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 })
    } else if (bounds.length === 1) {
      map.setView(bounds[0]!, 14)
    }

    requestAnimationFrame(() => map.invalidateSize())
  }, [mapReady, origin, pois, activePoiId])

  // Route polyline
  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L) return

    if (routeRef.current) {
      map.removeLayer(routeRef.current)
      routeRef.current = null
    }

    const coords = routeGeometry?.coordinates
    if (!coords?.length) return

    const latLngs = coords
      .filter((c) => Array.isArray(c) && c.length >= 2)
      .map((c) => [Number(c[1]), Number(c[0])] as [number, number])
      .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng))

    if (latLngs.length < 2) return

    const line = L.polyline(latLngs, {
      color: '#6366f1',
      weight: 4,
      opacity: 0.85,
      lineJoin: 'round',
    }).addTo(map)
    routeRef.current = line
    map.fitBounds(line.getBounds(), { padding: [36, 36], maxZoom: 16 })
  }, [mapReady, routeGeometry])

  const hasOrigin =
    origin != null && Number.isFinite(origin.lat) && Number.isFinite(origin.lng)

  if (!hasOrigin && pois.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-sm text-ink-500 dark:border-zinc-800 dark:bg-zinc-900 ${className || ''}`}
      >
        Map unavailable for this listing
      </div>
    )
  }

  return (
    <div
      className={`relative isolate z-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 ${className || ''}`}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink-600 shadow-sm backdrop-blur dark:bg-zinc-900/90 dark:text-ink-300">
        Nearby places
      </div>
    </div>
  )
}
