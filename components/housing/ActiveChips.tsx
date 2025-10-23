// Active Filter Chips Component
// Shows dismissible chips for active filters with clear all option

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Trash2 } from 'lucide-react'
import { FiltersState } from '@/types/housing'

interface ActiveChipsProps {
  filters: FiltersState
  onFiltersChange: (filters: FiltersState) => void
  onClearAll: () => void
}

export function ActiveChips({ filters, onFiltersChange, onClearAll }: ActiveChipsProps) {
  const chips = []

  // Search query
  if (filters.q) {
    chips.push({
      key: 'q',
      label: `"${filters.q}"`,
      onRemove: () => onFiltersChange({ ...filters, q: undefined })
    })
  }

  // Price range
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    const min = filters.priceMin || 0
    const max = filters.priceMax || '∞'
    chips.push({
      key: 'price',
      label: `€${min} - €${max}`,
      onRemove: () => onFiltersChange({ 
        ...filters, 
        priceMin: undefined, 
        priceMax: undefined 
      })
    })
  }

  // City
  if (filters.city) {
    chips.push({
      key: 'city',
      label: filters.city,
      onRemove: () => onFiltersChange({ ...filters, city: undefined })
    })
  }

  // Radius
  if (filters.radiusKm !== undefined) {
    chips.push({
      key: 'radius',
      label: `≤${filters.radiusKm}km`,
      onRemove: () => onFiltersChange({ ...filters, radiusKm: undefined })
    })
  }

  // Move-in dates
  if (filters.moveInFrom || filters.moveInTo) {
    const from = filters.moveInFrom ? new Date(filters.moveInFrom).toLocaleDateString() : 'Any'
    const to = filters.moveInTo ? new Date(filters.moveInTo).toLocaleDateString() : 'Any'
    chips.push({
      key: 'moveIn',
      label: `Move-in: ${from} - ${to}`,
      onRemove: () => onFiltersChange({ 
        ...filters, 
        moveInFrom: undefined, 
        moveInTo: undefined 
      })
    })
  }

  // Lease months
  if (filters.leaseMonths && filters.leaseMonths.length > 0) {
    chips.push({
      key: 'lease',
      label: `${filters.leaseMonths.join(', ')} months`,
      onRemove: () => onFiltersChange({ ...filters, leaseMonths: undefined })
    })
  }

  // Room types
  if (filters.roomTypes && filters.roomTypes.length > 0) {
    const labels = filters.roomTypes.map(type => {
      switch (type) {
        case 'room': return 'Private Room'
        case 'studio': return 'Studio'
        case 'apartment': return 'Apartment'
        default: return type
      }
    })
    chips.push({
      key: 'roomTypes',
      label: labels.join(', '),
      onRemove: () => onFiltersChange({ ...filters, roomTypes: undefined })
    })
  }

  // Boolean filters
  if (filters.furnished) {
    chips.push({
      key: 'furnished',
      label: 'Furnished',
      onRemove: () => onFiltersChange({ ...filters, furnished: undefined })
    })
  }

  if (filters.utilitiesIncluded) {
    chips.push({
      key: 'utilities',
      label: 'Utilities included',
      onRemove: () => onFiltersChange({ ...filters, utilitiesIncluded: undefined })
    })
  }

  if (filters.petsAllowed) {
    chips.push({
      key: 'pets',
      label: 'Pets allowed',
      onRemove: () => onFiltersChange({ ...filters, petsAllowed: undefined })
    })
  }

  // Smoking policy
  if (filters.smokingPolicy) {
    const labels = {
      none: 'No smoking',
      outdoor: 'Outdoor smoking',
      allowed: 'Smoking allowed'
    }
    chips.push({
      key: 'smoking',
      label: labels[filters.smokingPolicy],
      onRemove: () => onFiltersChange({ ...filters, smokingPolicy: undefined })
    })
  }

  // Accessibility
  if (filters.accessibility && filters.accessibility.length > 0) {
    const labels = filters.accessibility.map(acc => {
      switch (acc) {
        case 'elevator': return 'Elevator'
        case 'stepFree': return 'Step-free'
        case 'groundFloor': return 'Ground floor'
        default: return acc
      }
    })
    chips.push({
      key: 'accessibility',
      label: labels.join(', '),
      onRemove: () => onFiltersChange({ ...filters, accessibility: undefined })
    })
  }

  // University verified
  if (filters.universityVerifiedOnly) {
    chips.push({
      key: 'verified',
      label: 'University-verified',
      onRemove: () => onFiltersChange({ ...filters, universityVerifiedOnly: undefined })
    })
  }

  // Compatibility
  if (filters.minCompatibility !== undefined && filters.minCompatibility !== 70) {
    chips.push({
      key: 'compatibility',
      label: `≥${filters.minCompatibility}% match`,
      onRemove: () => onFiltersChange({ ...filters, minCompatibility: undefined })
    })
  }

  // Lifestyle filters
  if (filters.quietHours) {
    const labels = {
      strict: 'Strict quiet hours',
      normal: 'Normal quiet hours',
      flexible: 'Flexible quiet hours'
    }
    chips.push({
      key: 'quietHours',
      label: labels[filters.quietHours],
      onRemove: () => onFiltersChange({ ...filters, quietHours: undefined })
    })
  }

  if (filters.cleanlinessLevel) {
    const labels = {
      1: 'Very relaxed',
      2: 'Relaxed',
      3: 'Moderate',
      4: 'Strict',
      5: 'Very strict'
    }
    chips.push({
      key: 'cleanliness',
      label: `Cleanliness: ${labels[filters.cleanlinessLevel]}`,
      onRemove: () => onFiltersChange({ ...filters, cleanlinessLevel: undefined })
    })
  }

  if (filters.guestPolicy) {
    const labels = {
      rare: 'Rare guests',
      occasional: 'Occasional guests',
      frequent: 'Frequent guests'
    }
    chips.push({
      key: 'guests',
      label: labels[filters.guestPolicy],
      onRemove: () => onFiltersChange({ ...filters, guestPolicy: undefined })
    })
  }

  // Lifestyle tags
  if (filters.lifestyleTags && filters.lifestyleTags.length > 0) {
    chips.push({
      key: 'lifestyle',
      label: filters.lifestyleTags.join(', '),
      onRemove: () => onFiltersChange({ ...filters, lifestyleTags: undefined })
    })
  }

  if (chips.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500 mr-2">Active filters:</span>
      
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          <span>{chip.label}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      
      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          Clear all
        </Button>
      )}
    </div>
  )
}
