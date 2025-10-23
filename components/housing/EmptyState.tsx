// Empty State Component
// Shows when no listings match the current filters

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Home, 
  MapPin, 
  Filter, 
  Bell, 
  Search,
  RefreshCw
} from 'lucide-react'

interface EmptyStateProps {
  onBroadenLocation: () => void
  onLowerCompatibility: () => void
  onCreateAlert: () => void
  onClearFilters: () => void
  hasFilters: boolean
}

export function EmptyState({
  onBroadenLocation,
  onLowerCompatibility,
  onCreateAlert,
  onClearFilters,
  hasFilters
}: EmptyStateProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="text-center py-12">
        {/* Illustration */}
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Home className="h-12 w-12 text-gray-400" />
        </div>

        {/* Message */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No listings found
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We couldn't find any listings matching your current search criteria. 
          Try adjusting your filters or broadening your search.
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={onBroadenLocation}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Broaden location
            </Button>
            
            <Button
              variant="outline"
              onClick={onLowerCompatibility}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Lower compatibility
            </Button>
            
            <Button
              variant="outline"
              onClick={onCreateAlert}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Create alert
            </Button>
          </div>

          {hasFilters && (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                onClick={onClearFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Need help finding the right place? 
            <Button variant="link" className="p-0 h-auto text-primary">
              Contact our support team
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Alternative empty state for when there are no listings at all
export function NoListingsEmptyState() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="h-12 w-12 text-gray-400" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No listings available
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          There are currently no housing listings available. 
          Check back later or create an alert to be notified when new listings are added.
        </p>

        <Button className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Create alert for new listings
        </Button>
      </CardContent>
    </Card>
  )
}
