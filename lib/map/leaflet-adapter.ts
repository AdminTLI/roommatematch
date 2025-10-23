// Leaflet Map Adapter Implementation
// Implements MapAdapter interface using react-leaflet

'use client'

import { MapAdapter, MapMarker, MapViewport, calculateBounds, getCenterFromBounds, calculateZoomFromBounds } from './adapter'
import { Listing, Coords, Bounds } from '@/types/housing'
import { Map as LeafletMap } from 'leaflet'

export class LeafletMapAdapter implements MapAdapter {
  private map: LeafletMap | null = null
  private markers: Map<string, any> = new Map()
  private hoverCallback: ((id: string | null) => void) | null = null
  private viewportCallback: ((viewport: MapViewport) => void) | null = null
  private clickCallback: ((id: string) => void) | null = null

  constructor(map: LeafletMap) {
    this.map = map
    this.setupEventListeners()
  }

  fitBounds(bounds: [[number, number], [number, number]]): void {
    if (!this.map) return
    
    this.map.fitBounds(bounds, { padding: [20, 20] })
  }

  setCenter(center: Coords, zoom?: number): void {
    if (!this.map) return
    
    this.map.setView([center.lat, center.lng], zoom || this.map.getZoom())
  }

  getViewport(): MapViewport {
    if (!this.map) {
      return {
        center: { lat: 0, lng: 0 },
        zoom: 10,
        bounds: { north: 0, south: 0, east: 0, west: 0 }
      }
    }

    const center = this.map.getCenter()
    const zoom = this.map.getZoom()
    const bounds = this.map.getBounds()
    
    return {
      center: { lat: center.lat, lng: center.lng },
      zoom,
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }
    }
  }

  setMarkers(listings: Listing[], campusCoords?: Coords): void {
    if (!this.map) return

    // Clear existing markers
    this.clearMarkers()

    // Add campus marker if provided
    if (campusCoords) {
      const campusMarker = this.createCampusMarker(campusCoords)
      this.markers.set('campus', campusMarker)
    }

    // Add listing markers
    listings.forEach(listing => {
      const marker = this.createListingMarker(listing)
      this.markers.set(listing.id, marker)
    })
  }

  highlightMarker(id: string | null): void {
    // Remove highlight from all markers
    this.markers.forEach(marker => {
      if (marker.setOpacity) {
        marker.setOpacity(0.7)
      }
    })

    // Highlight specific marker
    if (id && this.markers.has(id)) {
      const marker = this.markers.get(id)
      if (marker && marker.setOpacity) {
        marker.setOpacity(1.0)
      }
    }
  }

  clearMarkers(): void {
    this.markers.forEach(marker => {
      if (marker.remove) {
        marker.remove()
      }
    })
    this.markers.clear()
  }

  onMarkerHover(callback: (id: string | null) => void): void {
    this.hoverCallback = callback
  }

  onViewportChange(callback: (viewport: MapViewport) => void): void {
    this.viewportCallback = callback
  }

  onMarkerClick(callback: (id: string) => void): void {
    this.clickCallback = callback
  }

  destroy(): void {
    this.clearMarkers()
    this.map = null
    this.hoverCallback = null
    this.viewportCallback = null
    this.clickCallback = null
  }

  private setupEventListeners(): void {
    if (!this.map) return

    // Viewport change events
    this.map.on('moveend', () => {
      if (this.viewportCallback) {
        this.viewportCallback(this.getViewport())
      }
    })

    this.map.on('zoomend', () => {
      if (this.viewportCallback) {
        this.viewportCallback(this.getViewport())
      }
    })
  }

  private createCampusMarker(coords: Coords): any {
    // This would be implemented with actual Leaflet marker creation
    // For now, returning a mock object
    return {
      coords,
      isCampus: true,
      remove: () => {},
      setOpacity: (opacity: number) => {}
    }
  }

  private createListingMarker(listing: Listing): any {
    // This would be implemented with actual Leaflet marker creation
    // For now, returning a mock object
    return {
      id: listing.id,
      coords: listing.coords,
      price: listing.priceMonthly,
      remove: () => {},
      setOpacity: (opacity: number) => {},
      on: (event: string, callback: Function) => {
        // Mock event handling
        if (event === 'mouseover' && this.hoverCallback) {
          // Simulate hover
          setTimeout(() => this.hoverCallback!(listing.id), 100)
        }
        if (event === 'click' && this.clickCallback) {
          // Simulate click
          setTimeout(() => this.clickCallback!(listing.id), 100)
        }
      }
    }
  }
}

// Factory function to create Leaflet adapter
export function createLeafletAdapter(map: LeafletMap): MapAdapter {
  return new LeafletMapAdapter(map)
}
