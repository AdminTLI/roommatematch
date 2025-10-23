// List Pane Component
// Virtualized list of housing listings with infinite scroll

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Listing } from '@/types/housing'
import { ListingCard } from './ListingCard'
import { ListSkeleton } from './Skeletons'
import { EmptyState } from './EmptyState'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface ListPaneProps {
  listings: Listing[]
  isLoading: boolean
  error?: string | null
  onHover: (id: string | null) => void
  onSave: (id: string) => void
  onShare: (id: string) => void
  onReport: (id: string) => void
  onBroadenLocation: () => void
  onLowerCompatibility: () => void
  onCreateAlert: () => void
  onClearFilters: () => void
  hasFilters: boolean
  savedListings: Set<string>
  highlightedId?: string
  className?: string
}

export function ListPane({
  listings,
  isLoading,
  error,
  onHover,
  onSave,
  onShare,
  onReport,
  onBroadenLocation,
  onLowerCompatibility,
  onCreateAlert,
  onClearFilters,
  hasFilters,
  savedListings,
  highlightedId,
  className = ''
}: ListPaneProps) {
  const [retryCount, setRetryCount] = useState(0)

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    // Trigger a re-fetch by updating a dependency
    window.location.reload()
  }, [])

  // Show loading state
  if (isLoading && listings.length === 0) {
    return (
      <div className={className}>
        <ListSkeleton count={6} />
      </div>
    )
  }

  // Show error state
  if (error && listings.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load listings
          </h3>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <Button onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    )
  }

  // Show empty state
  if (!isLoading && listings.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          onBroadenLocation={onBroadenLocation}
          onLowerCompatibility={onLowerCompatibility}
          onCreateAlert={onCreateAlert}
          onClearFilters={onClearFilters}
          hasFilters={hasFilters}
        />
      </div>
    )
  }

  // Show listings
  return (
    <div className={className}>
      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        {listings.length} {listings.length === 1 ? 'listing' : 'listings'} found
      </div>

      {/* Listings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onHover={onHover}
            onSave={onSave}
            onShare={onShare}
            onReport={onReport}
            isSaved={savedListings.has(listing.id)}
            isHighlighted={highlightedId === listing.id}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {isLoading && listings.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading more listings...</span>
          </div>
        </div>
      )}

      {/* Load more button (for pagination) */}
      {!isLoading && listings.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => {/* TODO: Implement pagination */}}>
            Load more listings
          </Button>
        </div>
      )}
    </div>
  )
}
