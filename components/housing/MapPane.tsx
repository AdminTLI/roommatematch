// Map Pane Component
// Wraps the map implementation with consistent interface

'use client'

import { useEffect, useRef, useState } from 'react'
import { Listing, Coords, MapViewport } from '@/types/housing'
import { MapAdapter, createLeafletAdapter } from '@/lib/map/leaflet-adapter'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, ZoomIn, ZoomOut } from 'lucide-react'

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
  className = ''
}: MapPaneProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapAdapterRef = useRef<MapAdapter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map (this would be done with actual Leaflet setup)
    const initializeMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Mock map initialization - in real implementation, this would:
        // 1. Import and initialize Leaflet
        // 2. Create map instance
        // 3. Set up tile layers
        // 4. Create adapter
        
        // For now, simulate async initialization
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock map adapter
        const mockMap = {
          fitBounds: () => {},
          setView: () => {},
          getCenter: () => ({ lat: 52.3676, lng: 4.9041 }), // Amsterdam
          getZoom: () => 10,
          getBounds: () => ({
            getNorth: () => 52.4,
            getSouth: () => 52.3,
            getEast: () => 4.95,
            getWest: () => 4.85
          }),
          on: () => {}
        } as any

        const adapter = createLeafletAdapter(mockMap)
        mapAdapterRef.current = adapter

        // Set up event handlers
        adapter.onMarkerHover(onHover)
        adapter.onViewportChange(onViewportChange)
        adapter.onMarkerClick(onListingClick)

        setIsLoading(false)
      } catch (err) {
        console.error('Failed to initialize map:', err)
        setError('Failed to load map')
        setIsLoading(false)
      }
    }

    initializeMap()

    return () => {
      if (mapAdapterRef.current) {
        mapAdapterRef.current.destroy()
        mapAdapterRef.current = null
      }
    }
  }, [onHover, onViewportChange, onListingClick])

  useEffect(() => {
    if (!mapAdapterRef.current) return

    // Update markers when listings change
    mapAdapterRef.current.setMarkers(listings, campusCoords)
  }, [listings, campusCoords])

  useEffect(() => {
    if (!mapAdapterRef.current) return

    // Highlight specific marker
    mapAdapterRef.current.highlightMarker(highlightedId || null)
  }, [highlightedId])

  const handleCenterOnCampus = () => {
    if (!mapAdapterRef.current || !campusCoords) return
    
    mapAdapterRef.current.setCenter(campusCoords, 12)
  }

  const handleFitBounds = () => {
    if (!mapAdapterRef.current || listings.length === 0) return

    const coords = listings.map(l => l.coords)
    if (campusCoords) coords.push(campusCoords)
    
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...coords.map(c => c.lat)), Math.min(...coords.map(c => c.lng))],
      [Math.max(...coords.map(c => c.lat)), Math.max(...coords.map(c => c.lng))]
    ]
    
    mapAdapterRef.current.fitBounds(bounds)
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-full bg-gray-100 rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        
        {/* Map placeholder - in real implementation, Leaflet would render here */}
        {!isLoading && (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <MapPin className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg font-medium">Map View</p>
              <p className="text-sm">{listings.length} listings</p>
              {campusCoords && (
                <p className="text-xs mt-2">Campus: {campusCoords.lat.toFixed(4)}, {campusCoords.lng.toFixed(4)}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      {!isLoading && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleFitBounds}
            className="shadow-lg"
          >
            <Navigation className="h-4 w-4" />
          </Button>
          
          {campusCoords && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCenterOnCampus}
              className="shadow-lg"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Map Legend */}
      {!isLoading && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
          <div className="font-medium mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Listings</span>
            </div>
            {campusCoords && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Campus</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
