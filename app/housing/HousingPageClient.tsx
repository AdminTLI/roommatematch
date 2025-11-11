// Housing Page Client Component
// Main client component with state management and layout

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Listing, FiltersState, ViewMode, Coords } from '@/types/housing'
import { filtersToSearchParams, searchParamsToFilters, getDefaultFilters } from '@/lib/housing/url-sync'
import { Toolbar } from '@/components/housing/Toolbar'
import { ListPane } from '@/components/housing/ListPane'
import { MapPane } from '@/components/housing/MapPane'
import { ListSkeleton } from '@/components/housing/Skeletons'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { List, Map } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HousingPageClientProps {
  initialListings: Listing[]
  initialFilters: FiltersState
  campusOptions: Array<{ id: string; name: string }>
  userCampusId?: string
  userCampusCoords?: Coords
}

export function HousingPageClient({
  initialListings,
  initialFilters,
  campusOptions,
  userCampusId,
  userCampusCoords
}: HousingPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [filters, setFilters] = useState<FiltersState>(initialFilters)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set())
  const [selectedCampusId, setSelectedCampusId] = useState<string | undefined>(userCampusId)

  // Update URL when filters change
  useEffect(() => {
    const newParams = filtersToSearchParams(filters)
    const newUrl = new URL(window.location.href)
    newUrl.search = newParams.toString()
    
    // Use replaceState to avoid adding to history
    window.history.replaceState({}, '', newUrl.toString())
  }, [filters])

  // Fetch listings when filters change
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const params = filtersToSearchParams(filters)
        const response = await fetch(`/api/housing/listings?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings')
        }
        
        const data = await response.json()
        setListings(data.items || []) // Ensure always array
      } catch (err) {
        console.error('Failed to fetch listings:', err)
        setError(err instanceof Error ? err.message : 'Failed to load listings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [filters])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FiltersState) => {
    setFilters(newFilters)
  }, [])

  // Handle campus change
  const handleCampusChange = useCallback((campusId: string) => {
    setSelectedCampusId(campusId)
    const newFilters = { ...filters, campusId: campusId || undefined }
    setFilters(newFilters)
  }, [filters])

  // Handle listing actions
  const handleSave = useCallback((id: string) => {
    setSavedListings(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const handleShare = useCallback((id: string) => {
    // TODO: Implement share functionality
    console.log('Share listing:', id)
  }, [])

  const handleReport = useCallback((id: string) => {
    // TODO: Implement report functionality
    console.log('Report listing:', id)
  }, [])

  // Handle empty state actions
  const handleBroadenLocation = useCallback(() => {
    // TODO: Open filters drawer and focus on radius
    console.log('Broaden location')
  }, [])

  const handleLowerCompatibility = useCallback(() => {
    // TODO: Open filters drawer and focus on compatibility slider
    console.log('Lower compatibility')
  }, [])

  const handleCreateAlert = useCallback(() => {
    // TODO: Open save search dialog
    console.log('Create alert')
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters(getDefaultFilters())
  }, [])

  const handleSaveSearch = useCallback(() => {
    // TODO: Open save search dialog
    console.log('Save search')
  }, [])

  // Get current view mode
  const viewMode = filters.view || 'split'
  const hasFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FiltersState]
    return value !== undefined && value !== null && value !== '' && 
           !(Array.isArray(value) && value.length === 0)
  })

  // Mobile view
  if (viewMode === 'list' || viewMode === 'map') {
    return (
      <div className="min-h-screen bg-gray-50 pb-safe-bottom md:pb-0">
        {/* Toolbar */}
        <Toolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSaveSearch={handleSaveSearch}
          campusOptions={campusOptions}
          selectedCampusId={selectedCampusId}
          onCampusChange={handleCampusChange}
        />

        {/* Mobile tabs */}
        <div className="border-b bg-white">
          <Tabs value={viewMode} onValueChange={(value) => handleFiltersChange({ ...filters, view: value as ViewMode })}>
            <TabsList className="w-full">
              <TabsTrigger value="list" className="flex-1">
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
              <TabsTrigger value="map" className="flex-1">
                <Map className="h-4 w-4 mr-2" />
                Map
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {viewMode === 'list' ? (
            <ListPane
              listings={listings}
              isLoading={isLoading}
              error={error}
              onHover={setHoveredId}
              onSave={handleSave}
              onShare={handleShare}
              onReport={handleReport}
              onBroadenLocation={handleBroadenLocation}
              onLowerCompatibility={handleLowerCompatibility}
              onCreateAlert={handleCreateAlert}
              onClearFilters={handleClearFilters}
              hasFilters={hasFilters}
              savedListings={savedListings}
              highlightedId={hoveredId}
            />
          ) : (
            <MapPane
              listings={listings}
              campusCoords={userCampusCoords}
              onHover={setHoveredId}
              onViewportChange={() => {}}
              onListingClick={(id) => router.push(`/housing/${id}`)}
              highlightedId={hoveredId}
              className="h-[calc(100vh-280px)] sm:h-[600px]"
            />
          )}
        </div>
      </div>
    )
  }

  // Desktop split view
  return (
    <div className="min-h-screen bg-gray-50 pb-safe-bottom md:pb-0">
      {/* Toolbar */}
      <Toolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSaveSearch={handleSaveSearch}
        campusOptions={campusOptions}
        selectedCampusId={selectedCampusId}
        onCampusChange={handleCampusChange}
      />

      {/* Split layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* List pane */}
          <div className="overflow-y-auto">
            <ListPane
              listings={listings}
              isLoading={isLoading}
              error={error}
              onHover={setHoveredId}
              onSave={handleSave}
              onShare={handleShare}
              onReport={handleReport}
              onBroadenLocation={handleBroadenLocation}
              onLowerCompatibility={handleLowerCompatibility}
              onCreateAlert={handleCreateAlert}
              onClearFilters={handleClearFilters}
              hasFilters={hasFilters}
              savedListings={savedListings}
              highlightedId={hoveredId}
            />
          </div>

          {/* Map pane */}
          <div className="hidden lg:block">
            <MapPane
              listings={listings}
              campusCoords={userCampusCoords}
              onHover={setHoveredId}
              onViewportChange={() => {}}
              onListingClick={(id) => router.push(`/housing/${id}`)}
              highlightedId={hoveredId}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
