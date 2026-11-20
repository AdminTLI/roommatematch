// Leaflet Map Adapter — real markers with verified/unverified colors

'use client'

import type { Map as LeafletMap, Marker, DivIcon } from 'leaflet'
import {
  MapAdapter,
  MapViewport,
} from './adapter'
import { Listing, Coords } from '@/types/housing'

function makePinIcon(L: typeof import('leaflet'), color: string, highlight = false): DivIcon {
  const size = highlight ? 28 : 22
  return L.divIcon({
    className: 'domu-map-pin',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};border:2px solid white;
      box-shadow:0 4px 14px rgba(15,23,42,0.35);
      transform:translate(-50%,-50%);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export class LeafletMapAdapter implements MapAdapter {
  private map: LeafletMap | null = null
  private L: typeof import('leaflet') | null = null
  private markers: Map<string, Marker> = new Map()
  private hoverCallback: ((id: string | null) => void) | null = null
  private viewportCallback: ((viewport: MapViewport) => void) | null = null
  private clickCallback: ((id: string) => void) | null = null
  private listingMeta = new Map<string, Listing>()

  constructor(map: LeafletMap, L: typeof import('leaflet')) {
    this.map = map
    this.L = L
    this.setupEventListeners()
  }

  fitBounds(bounds: [[number, number], [number, number]]): void {
    if (!this.map) return
    this.map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 })
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
        bounds: { north: 0, south: 0, east: 0, west: 0 },
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
        west: bounds.getWest(),
      },
    }
  }

  setMarkers(listings: Listing[], campusCoords?: Coords): void {
    if (!this.map || !this.L) return
    this.clearMarkers()
    this.listingMeta.clear()

    if (campusCoords) {
      const campusMarker = this.L.marker([campusCoords.lat, campusCoords.lng], {
        icon: makePinIcon(this.L, '#f43f5e', true),
        zIndexOffset: 1000,
        title: 'Campus',
      }).addTo(this.map)
      this.markers.set('campus', campusMarker)
    }

    listings.forEach((listing) => {
      if (!listing.coords?.lat && !listing.coords?.lng) return
      this.listingMeta.set(listing.id, listing)
      const verified = Boolean(listing.hostVerified)
      const color = verified ? '#6366f1' : '#e11d48'
      const marker = this.L!.marker([listing.coords.lat, listing.coords.lng], {
        icon: makePinIcon(this.L!, color),
        title: listing.title,
      }).addTo(this.map!)

      marker.on('mouseover', () => this.hoverCallback?.(listing.id))
      marker.on('mouseout', () => this.hoverCallback?.(null))
      marker.on('click', () => this.clickCallback?.(listing.id))

      this.markers.set(listing.id, marker)
    })
  }

  highlightMarker(id: string | null): void {
    if (!this.L) return
    this.markers.forEach((marker, key) => {
      if (key === 'campus') return
      const listing = this.listingMeta.get(key)
      const verified = listing?.hostVerified
      const color = verified ? '#6366f1' : '#e11d48'
      marker.setIcon(makePinIcon(this.L!, color, key === id))
      if (key === id) {
        marker.setZIndexOffset(500)
      } else {
        marker.setZIndexOffset(0)
      }
    })
  }

  clearMarkers(): void {
    this.markers.forEach((marker) => marker.remove())
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
    this.L = null
    this.hoverCallback = null
    this.viewportCallback = null
    this.clickCallback = null
  }

  private setupEventListeners(): void {
    if (!this.map) return
    this.map.on('moveend', () => this.viewportCallback?.(this.getViewport()))
    this.map.on('zoomend', () => this.viewportCallback?.(this.getViewport()))
  }
}

export function createLeafletAdapter(
  map: LeafletMap,
  L: typeof import('leaflet')
): MapAdapter {
  return new LeafletMapAdapter(map, L)
}
