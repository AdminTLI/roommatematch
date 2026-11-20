'use client'

import { X } from 'lucide-react'
import { FiltersState } from '@/types/housing'
import {
  formatNlDateShort,
  formatPriceRangeLabel,
} from '@/lib/housing/format'

interface ActiveChipsProps {
  filters: FiltersState
  onFiltersChange: (
    filters: FiltersState | ((prev: FiltersState) => FiltersState)
  ) => void
  onClearAll: () => void
  selectedCampusId?: string
  campusName?: string
  onCampusClear?: () => void
  searchQuery?: string
  onSearchClear?: () => void
}

type Chip = {
  key: string
  label: string
  onRemove: () => void
}

export function ActiveChips({
  filters,
  onFiltersChange,
  onClearAll,
  selectedCampusId,
  campusName,
  onCampusClear,
  searchQuery,
  onSearchClear,
}: ActiveChipsProps) {
  const chips: Chip[] = []

  if (searchQuery?.trim()) {
    chips.push({
      key: 'q',
      label: `"${searchQuery.trim()}"`,
      onRemove: () => {
        onSearchClear?.()
        onFiltersChange({ ...filters, q: undefined })
      },
    })
  } else if (filters.q) {
    chips.push({
      key: 'q',
      label: `"${filters.q}"`,
      onRemove: () => onFiltersChange({ ...filters, q: undefined }),
    })
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    chips.push({
      key: 'price',
      label:
        formatPriceRangeLabel(filters.priceMin, filters.priceMax) || 'Price',
      onRemove: () =>
        onFiltersChange({
          ...filters,
          priceMin: undefined,
          priceMax: undefined,
        }),
    })
  }

  if (selectedCampusId && campusName) {
    chips.push({
      key: 'campus',
      label: campusName,
      onRemove: () => onCampusClear?.(),
    })
  }

  if (filters.city) {
    chips.push({
      key: 'city',
      label: filters.city,
      onRemove: () => onFiltersChange({ ...filters, city: undefined }),
    })
  }

  if (filters.address) {
    chips.push({
      key: 'address',
      label: filters.address,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          address: undefined,
          lat: undefined,
          lng: undefined,
        }),
    })
  }

  if (filters.radiusKm !== undefined) {
    chips.push({
      key: 'radius',
      label: `Within ${filters.radiusKm} km`,
      onRemove: () => onFiltersChange({ ...filters, radiusKm: undefined }),
    })
  }

  if (filters.moveInFrom || filters.moveInTo) {
    let label = 'Move-in'
    if (filters.moveInFrom && filters.moveInTo) {
      label = `${formatNlDateShort(filters.moveInFrom)} – ${formatNlDateShort(filters.moveInTo)}`
    } else if (filters.moveInFrom) {
      label = `From ${formatNlDateShort(filters.moveInFrom)}`
    } else if (filters.moveInTo) {
      label = `Until ${formatNlDateShort(filters.moveInTo)}`
    }
    chips.push({
      key: 'moveIn',
      label,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          moveInFrom: undefined,
          moveInTo: undefined,
        }),
    })
  }

  if (filters.leaseMonths?.length) {
    const leaseLabel = filters.leaseMonths
      .map((months) => (months === 24 ? '12+' : String(months)))
      .join(', ')
    chips.push({
      key: 'lease',
      label: `${leaseLabel} mo`,
      onRemove: () => onFiltersChange({ ...filters, leaseMonths: undefined }),
    })
  }

  if (filters.roomTypes?.length) {
    const labels = filters.roomTypes.map((type) => {
      switch (type) {
        case 'room':
          return 'Private room'
        case 'studio':
          return 'Studio'
        case 'apartment':
          return 'Apartment'
        case 'shared':
          return 'Shared house'
        default:
          return type
      }
    })
    chips.push({
      key: 'roomTypes',
      label: labels.join(', '),
      onRemove: () => onFiltersChange({ ...filters, roomTypes: undefined }),
    })
  }

  if (filters.furnished) {
    chips.push({
      key: 'furnished',
      label: 'Furnished',
      onRemove: () => onFiltersChange({ ...filters, furnished: undefined }),
    })
  }

  if (filters.utilitiesIncluded) {
    chips.push({
      key: 'utilities',
      label: 'Utilities included',
      onRemove: () =>
        onFiltersChange({ ...filters, utilitiesIncluded: undefined }),
    })
  }

  if (filters.petsAllowed) {
    chips.push({
      key: 'pets',
      label: 'Pets allowed',
      onRemove: () => onFiltersChange({ ...filters, petsAllowed: undefined }),
    })
  }

  if (filters.smokingPolicy) {
    const labels = {
      none: 'No smoking',
      outdoor: 'Outdoor smoking',
      allowed: 'Smoking allowed',
    }
    chips.push({
      key: 'smoking',
      label: labels[filters.smokingPolicy],
      onRemove: () =>
        onFiltersChange({ ...filters, smokingPolicy: undefined }),
    })
  }

  if (filters.accessibility?.length) {
    const labels = filters.accessibility.map((acc) => {
      switch (acc) {
        case 'elevator':
          return 'Elevator'
        case 'stepFree':
          return 'Step-free'
        case 'groundFloor':
          return 'Ground floor'
        default:
          return acc
      }
    })
    chips.push({
      key: 'accessibility',
      label: labels.join(', '),
      onRemove: () =>
        onFiltersChange({ ...filters, accessibility: undefined }),
    })
  }

  if (filters.universityVerifiedOnly) {
    chips.push({
      key: 'verified',
      label: 'Verified only',
      onRemove: () =>
        onFiltersChange({ ...filters, universityVerifiedOnly: undefined }),
    })
  }

  if (
    filters.minCompatibility !== undefined &&
    filters.minCompatibility !== 70
  ) {
    chips.push({
      key: 'compatibility',
      label: `≥${filters.minCompatibility}% match`,
      onRemove: () =>
        onFiltersChange({ ...filters, minCompatibility: undefined }),
    })
  }

  if (filters.quietHours) {
    const labels = {
      strict: 'Strict quiet hours',
      normal: 'Normal quiet hours',
      flexible: 'Flexible quiet hours',
    }
    chips.push({
      key: 'quietHours',
      label: labels[filters.quietHours],
      onRemove: () => onFiltersChange({ ...filters, quietHours: undefined }),
    })
  }

  if (filters.cleanlinessLevel) {
    const labels: Record<number, string> = {
      1: 'Relaxed cleanliness',
      2: 'Relaxed cleanliness',
      3: 'Moderate cleanliness',
      4: 'Strict cleanliness',
      5: 'Strict cleanliness',
    }
    chips.push({
      key: 'cleanliness',
      label: labels[filters.cleanlinessLevel] || 'Cleanliness',
      onRemove: () =>
        onFiltersChange({ ...filters, cleanlinessLevel: undefined }),
    })
  }

  if (filters.guestPolicy) {
    const labels = {
      rare: 'Rare guests',
      occasional: 'Occasional guests',
      frequent: 'Frequent guests',
    }
    chips.push({
      key: 'guests',
      label: labels[filters.guestPolicy],
      onRemove: () => onFiltersChange({ ...filters, guestPolicy: undefined }),
    })
  }

  if (filters.lifestyleTags?.length) {
    chips.push({
      key: 'lifestyle',
      label: filters.lifestyleTags.join(', '),
      onRemove: () =>
        onFiltersChange({ ...filters, lifestyleTags: undefined }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          aria-label={`Remove ${chip.label} filter`}
          className="group inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 pl-3 pr-2 text-sm text-ink-700 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
        >
          <span className="truncate">{chip.label}</span>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-ink-400 transition group-hover:bg-zinc-200 group-hover:text-ink-700 dark:group-hover:bg-white/10 dark:group-hover:text-white">
            <X className="h-3 w-3" />
          </span>
        </button>
      ))}

      {chips.length > 1 ? (
        <button
          type="button"
          onClick={onClearAll}
          className="h-8 px-2 text-sm font-medium text-ink-500 transition hover:text-ink-900 dark:hover:text-white"
        >
          Clear all
        </button>
      ) : null}
    </div>
  )
}
