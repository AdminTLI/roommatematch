// Map Adapter Interface
// Defines the contract for map implementations to enable provider swapping

import { Listing, Coords, Bounds } from '@/types/housing'

export interface MapAdapter {
  // Viewport management
  fitBounds(bounds: [[number, number], [number, number]]): void
  setCenter(center: Coords, zoom?: number): void
  getViewport(): { center: Coords; zoom: number; bounds: Bounds }
  
  // Markers management
  setMarkers(listings: Listing[], campusCoords?: Coords): void
  highlightMarker(id: string | null): void
  clearMarkers(): void
  
  // Event handlers
  onMarkerHover(callback: (id: string | null) => void): void
  onViewportChange(callback: (viewport: { center: Coords; zoom: number; bounds: Bounds }) => void): void
  onMarkerClick(callback: (id: string) => void): void
  
  // Cleanup
  destroy(): void
}

export interface MapMarker {
  id: string
  coords: Coords
  price: number
  isHighlighted?: boolean
  isCampus?: boolean
}

export interface MapViewport {
  center: Coords
  zoom: number
  bounds: Bounds
}

// Common map utilities
export function calculateBounds(coords: Coords[]): [[number, number], [number, number]] {
  if (coords.length === 0) {
    return [[0, 0], [0, 0]]
  }
  
  const lats = coords.map(c => c.lat)
  const lngs = coords.map(c => c.lng)
  
  return [
    [Math.min(...lats), Math.min(...lngs)], // Southwest
    [Math.max(...lats), Math.max(...lngs)]  // Northeast
  ]
}

export function getCenterFromBounds(bounds: [[number, number], [number, number]]): Coords {
  const [[south, west], [north, east]] = bounds
  return {
    lat: (south + north) / 2,
    lng: (west + east) / 2
  }
}

export function calculateZoomFromBounds(bounds: [[number, number], [number, number]]): number {
  const [[south, west], [north, east]] = bounds
  const latDiff = north - south
  const lngDiff = east - west
  const maxDiff = Math.max(latDiff, lngDiff)
  
  // Simple zoom calculation - adjust based on your needs
  if (maxDiff > 10) return 4
  if (maxDiff > 5) return 6
  if (maxDiff > 1) return 8
  if (maxDiff > 0.5) return 10
  if (maxDiff > 0.1) return 12
  return 14
}
