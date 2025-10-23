// Sorting utilities for housing listings
// Implements various sorting algorithms for the housing feed

import { Listing, SortOption, Coords } from '@/types/housing'

export function getSortComparator(
  sort: SortOption,
  campusCoords?: Coords,
  userBudget?: number
): (a: Listing, b: Listing) => number {
  switch (sort) {
    case 'best':
      return (a, b) => {
        const scoreA = calculateBestMatchScore(a, campusCoords, userBudget)
        const scoreB = calculateBestMatchScore(b, campusCoords, userBudget)
        return scoreB - scoreA // Higher score first
      }
    
    case 'priceAsc':
      return (a, b) => a.priceMonthly - b.priceMonthly
    
    case 'priceDesc':
      return (a, b) => b.priceMonthly - a.priceMonthly
    
    case 'distance':
      if (!campusCoords) return () => 0
      return (a, b) => {
        const distanceA = a.distanceKmToCampus || calculateDistance(a.coords, campusCoords)
        const distanceB = b.distanceKmToCampus || calculateDistance(b.coords, campusCoords)
        return distanceA - distanceB
      }
    
    case 'newest':
      return (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    
    default:
      return () => 0
  }
}

function calculateBestMatchScore(
  listing: Listing,
  campusCoords?: Coords,
  userBudget?: number
): number {
  // Best match score: 0.6*compatibility + 0.2*budgetFit + 0.15*distanceScore + 0.05*recencyScore
  
  const compatibilityScore = (listing.compatibilityScore || 0) / 100 // Convert to 0-1
  
  const budgetFit = userBudget 
    ? Math.max(0, 1 - Math.abs(listing.priceMonthly - userBudget) / userBudget)
    : 0.5 // Neutral if no budget provided
  
  const distanceScore = campusCoords 
    ? 1 / (1 + (listing.distanceKmToCampus || calculateDistance(listing.coords, campusCoords)))
    : 0.5 // Neutral if no campus
  
  const daysSinceCreated = (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  const recencyScore = Math.max(0, 1 - daysSinceCreated / 30) // Decay over 30 days
  
  return (
    compatibilityScore * 0.6 +
    budgetFit * 0.2 +
    distanceScore * 0.15 +
    recencyScore * 0.05
  )
}

function calculateDistance(coords1: Coords, coords2: Coords): number {
  // Haversine formula for distance between two points
  const R = 6371 // Earth's radius in kilometers
  const dLat = deg2rad(coords2.lat - coords1.lat)
  const dLon = deg2rad(coords2.lng - coords1.lng)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(coords1.lat)) * Math.cos(deg2rad(coords2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180)
}

export function getSortLabel(sort: SortOption): string {
  switch (sort) {
    case 'best':
      return 'Best match'
    case 'priceAsc':
      return 'Price (low to high)'
    case 'priceDesc':
      return 'Price (high to low)'
    case 'distance':
      return 'Distance to campus'
    case 'newest':
      return 'Newest first'
    default:
      return 'Best match'
  }
}

export function getSortOptions(): Array<{ value: SortOption; label: string }> {
  return [
    { value: 'best', label: getSortLabel('best') },
    { value: 'priceAsc', label: getSortLabel('priceAsc') },
    { value: 'priceDesc', label: getSortLabel('priceDesc') },
    { value: 'distance', label: getSortLabel('distance') },
    { value: 'newest', label: getSortLabel('newest') }
  ]
}
