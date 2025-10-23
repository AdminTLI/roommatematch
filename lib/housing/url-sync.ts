// URL Sync Utilities for Housing Filters
// Handles serialization of FiltersState to/from URL search params

import { FiltersState, SortOption, ViewMode } from '@/types/housing'

export function filtersToSearchParams(filters: FiltersState): URLSearchParams {
  const params = new URLSearchParams()

  // Search query
  if (filters.q) {
    params.set('q', filters.q)
  }

  // Price range
  if (filters.priceMin !== undefined) {
    params.set('priceMin', filters.priceMin.toString())
  }
  if (filters.priceMax !== undefined) {
    params.set('priceMax', filters.priceMax.toString())
  }

  // Location
  if (filters.city) {
    params.set('city', filters.city)
  }
  if (filters.radiusKm !== undefined) {
    params.set('radiusKm', filters.radiusKm.toString())
  }

  // Move-in dates
  if (filters.moveInFrom) {
    params.set('moveInFrom', filters.moveInFrom)
  }
  if (filters.moveInTo) {
    params.set('moveInTo', filters.moveInTo)
  }

  // Lease months (array)
  if (filters.leaseMonths && filters.leaseMonths.length > 0) {
    params.set('leaseMonths', filters.leaseMonths.join(','))
  }

  // Room types (array)
  if (filters.roomTypes && filters.roomTypes.length > 0) {
    params.set('roomTypes', filters.roomTypes.join(','))
  }

  // Boolean filters
  if (filters.furnished !== undefined) {
    params.set('furnished', filters.furnished.toString())
  }
  if (filters.utilitiesIncluded !== undefined) {
    params.set('utilitiesIncluded', filters.utilitiesIncluded.toString())
  }
  if (filters.petsAllowed !== undefined) {
    params.set('petsAllowed', filters.petsAllowed.toString())
  }

  // Smoking policy
  if (filters.smokingPolicy) {
    params.set('smokingPolicy', filters.smokingPolicy)
  }

  // Accessibility (array)
  if (filters.accessibility && filters.accessibility.length > 0) {
    params.set('accessibility', filters.accessibility.join(','))
  }

  // Campus and distance
  if (filters.campusId) {
    params.set('campusId', filters.campusId)
  }
  if (filters.maxDistanceKm !== undefined) {
    params.set('maxDistanceKm', filters.maxDistanceKm.toString())
  }

  // University verified
  if (filters.universityVerifiedOnly !== undefined) {
    params.set('universityVerifiedOnly', filters.universityVerifiedOnly.toString())
  }

  // Compatibility
  if (filters.minCompatibility !== undefined) {
    params.set('minCompatibility', filters.minCompatibility.toString())
  }
  if (filters.quietHours) {
    params.set('quietHours', filters.quietHours)
  }
  if (filters.cleanlinessLevel !== undefined) {
    params.set('cleanlinessLevel', filters.cleanlinessLevel.toString())
  }
  if (filters.guestPolicy) {
    params.set('guestPolicy', filters.guestPolicy)
  }

  // Lifestyle tags (array)
  if (filters.lifestyleTags && filters.lifestyleTags.length > 0) {
    params.set('lifestyleTags', filters.lifestyleTags.join(','))
  }

  // View and sort
  if (filters.sort) {
    params.set('sort', filters.sort)
  }
  if (filters.view) {
    params.set('view', filters.view)
  }

  // Pagination
  if (filters.page !== undefined && filters.page > 1) {
    params.set('page', filters.page.toString())
  }

  return params
}

export function searchParamsToFilters(params: URLSearchParams): FiltersState {
  const filters: FiltersState = {}

  // Search query
  const q = params.get('q')
  if (q) {
    filters.q = q
  }

  // Price range
  const priceMin = params.get('priceMin')
  if (priceMin) {
    filters.priceMin = parseInt(priceMin, 10)
  }
  const priceMax = params.get('priceMax')
  if (priceMax) {
    filters.priceMax = parseInt(priceMax, 10)
  }

  // Location
  const city = params.get('city')
  if (city) {
    filters.city = city
  }
  const radiusKm = params.get('radiusKm')
  if (radiusKm) {
    filters.radiusKm = parseInt(radiusKm, 10)
  }

  // Move-in dates
  const moveInFrom = params.get('moveInFrom')
  if (moveInFrom) {
    filters.moveInFrom = moveInFrom
  }
  const moveInTo = params.get('moveInTo')
  if (moveInTo) {
    filters.moveInTo = moveInTo
  }

  // Lease months (array)
  const leaseMonths = params.get('leaseMonths')
  if (leaseMonths) {
    filters.leaseMonths = leaseMonths.split(',').map(Number)
  }

  // Room types (array)
  const roomTypes = params.get('roomTypes')
  if (roomTypes) {
    filters.roomTypes = roomTypes.split(',') as Listing['roomType'][]
  }

  // Boolean filters
  const furnished = params.get('furnished')
  if (furnished) {
    filters.furnished = furnished === 'true'
  }
  const utilitiesIncluded = params.get('utilitiesIncluded')
  if (utilitiesIncluded) {
    filters.utilitiesIncluded = utilitiesIncluded === 'true'
  }
  const petsAllowed = params.get('petsAllowed')
  if (petsAllowed) {
    filters.petsAllowed = petsAllowed === 'true'
  }

  // Smoking policy
  const smokingPolicy = params.get('smokingPolicy')
  if (smokingPolicy && ['none', 'outdoor', 'allowed'].includes(smokingPolicy)) {
    filters.smokingPolicy = smokingPolicy as Listing['smokingPolicy']
  }

  // Accessibility (array)
  const accessibility = params.get('accessibility')
  if (accessibility) {
    filters.accessibility = accessibility.split(',') as ('elevator' | 'stepFree' | 'groundFloor')[]
  }

  // Campus and distance
  const campusId = params.get('campusId')
  if (campusId) {
    filters.campusId = campusId
  }
  const maxDistanceKm = params.get('maxDistanceKm')
  if (maxDistanceKm) {
    filters.maxDistanceKm = parseInt(maxDistanceKm, 10)
  }

  // University verified
  const universityVerifiedOnly = params.get('universityVerifiedOnly')
  if (universityVerifiedOnly) {
    filters.universityVerifiedOnly = universityVerifiedOnly === 'true'
  }

  // Compatibility
  const minCompatibility = params.get('minCompatibility')
  if (minCompatibility) {
    filters.minCompatibility = parseInt(minCompatibility, 10)
  }
  const quietHours = params.get('quietHours')
  if (quietHours && ['strict', 'normal', 'flexible'].includes(quietHours)) {
    filters.quietHours = quietHours as 'strict' | 'normal' | 'flexible'
  }
  const cleanlinessLevel = params.get('cleanlinessLevel')
  if (cleanlinessLevel) {
    const level = parseInt(cleanlinessLevel, 10)
    if (level >= 1 && level <= 5) {
      filters.cleanlinessLevel = level as 1 | 2 | 3 | 4 | 5
    }
  }
  const guestPolicy = params.get('guestPolicy')
  if (guestPolicy && ['rare', 'occasional', 'frequent'].includes(guestPolicy)) {
    filters.guestPolicy = guestPolicy as 'rare' | 'occasional' | 'frequent'
  }

  // Lifestyle tags (array)
  const lifestyleTags = params.get('lifestyleTags')
  if (lifestyleTags) {
    filters.lifestyleTags = lifestyleTags.split(',')
  }

  // View and sort
  const sort = params.get('sort')
  if (sort && ['best', 'priceAsc', 'priceDesc', 'distance', 'newest'].includes(sort)) {
    filters.sort = sort as SortOption
  }
  const view = params.get('view')
  if (view && ['split', 'list', 'map'].includes(view)) {
    filters.view = view as ViewMode
  }

  // Pagination
  const page = params.get('page')
  if (page) {
    const pageNum = parseInt(page, 10)
    if (pageNum > 1) {
      filters.page = pageNum
    }
  }

  return filters
}

export function getDefaultFilters(): FiltersState {
  return {
    minCompatibility: 70,
    universityVerifiedOnly: false,
    sort: 'best',
    view: 'split',
    page: 1
  }
}

export function hasActiveFilters(filters: FiltersState): boolean {
  const defaults = getDefaultFilters()
  
  return (
    filters.q !== undefined ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.city !== undefined ||
    filters.radiusKm !== undefined ||
    filters.moveInFrom !== undefined ||
    filters.moveInTo !== undefined ||
    (filters.leaseMonths && filters.leaseMonths.length > 0) ||
    (filters.roomTypes && filters.roomTypes.length > 0) ||
    filters.furnished !== undefined ||
    filters.utilitiesIncluded !== undefined ||
    filters.petsAllowed !== undefined ||
    filters.smokingPolicy !== undefined ||
    (filters.accessibility && filters.accessibility.length > 0) ||
    filters.campusId !== undefined ||
    filters.maxDistanceKm !== undefined ||
    filters.universityVerifiedOnly !== undefined ||
    (filters.minCompatibility !== undefined && filters.minCompatibility !== 70) ||
    filters.quietHours !== undefined ||
    filters.cleanlinessLevel !== undefined ||
    filters.guestPolicy !== undefined ||
    (filters.lifestyleTags && filters.lifestyleTags.length > 0) ||
    (filters.sort !== undefined && filters.sort !== 'best') ||
    (filters.view !== undefined && filters.view !== 'split')
  )
}

export function clearAllFilters(): FiltersState {
  return getDefaultFilters()
}
