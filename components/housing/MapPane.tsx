'use client'

import { useEffect, useRef, useState } from 'react'
import { Listing, Coords, MapViewport } from '@/types/housing'
import type { MapAdapter } from '@/lib/map/adapter'
import { createLeafletAdapter } from '@/lib/map/leaflet-adapter'
import {
  CARTO_LEAFLET_TILE_OPTIONS,
  getCartoApiKey,
  getCartoRasterTileUrl,
} from '@/lib/map/carto-tiles'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MapPaneProps {
  listings: Listing[]
  campusCoords?: Coords
  onHover: (id: string | null) => void
  onViewportChange: (viewport: MapViewport) => void
  onListingClick: (id: string) => void
  highlightedId?: string
  className?: string
}

export function MapPane({
  listings,
  campusCoords,
  onHover,
  onViewportChange,
  onListingClick,
  highlightedId,
  className = '',
}: MapPaneProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapAdapterRef = useRef<MapAdapter | null>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
  const callbacksRef = useRef({ onHover, onViewportChange, onListingClick })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    callbacksRef.current = { onHover, onViewportChange, onListingClick }
  }, [onHover, onViewportChange, onListingClick])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    let cancelled = false

    const init = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const L = await import('leaflet')
        // CSS is loaded via app/housing/leaflet.css side-effect import in HousingPageClient

        if (cancelled || !mapRef.current) return

        const defaultCenter: [number, number] = campusCoords
          ? [campusCoords.lat, campusCoords.lng]
          : [52.3676, 4.9041]

        const map = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: true,
        }).setView(defaultCenter, 12)

        if (!getCartoApiKey() && process.env.NODE_ENV === 'development') {
          console.warn(
            '[MapPane] NEXT_PUBLIC_CARTO_API_KEY is missing. Raster tiles may show "API key required".'
          )
        }

        // Single tile layer for the map lifetime; do not recreate on listing updates.
        L.tileLayer(getCartoRasterTileUrl(), {
          ...CARTO_LEAFLET_TILE_OPTIONS,
        }).addTo(map)

        L.control.zoom({ position: 'bottomright' }).addTo(map)

        const adapter = createLeafletAdapter(map, L)
        adapter.onMarkerHover((id) => callbacksRef.current.onHover(id))
        adapter.onViewportChange((vp) => callbacksRef.current.onViewportChange(vp))
        adapter.onMarkerClick((id) => callbacksRef.current.onListingClick(id))

        mapInstanceRef.current = map
        mapAdapterRef.current = adapter
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to initialize map:', err)
        if (!cancelled) {
          setError('Failed to load map')
          setIsLoading(false)
        }
      }
    }

    void init()

    return () => {
      cancelled = true
      mapAdapterRef.current?.destroy()
      mapAdapterRef.current = null
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, [])

  useEffect(() => {
    if (!mapAdapterRef.current || isLoading) return
    const safeListings = listings ?? []
    mapAdapterRef.current.setMarkers(safeListings, campusCoords)

    const withCoords = safeListings.filter((l) => l.coords?.lat || l.coords?.lng)
    if (withCoords.length > 0) {
      const coords = withCoords.map((l) => l.coords)
      if (campusCoords) coords.push(campusCoords)
      const lats = coords.map((c) => c.lat)
      const lngs = coords.map((c) => c.lng)
      mapAdapterRef.current.fitBounds([
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ])
    } else if (campusCoords) {
      mapAdapterRef.current.setCenter(campusCoords, 12)
    }
  }, [listings, campusCoords, isLoading])

  useEffect(() => {
    if (!mapAdapterRef.current || isLoading) return
    mapAdapterRef.current.highlightMarker(highlightedId || null)
  }, [highlightedId, isLoading])

  const handleCenterOnCampus = () => {
    if (!mapAdapterRef.current || !campusCoords) return
    mapAdapterRef.current.setCenter(campusCoords, 13)
  }

  const handleFitBounds = () => {
    const safeListings = listings ?? []
    if (!mapAdapterRef.current || safeListings.length === 0) return
    const coords = safeListings.map((l) => l.coords)
    if (campusCoords) coords.push(campusCoords)
    mapAdapterRef.current.fitBounds([
      [Math.min(...coords.map((c) => c.lat)), Math.min(...coords.map((c) => c.lng))],
      [Math.max(...coords.map((c) => c.lat)), Math.max(...coords.map((c) => c.lng))],
    ])
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900',
          className
        )}
      >
        <div className="p-6 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-rose-400" />
          <p className="mb-3 text-sm text-ink-600">{error}</p>
          <Button size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900',
        className
      )}
    >
      <div ref={mapRef} className="h-full w-full" style={{ minHeight: 400 }} />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-indigo-50/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-ink-600">Loading map…</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleFitBounds}
              className="rounded-xl border border-zinc-200 bg-white shadow-sm"
            >
              <Navigation className="h-4 w-4" />
            </Button>
            {campusCoords && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCenterOnCampus}
                className="rounded-xl border border-zinc-200 bg-white shadow-sm"
              >
                <MapPin className="h-4 w-4 text-rose-500" />
              </Button>
            )}
          </div>

          <div className="absolute bottom-3 left-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs shadow-sm">
            <div className="mb-1.5 font-semibold text-ink-800">Legend</div>
            <div className="space-y-1 text-ink-600">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                Verified host
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                Unverified host
              </div>
              {campusCoords && (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400 ring-2 ring-rose-200" />
                  Campus
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
