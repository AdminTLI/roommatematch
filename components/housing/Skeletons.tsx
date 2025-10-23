// Loading Skeleton Components
// Skeleton placeholders for listings and map while loading

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ListingCardSkeleton() {
  return (
    <Card className="border-2 border-gray-100">
      {/* Image skeleton */}
      <div className="relative h-48 bg-gray-200 rounded-t-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key details skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        {/* Amenities skeleton */}
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-16 rounded-full" />
          ))}
        </div>

        {/* Actions skeleton */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-8" />
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export function MapSkeleton() {
  return (
    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden relative">
      {/* Map placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 animate-pulse" />
      
      {/* Loading overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>

      {/* Mock controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="w-8 h-8 bg-white rounded shadow-lg animate-pulse" />
        <div className="w-8 h-8 bg-white rounded shadow-lg animate-pulse" />
      </div>

      {/* Mock legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 w-32">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ToolbarSkeleton() {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-3">
          {/* Search skeleton */}
          <div className="relative flex-1 max-w-md">
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Filter button skeleton */}
          <Skeleton className="h-10 w-20" />

          {/* Campus selector skeleton */}
          <Skeleton className="h-10 w-32" />

          {/* Sort skeleton */}
          <Skeleton className="h-10 w-32" />

          {/* View toggle skeleton */}
          <Skeleton className="h-10 w-24" />

          {/* Save search skeleton */}
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}
