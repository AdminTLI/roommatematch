'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { FiltersState } from '@/types/housing'
import { clearAllFilters } from '@/lib/housing/url-sync'
import { FiltersDrawer } from './FiltersDrawer'
import { ActiveChips } from './ActiveChips'
import { SortDropdown } from './SortDropdown'
import { ViewToggle } from './ViewToggle'
import { SaveSearchDialog } from './SaveSearchDialog'
import {
  FilterPill,
  FilterPopoverFooter,
  OptionChip,
} from './FilterPill'
import { cn } from '@/lib/utils'
import {
  formatNlDateShort,
  formatPriceRangeLabel,
} from '@/lib/housing/format'

interface ToolbarProps {
  filters: FiltersState
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  onFiltersChange: (
    filters: FiltersState | ((prev: FiltersState) => FiltersState)
  ) => void
  onSaveSearch: () => void
  campusOptions: Array<{ id: string; name: string }>
  selectedCampusId?: string
  onCampusChange: (campusId: string) => void
}

const PRICE_PRESETS = [
  { label: 'Under €600', min: undefined, max: 600 },
  { label: '€600–€900', min: 600, max: 900 },
  { label: '€900–€1.200', min: 900, max: 1200 },
  { label: '€1.200+', min: 1200, max: undefined },
] as const

const ROOM_TYPES = [
  { value: 'room' as const, label: 'Private room' },
  { value: 'studio' as const, label: 'Studio' },
  { value: 'apartment' as const, label: 'Apartment' },
  { value: 'shared' as const, label: 'Shared house' },
]

function countContentFilters(
  filters: FiltersState,
  selectedCampusId?: string,
  searchQuery?: string
) {
  let count = 0
  if (searchQuery?.trim()) count += 1
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) count += 1
  if (filters.city) count += 1
  if (filters.address) count += 1
  if (filters.radiusKm !== undefined) count += 1
  if (filters.moveInFrom || filters.moveInTo) count += 1
  if (filters.leaseMonths?.length) count += 1
  if (filters.roomTypes?.length) count += 1
  if (filters.furnished) count += 1
  if (filters.utilitiesIncluded) count += 1
  if (filters.petsAllowed) count += 1
  if (filters.smokingPolicy) count += 1
  if (filters.accessibility?.length) count += 1
  if (selectedCampusId || filters.campusId) count += 1
  if (filters.maxDistanceKm !== undefined) count += 1
  if (filters.universityVerifiedOnly) count += 1
  if (
    filters.minCompatibility !== undefined &&
    filters.minCompatibility !== 70
  ) {
    count += 1
  }
  if (filters.quietHours) count += 1
  if (filters.cleanlinessLevel) count += 1
  if (filters.guestPolicy) count += 1
  if (filters.lifestyleTags?.length) count += 1
  return count
}

function priceSummary(filters: FiltersState) {
  return formatPriceRangeLabel(filters.priceMin, filters.priceMax)
}

function roomTypeSummary(filters: FiltersState) {
  if (!filters.roomTypes?.length) return undefined
  if (filters.roomTypes.length === 1) {
    return (
      ROOM_TYPES.find((t) => t.value === filters.roomTypes![0])?.label ||
      'Type'
    )
  }
  return `${filters.roomTypes.length} types`
}

function moveInSummary(filters: FiltersState) {
  if (!filters.moveInFrom && !filters.moveInTo) return undefined
  if (filters.moveInFrom && filters.moveInTo) {
    return `${formatNlDateShort(filters.moveInFrom)} – ${formatNlDateShort(filters.moveInTo)}`
  }
  if (filters.moveInFrom) return `From ${formatNlDateShort(filters.moveInFrom)}`
  return `Until ${formatNlDateShort(filters.moveInTo!)}`
}

export function Toolbar({
  filters,
  searchQuery,
  onSearchQueryChange,
  onFiltersChange,
  onSaveSearch,
  campusOptions,
  selectedCampusId,
  onCampusChange,
}: ToolbarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showSaveSearch, setShowSaveSearch] = useState(false)
  const [openPill, setOpenPill] = useState<string | null>(null)

  const [draftPriceMin, setDraftPriceMin] = useState<string>('')
  const [draftPriceMax, setDraftPriceMax] = useState<string>('')
  const [draftMoveInFrom, setDraftMoveInFrom] = useState('')
  const [draftMoveInTo, setDraftMoveInTo] = useState('')

  const activeCount = useMemo(
    () => countContentFilters(filters, selectedCampusId, searchQuery),
    [filters, selectedCampusId, searchQuery]
  )

  const selectedCampusName = campusOptions.find(
    (c) => c.id === selectedCampusId
  )?.name

  const handleClearFilters = () => {
    onFiltersChange(clearAllFilters())
    onSearchQueryChange('')
    onCampusChange('')
    setOpenPill(null)
  }

  const openPrice = (open: boolean) => {
    if (open) {
      setDraftPriceMin(filters.priceMin?.toString() ?? '')
      setDraftPriceMax(filters.priceMax?.toString() ?? '')
      setOpenPill('price')
    } else {
      setOpenPill((prev) => (prev === 'price' ? null : prev))
    }
  }

  const openMoveIn = (open: boolean) => {
    if (open) {
      setDraftMoveInFrom(filters.moveInFrom ?? '')
      setDraftMoveInTo(filters.moveInTo ?? '')
      setOpenPill('moveIn')
    } else {
      setOpenPill((prev) => (prev === 'moveIn' ? null : prev))
    }
  }

  const applyPrice = () => {
    const min = draftPriceMin ? parseInt(draftPriceMin, 10) : undefined
    const max = draftPriceMax ? parseInt(draftPriceMax, 10) : undefined
    onFiltersChange((prev) => ({
      ...prev,
      priceMin: Number.isFinite(min) ? min : undefined,
      priceMax: Number.isFinite(max) ? max : undefined,
    }))
    setOpenPill(null)
  }

  const applyMoveIn = () => {
    onFiltersChange((prev) => ({
      ...prev,
      moveInFrom: draftMoveInFrom || undefined,
      moveInTo: draftMoveInTo || undefined,
    }))
    setOpenPill(null)
  }

  const toggleRoomType = (value: 'room' | 'studio' | 'apartment' | 'shared') => {
    onFiltersChange((prev) => {
      const current = prev.roomTypes || []
      const next = current.includes(value)
        ? current.filter((t) => t !== value)
        : [...current, value]
      return {
        ...prev,
        roomTypes: next.length ? next : undefined,
      }
    })
  }

  const fieldClass =
    'h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white'

  return (
    <>
      <div className="space-y-3">
        {/* Search + secondary controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              placeholder="Search by title, city, or address"
              className={cn(
                fieldClass,
                'h-11 rounded-2xl pl-10 pr-10'
              )}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
            {searchQuery ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchQueryChange('')}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200 hover:text-ink-700 dark:hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <SortDropdown
              value={filters.sort || 'best'}
              onChange={(sort) =>
                onFiltersChange((prev) =>
                  prev.sort === sort ? prev : { ...prev, sort }
                )
              }
            />
            <ViewToggle
              value={filters.view || 'split'}
              onChange={(view) =>
                onFiltersChange((prev) =>
                  prev.view === view ? prev : { ...prev, view }
                )
              }
            />
          </div>
        </div>

        {/* Quick filters — Airbnb / Funda style pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterPill
            label="Price"
            summary={priceSummary(filters)}
            active={
              filters.priceMin !== undefined || filters.priceMax !== undefined
            }
            open={openPill === 'price'}
            onOpenChange={openPrice}
          >
            <div className="space-y-4 p-4">
              <div>
                <p className="text-sm font-medium text-ink-900 dark:text-white">
                  Monthly rent
                </p>
                <p className="mt-0.5 text-sm text-ink-500">
                  Set a range that fits your budget
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1.5">
                  <span className="text-sm text-ink-500">Min</span>
                  <div className="flex h-10 w-full items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 transition focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5">
                    <span className="shrink-0 text-sm text-ink-400">€</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="0"
                      value={draftPriceMin}
                      onChange={(e) => setDraftPriceMin(e.target.value)}
                      className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-white"
                    />
                  </div>
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm text-ink-500">Max</span>
                  <div className="flex h-10 w-full items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 transition focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5">
                    <span className="shrink-0 text-sm text-ink-400">€</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="Any"
                      value={draftPriceMax}
                      onChange={(e) => setDraftPriceMax(e.target.value)}
                      className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-white"
                    />
                  </div>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRICE_PRESETS.map((preset) => {
                  const selected =
                    draftPriceMin === (preset.min?.toString() ?? '') &&
                    draftPriceMax === (preset.max?.toString() ?? '')
                  return (
                    <OptionChip
                      key={preset.label}
                      selected={selected}
                      onClick={() => {
                        setDraftPriceMin(preset.min?.toString() ?? '')
                        setDraftPriceMax(preset.max?.toString() ?? '')
                      }}
                    >
                      {preset.label}
                    </OptionChip>
                  )
                })}
              </div>
            </div>
            <FilterPopoverFooter
              canClear={Boolean(draftPriceMin || draftPriceMax)}
              onClear={() => {
                setDraftPriceMin('')
                setDraftPriceMax('')
                onFiltersChange((prev) => ({
                  ...prev,
                  priceMin: undefined,
                  priceMax: undefined,
                }))
                setOpenPill(null)
              }}
              onApply={applyPrice}
            />
          </FilterPill>

          <FilterPill
            label="Type"
            summary={roomTypeSummary(filters)}
            active={Boolean(filters.roomTypes?.length)}
            open={openPill === 'type'}
            onOpenChange={(open) => setOpenPill(open ? 'type' : null)}
          >
            <div className="space-y-4 p-4">
              <div>
                <p className="text-sm font-medium text-ink-900 dark:text-white">
                  Home type
                </p>
                <p className="mt-0.5 text-sm text-ink-500">
                  Select one or more
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ROOM_TYPES.map((type) => (
                  <OptionChip
                    key={type.value}
                    selected={Boolean(filters.roomTypes?.includes(type.value))}
                    onClick={() => toggleRoomType(type.value)}
                  >
                    {type.label}
                  </OptionChip>
                ))}
              </div>
            </div>
            <FilterPopoverFooter
              canClear={Boolean(filters.roomTypes?.length)}
              onClear={() => {
                onFiltersChange((prev) => ({
                  ...prev,
                  roomTypes: undefined,
                }))
                setOpenPill(null)
              }}
              onApply={() => setOpenPill(null)}
              applyLabel="Done"
            />
          </FilterPill>

          <FilterPill
            label="Move-in"
            summary={moveInSummary(filters)}
            active={Boolean(filters.moveInFrom || filters.moveInTo)}
            open={openPill === 'moveIn'}
            onOpenChange={openMoveIn}
          >
            <div className="space-y-4 p-4">
              <div>
                <p className="text-sm font-medium text-ink-900 dark:text-white">
                  Move-in window
                </p>
                <p className="mt-0.5 text-sm text-ink-500">
                  When do you want to start?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1.5">
                  <span className="text-sm text-ink-500">From</span>
                  <input
                    type="date"
                    value={draftMoveInFrom}
                    onChange={(e) => setDraftMoveInFrom(e.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm text-ink-500">To</span>
                  <input
                    type="date"
                    value={draftMoveInTo}
                    onChange={(e) => setDraftMoveInTo(e.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>
            </div>
            <FilterPopoverFooter
              canClear={Boolean(draftMoveInFrom || draftMoveInTo)}
              onClear={() => {
                setDraftMoveInFrom('')
                setDraftMoveInTo('')
                onFiltersChange((prev) => ({
                  ...prev,
                  moveInFrom: undefined,
                  moveInTo: undefined,
                }))
                setOpenPill(null)
              }}
              onApply={applyMoveIn}
            />
          </FilterPill>

          {campusOptions.length > 0 ? (
            <FilterPill
              label="Campus"
              summary={selectedCampusName}
              active={Boolean(selectedCampusId)}
              open={openPill === 'campus'}
              onOpenChange={(open) => setOpenPill(open ? 'campus' : null)}
              contentClassName="w-72"
            >
              <div className="space-y-1 p-2">
                <button
                  type="button"
                  onClick={() => {
                    onCampusChange('')
                    setOpenPill(null)
                  }}
                  className={cn(
                    'flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition',
                    !selectedCampusId
                      ? 'bg-zinc-100 font-medium text-ink-900 dark:bg-white/10 dark:text-white'
                      : 'text-ink-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5'
                  )}
                >
                  All campuses
                </button>
                {campusOptions.map((campus) => (
                  <button
                    key={campus.id}
                    type="button"
                    onClick={() => {
                      onCampusChange(campus.id)
                      setOpenPill(null)
                    }}
                    className={cn(
                      'flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition',
                      selectedCampusId === campus.id
                        ? 'bg-zinc-100 font-medium text-ink-900 dark:bg-white/10 dark:text-white'
                        : 'text-ink-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5'
                    )}
                  >
                    {campus.name}
                  </button>
                ))}
              </div>
            </FilterPill>
          ) : null}

          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 text-sm font-medium text-ink-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-900 px-1.5 text-sm font-medium text-white dark:bg-white dark:text-ink-900">
                {activeCount}
              </span>
            ) : null}
          </button>

          {activeCount > 0 ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="hidden h-9 shrink-0 items-center rounded-full px-3 text-sm font-medium text-ink-500 transition hover:text-ink-900 sm:inline-flex dark:hover:text-white"
            >
              Clear all
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setShowSaveSearch(true)}
            className="ml-auto hidden h-9 shrink-0 items-center rounded-full px-3 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 sm:inline-flex dark:text-indigo-400 dark:hover:bg-indigo-950/40"
          >
            Save search
          </button>
        </div>

        {activeCount > 0 ? (
          <ActiveChips
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClearAll={handleClearFilters}
            selectedCampusId={selectedCampusId}
            campusName={selectedCampusName}
            onCampusClear={() => onCampusChange('')}
            searchQuery={searchQuery}
            onSearchClear={() => onSearchQueryChange('')}
          />
        ) : null}
      </div>

      <FiltersDrawer
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />

      {showSaveSearch ? (
        <SaveSearchDialog
          open={showSaveSearch}
          onOpenChange={setShowSaveSearch}
          filters={filters}
          onSave={onSaveSearch}
        />
      ) : null}
    </>
  )
}
