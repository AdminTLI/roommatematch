'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Listing, FiltersState, ViewMode, Coords } from '@/types/housing'
import './leaflet.css'
import { filtersToSearchParams, getDefaultFilters } from '@/lib/housing/url-sync'
import { queryKeys } from '@/app/providers'
import { Toolbar } from '@/components/housing/Toolbar'
import { ListPane } from '@/components/housing/ListPane'
import { MapPane } from '@/components/housing/MapPane'
import { ReportListingDialog } from '@/components/housing/ReportListingDialog'
import { List, Map } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  readSavedListingIds,
  toggleSavedListingId,
} from '@/lib/housing/saved-listings'

interface HousingPageClientProps {
  initialListings: Listing[]
  initialFilters: FiltersState
  campusOptions: Array<{ id: string; name: string }>
  userCampusId?: string
  userCampusCoords?: Coords
}

function stableFilterKey(filters: FiltersState): string {
  return JSON.stringify(filters)
}

export function HousingPageClient({
  initialListings,
  initialFilters,
  campusOptions,
  userCampusId,
  userCampusCoords,
}: HousingPageClientProps) {
  const router = useRouter()

  const [filters, setFilters] = useState<FiltersState>(() => ({
    sort: initialFilters.sort || 'best',
    view: initialFilters.view || 'split',
    page: 1,
  }))
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQ, setDebouncedQ] = useState<string | undefined>(undefined)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set())
  const [selectedCampusId, setSelectedCampusId] = useState<string | undefined>(userCampusId)
  const [reportId, setReportId] = useState<string | null>(null)

  // Debounce search text only (primitive) - never debounce the whole filters object
  useEffect(() => {
    const t = setTimeout(() => {
      const next = searchQuery.trim() || undefined
      setDebouncedQ((prev) => (prev === next ? prev : next))
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const effectiveFilters = useMemo<FiltersState>(
    () => ({
      ...filters,
      q: debouncedQ,
      campusId: selectedCampusId,
    }),
    [filters, debouncedQ, selectedCampusId]
  )

  const filterKey = useMemo(() => stableFilterKey(effectiveFilters), [effectiveFilters])

  // Clear leftover default query junk from older builds (?sort=best&view=split)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    let dirty = false
    if (params.get('sort') === 'best') {
      params.delete('sort')
      dirty = true
    }
    if (params.get('view') === 'split') {
      params.delete('view')
      dirty = true
    }
    if (params.get('universityVerifiedOnly') === 'false') {
      params.delete('universityVerifiedOnly')
      dirty = true
    }
    if (params.get('minCompatibility') === '70') {
      params.delete('minCompatibility')
      dirty = true
    }
    if (!dirty) return
    const next = params.toString()
    const path = next ? `${window.location.pathname}?${next}` : window.location.pathname
    window.history.replaceState({}, '', path)
  }, [])

  const fetchListings = useCallback(async (): Promise<Listing[]> => {
    const params = filtersToSearchParams(JSON.parse(filterKey) as FiltersState)
    const response = await fetch(`/api/housing/listings?${params.toString()}`)
    if (!response.ok) throw new Error('Failed to fetch listings')
    const data = await response.json()
    return data.items || []
  }, [filterKey])

  const {
    data: listings = initialListings,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.housingListings({ key: filterKey }),
    queryFn: fetchListings,
    staleTime: 30_000,
  })

  const errorMessage =
    queryError instanceof Error
      ? queryError.message
      : typeof queryError === 'string'
        ? queryError
        : null

  const handleFiltersChange = useCallback(
    (next: FiltersState | ((prev: FiltersState) => FiltersState)) => {
      setFilters((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        if (stableFilterKey(resolved) === stableFilterKey(prev)) return prev
        return resolved
      })
    },
    []
  )

  useEffect(() => {
    setSavedListings(new Set(readSavedListingIds()))
  }, [])

  const handleSave = useCallback((id: string) => {
    const next = toggleSavedListingId(id)
    setSavedListings(new Set(next))
    if (next.includes(id)) {
      toast.success('Saved', {
        action: {
          label: 'View saved',
          onClick: () => router.push('/housing/saved'),
        },
      })
    }
  }, [router])

  const handleShare = useCallback(async (id: string) => {
    const url = `${window.location.origin}/housing/${id}`
    try {
      if (navigator.share) await navigator.share({ title: 'Domu housing', url })
      else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied')
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied')
      } catch {
        toast.error('Could not share')
      }
    }
  }, [])

  const viewMode = filters.view || 'split'
  const hasFilters = Boolean(debouncedQ || selectedCampusId || filters.priceMin || filters.priceMax || filters.city)

  const reportDialog = reportId ? (
    <ReportListingDialog
      open
      onOpenChange={(open) => !open && setReportId(null)}
      listingId={reportId}
      listingTitle={listings.find((l) => l.id === reportId)?.title || 'Listing'}
    />
  ) : null

  const toolbar = (
    <Toolbar
      filters={filters}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onFiltersChange={handleFiltersChange}
      onSaveSearch={() => toast.message('Use Filters to refine, then Save Search')}
      campusOptions={campusOptions}
      selectedCampusId={selectedCampusId}
      onCampusChange={setSelectedCampusId}
    />
  )

  const listPane = (
    <ListPane
      listings={listings}
      isLoading={isLoading}
      error={errorMessage}
      onHover={setHoveredId}
      onSave={handleSave}
      onShare={handleShare}
      onReport={setReportId}
      onBroadenLocation={() =>
        handleFiltersChange((prev) => ({
          ...prev,
          maxDistanceKm: undefined,
          radiusKm: undefined,
        }))
      }
      onLowerCompatibility={() =>
        handleFiltersChange((prev) => ({ ...prev, minCompatibility: undefined }))
      }
      onCreateAlert={() => toast.message('Use Save Search in the toolbar')}
      onClearFilters={() => {
        setFilters(getDefaultFilters())
        setSearchQuery('')
        setSelectedCampusId(undefined)
      }}
      hasFilters={hasFilters}
      savedListings={savedListings}
      highlightedId={hoveredId ?? undefined}
      layout={viewMode === 'split' ? 'split' : 'list'}
    />
  )

  return (
    <div className="space-y-6 pb-safe-bottom md:pb-0">
      {toolbar}

      {(viewMode === 'list' || viewMode === 'map') && (
        <div className="flex overflow-hidden rounded-2xl bg-zinc-100 p-1 dark:bg-white/5 sm:hidden">
          {(
            [
              ['list', 'List', List],
              ['map', 'Map', Map],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition',
                viewMode === id
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              )}
              onClick={() =>
                handleFiltersChange((prev) => ({ ...prev, view: id as ViewMode }))
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {viewMode === 'split' && (
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Housing discovery
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
            Ranked for how you live
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Best for you first - map synced with fit. Unverified hosts stay browse-only.
          </p>
        </div>
      )}

      {viewMode === 'map' ? (
        <MapPane
          listings={listings}
          campusCoords={userCampusCoords}
          onHover={setHoveredId}
          onViewportChange={() => {}}
          onListingClick={(id) => router.push(`/housing/${id}`)}
          highlightedId={hoveredId ?? undefined}
          className="h-[calc(100vh-280px)] sm:h-[600px]"
        />
      ) : viewMode === 'list' ? (
        listPane
      ) : (
        <div className="grid h-[calc(100vh-220px)] grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Padding so hover/focus outlines are not clipped by the scrollport */}
          <div className="overflow-y-auto overflow-x-visible px-1 py-1">{listPane}</div>
          <div className="hidden min-h-0 lg:block">
            <MapPane
              listings={listings}
              campusCoords={userCampusCoords}
              onHover={setHoveredId}
              onViewportChange={() => {}}
              onListingClick={(id) => router.push(`/housing/${id}`)}
              highlightedId={hoveredId ?? undefined}
              className="h-full"
            />
          </div>
        </div>
      )}

      {reportDialog}
    </div>
  )
}
