// Housing Toolbar Component
// Sticky top bar with search, filters, active chips, sort, view toggle, and save search

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  SortAsc, 
  List, 
  Map, 
  LayoutGrid,
  Save,
  MapPin,
  ChevronDown
} from 'lucide-react'
import { FiltersState, ViewMode, SortOption } from '@/types/housing'
import { hasActiveFilters, clearAllFilters } from '@/lib/housing/url-sync'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'
import { FiltersDrawer } from './FiltersDrawer'
import { ActiveChips } from './ActiveChips'
import { SortDropdown } from './SortDropdown'
import { ViewToggle } from './ViewToggle'
import { SaveSearchDialog } from './SaveSearchDialog'

interface ToolbarProps {
  filters: FiltersState
  onFiltersChange: (filters: FiltersState) => void
  onSaveSearch: () => void
  campusOptions: Array<{ id: string; name: string }>
  selectedCampusId?: string
  onCampusChange: (campusId: string) => void
}

export function Toolbar({
  filters,
  onFiltersChange,
  onSaveSearch,
  campusOptions,
  selectedCampusId,
  onCampusChange
}: ToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(filters.q || '')
  const [showFilters, setShowFilters] = useState(false)
  const [showSaveSearch, setShowSaveSearch] = useState(false)
  
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Update URL when search changes
  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      const newFilters = { ...filters, q: debouncedSearch || undefined }
      onFiltersChange(newFilters)
    }
  }, [debouncedSearch, filters, onFiltersChange])

  const handleClearFilters = () => {
    const clearedFilters = clearAllFilters()
    onFiltersChange(clearedFilters)
    setSearchQuery('')
  }

  const handleCampusChange = (campusId: string) => {
    onCampusChange(campusId)
    const newFilters = { ...filters, campusId: campusId || undefined }
    onFiltersChange(newFilters)
  }

  const activeFiltersCount = hasActiveFilters(filters) ? 
    Object.values(filters).filter(value => 
      value !== undefined && 
      value !== null && 
      value !== '' && 
      !(Array.isArray(value) && value.length === 0)
    ).length : 0

  return (
    <>
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main toolbar */}
          <div className="flex items-center gap-3 py-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by title, city, or address..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Campus selector */}
            <div className="relative">
              <select
                value={selectedCampusId || ''}
                onChange={(e) => handleCampusChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All campuses</option>
                {campusOptions.map(campus => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort dropdown */}
            <SortDropdown
              value={filters.sort || 'best'}
              onChange={(sort) => onFiltersChange({ ...filters, sort })}
            />

            {/* View toggle */}
            <ViewToggle
              value={filters.view || 'split'}
              onChange={(view) => onFiltersChange({ ...filters, view })}
            />

            {/* Save search button */}
            <Button
              variant="outline"
              onClick={() => setShowSaveSearch(true)}
              className="hidden sm:flex"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </div>

          {/* Active filters chips */}
          {hasActiveFilters(filters) && (
            <div className="pb-3">
              <ActiveChips
                filters={filters}
                onFiltersChange={onFiltersChange}
                onClearAll={handleClearFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* Filters drawer */}
      <FiltersDrawer
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />

      {/* Save search dialog */}
      <SaveSearchDialog
        open={showSaveSearch}
        onOpenChange={setShowSaveSearch}
        filters={filters}
        onSave={onSaveSearch}
      />
    </>
  )
}
