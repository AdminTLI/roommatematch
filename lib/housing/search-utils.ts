// Search utility functions
// Helper functions for generating search names and managing search state

import { FiltersState } from '@/types/housing'

export function generateSearchName(filters: FiltersState): string {
  const parts: string[] = []

  // City
  if (filters.city) {
    parts.push(filters.city)
  }

  // Price range
  if (filters.priceMin || filters.priceMax) {
    const min = filters.priceMin || 0
    const max = filters.priceMax || '∞'
    parts.push(`€${min}-${max}`)
  }

  // Room type
  if (filters.roomTypes && filters.roomTypes.length > 0) {
    const labels = filters.roomTypes.map(type => {
      switch (type) {
        case 'room': return 'Room'
        case 'studio': return 'Studio'
        case 'apartment': return 'Apartment'
        default: return type
      }
    })
    parts.push(labels.join(', '))
  }

  // University verified
  if (filters.universityVerifiedOnly) {
    parts.push('Verified')
  }

  // Compatibility
  if (filters.minCompatibility && filters.minCompatibility !== 70) {
    parts.push(`${filters.minCompatibility}%+ match`)
  }

  // Lease length
  if (filters.leaseMonths && filters.leaseMonths.length > 0) {
    parts.push(`${filters.leaseMonths.join(', ')} months`)
  }

  // Amenities
  if (filters.furnished) {
    parts.push('Furnished')
  }

  if (filters.utilitiesIncluded) {
    parts.push('Utilities incl')
  }

  if (filters.petsAllowed) {
    parts.push('Pet-friendly')
  }

  // If no specific criteria, use generic name
  if (parts.length === 0) {
    return 'My Housing Search'
  }

  return parts.join(', ')
}

export function getSearchSummary(filters: FiltersState): string {
  const criteria: string[] = []

  if (filters.q) {
    criteria.push(`Search: "${filters.q}"`)
  }

  if (filters.city) {
    criteria.push(`City: ${filters.city}`)
  }

  if (filters.priceMin || filters.priceMax) {
    const min = filters.priceMin || 0
    const max = filters.priceMax || '∞'
    criteria.push(`Price: €${min} - €${max}`)
  }

  if (filters.roomTypes && filters.roomTypes.length > 0) {
    criteria.push(`Room type: ${filters.roomTypes.join(', ')}`)
  }

  if (filters.universityVerifiedOnly) {
    criteria.push('University-verified only')
  }

  if (filters.minCompatibility && filters.minCompatibility !== 70) {
    criteria.push(`Min compatibility: ${filters.minCompatibility}%`)
  }

  if (filters.leaseMonths && filters.leaseMonths.length > 0) {
    criteria.push(`Lease: ${filters.leaseMonths.join(', ')} months`)
  }

  if (filters.furnished) {
    criteria.push('Furnished')
  }

  if (filters.utilitiesIncluded) {
    criteria.push('Utilities included')
  }

  if (filters.petsAllowed) {
    criteria.push('Pet-friendly')
  }

  if (filters.smokingPolicy) {
    criteria.push(`Smoking: ${filters.smokingPolicy}`)
  }

  if (filters.accessibility && filters.accessibility.length > 0) {
    criteria.push(`Accessibility: ${filters.accessibility.join(', ')}`)
  }

  if (filters.quietHours) {
    criteria.push(`Quiet hours: ${filters.quietHours}`)
  }

  if (filters.cleanlinessLevel) {
    criteria.push(`Cleanliness: ${filters.cleanlinessLevel}/5`)
  }

  if (filters.guestPolicy) {
    criteria.push(`Guests: ${filters.guestPolicy}`)
  }

  if (filters.lifestyleTags && filters.lifestyleTags.length > 0) {
    criteria.push(`Lifestyle: ${filters.lifestyleTags.join(', ')}`)
  }

  return criteria.length > 0 ? criteria.join(' • ') : 'No specific criteria'
}

export function getFilterCount(filters: FiltersState): number {
  let count = 0

  if (filters.q) count++
  if (filters.priceMin !== undefined) count++
  if (filters.priceMax !== undefined) count++
  if (filters.city) count++
  if (filters.radiusKm !== undefined) count++
  if (filters.moveInFrom) count++
  if (filters.moveInTo) count++
  if (filters.leaseMonths && filters.leaseMonths.length > 0) count++
  if (filters.roomTypes && filters.roomTypes.length > 0) count++
  if (filters.furnished !== undefined) count++
  if (filters.utilitiesIncluded !== undefined) count++
  if (filters.petsAllowed !== undefined) count++
  if (filters.smokingPolicy) count++
  if (filters.accessibility && filters.accessibility.length > 0) count++
  if (filters.campusId) count++
  if (filters.maxDistanceKm !== undefined) count++
  if (filters.universityVerifiedOnly) count++
  if (filters.minCompatibility !== undefined && filters.minCompatibility !== 70) count++
  if (filters.quietHours) count++
  if (filters.cleanlinessLevel !== undefined) count++
  if (filters.guestPolicy) count++
  if (filters.lifestyleTags && filters.lifestyleTags.length > 0) count++

  return count
}
