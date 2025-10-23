// Unit tests for housing sorting utilities

import { getSortComparator, getSortLabel, getSortOptions } from '../sorting'
import { Listing, SortOption, Coords } from '@/types/housing'

// Mock listings for testing
const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Listing 1',
    address: 'Address 1',
    city: 'Amsterdam',
    coords: { lat: 52.3676, lng: 4.9041 },
    priceMonthly: 1000,
    compatibilityScore: 80,
    createdAt: new Date('2024-01-01').toISOString(),
    // ... other required fields
    description: '',
    postalCode: '',
    propertyType: 'studio',
    totalRooms: 1,
    availableRooms: 1,
    totalBathrooms: 1,
    utilitiesCost: 0,
    depositAmount: 0,
    agencyFee: 0,
    minStayMonths: 6,
    amenities: [],
    parkingAvailable: false,
    parkingCost: 0,
    landlordName: 'Landlord 1',
    landlordEmail: 'landlord1@example.com',
    photos: [],
    status: 'active',
    moderationStatus: 'approved',
    updatedAt: new Date().toISOString(),
    verification: {
      universityVerified: true,
      hostIdVerified: false,
      agencyKvKVerified: false
    }
  },
  {
    id: '2',
    title: 'Listing 2',
    address: 'Address 2',
    city: 'Amsterdam',
    coords: { lat: 52.3676, lng: 4.9041 },
    priceMonthly: 1500,
    compatibilityScore: 60,
    createdAt: new Date('2024-01-02').toISOString(),
    // ... other required fields
    description: '',
    postalCode: '',
    propertyType: 'studio',
    totalRooms: 1,
    availableRooms: 1,
    totalBathrooms: 1,
    utilitiesCost: 0,
    depositAmount: 0,
    agencyFee: 0,
    minStayMonths: 6,
    amenities: [],
    parkingAvailable: false,
    parkingCost: 0,
    landlordName: 'Landlord 2',
    landlordEmail: 'landlord2@example.com',
    photos: [],
    status: 'active',
    moderationStatus: 'approved',
    updatedAt: new Date().toISOString(),
    verification: {
      universityVerified: false,
      hostIdVerified: false,
      agencyKvKVerified: false
    }
  },
  {
    id: '3',
    title: 'Listing 3',
    address: 'Address 3',
    city: 'Amsterdam',
    coords: { lat: 52.3676, lng: 4.9041 },
    priceMonthly: 800,
    compatibilityScore: 90,
    createdAt: new Date('2024-01-03').toISOString(),
    // ... other required fields
    description: '',
    postalCode: '',
    propertyType: 'studio',
    totalRooms: 1,
    availableRooms: 1,
    totalBathrooms: 1,
    utilitiesCost: 0,
    depositAmount: 0,
    agencyFee: 0,
    minStayMonths: 6,
    amenities: [],
    parkingAvailable: false,
    parkingCost: 0,
    landlordName: 'Landlord 3',
    landlordEmail: 'landlord3@example.com',
    photos: [],
    status: 'active',
    moderationStatus: 'approved',
    updatedAt: new Date().toISOString(),
    verification: {
      universityVerified: true,
      hostIdVerified: false,
      agencyKvKVerified: false
    }
  }
]

describe('Housing Sorting', () => {
  describe('getSortComparator', () => {
    it('should sort by best match correctly', () => {
      const comparator = getSortComparator('best', undefined, 1200)
      const sorted = [...mockListings].sort(comparator)
      
      // Should sort by compatibility score (highest first)
      expect(sorted[0].id).toBe('3') // 90% compatibility
      expect(sorted[1].id).toBe('1') // 80% compatibility
      expect(sorted[2].id).toBe('2') // 60% compatibility
    })

    it('should sort by price ascending', () => {
      const comparator = getSortComparator('priceAsc')
      const sorted = [...mockListings].sort(comparator)
      
      expect(sorted[0].priceMonthly).toBe(800)
      expect(sorted[1].priceMonthly).toBe(1000)
      expect(sorted[2].priceMonthly).toBe(1500)
    })

    it('should sort by price descending', () => {
      const comparator = getSortComparator('priceDesc')
      const sorted = [...mockListings].sort(comparator)
      
      expect(sorted[0].priceMonthly).toBe(1500)
      expect(sorted[1].priceMonthly).toBe(1000)
      expect(sorted[2].priceMonthly).toBe(800)
    })

    it('should sort by distance when campus coordinates provided', () => {
      const campusCoords: Coords = { lat: 52.3676, lng: 4.9041 }
      const comparator = getSortComparator('distance', campusCoords)
      const sorted = [...mockListings].sort(comparator)
      
      // All listings have same coordinates, so order should be preserved
      expect(sorted[0].id).toBe('1')
      expect(sorted[1].id).toBe('2')
      expect(sorted[2].id).toBe('3')
    })

    it('should sort by newest first', () => {
      const comparator = getSortComparator('newest')
      const sorted = [...mockListings].sort(comparator)
      
      // Should sort by createdAt descending (newest first)
      expect(sorted[0].id).toBe('3') // 2024-01-03
      expect(sorted[1].id).toBe('2') // 2024-01-02
      expect(sorted[2].id).toBe('1') // 2024-01-01
    })

    it('should handle empty array', () => {
      const comparator = getSortComparator('best')
      const sorted: Listing[] = []
      sorted.sort(comparator)
      
      expect(sorted).toEqual([])
    })
  })

  describe('getSortLabel', () => {
    it('should return correct labels for all sort options', () => {
      expect(getSortLabel('best')).toBe('Best match')
      expect(getSortLabel('priceAsc')).toBe('Price (low to high)')
      expect(getSortLabel('priceDesc')).toBe('Price (high to low)')
      expect(getSortLabel('distance')).toBe('Distance to campus')
      expect(getSortLabel('newest')).toBe('Newest first')
    })
  })

  describe('getSortOptions', () => {
    it('should return all sort options with correct labels', () => {
      const options = getSortOptions()
      
      expect(options).toHaveLength(5)
      expect(options[0]).toEqual({ value: 'best', label: 'Best match' })
      expect(options[1]).toEqual({ value: 'priceAsc', label: 'Price (low to high)' })
      expect(options[2]).toEqual({ value: 'priceDesc', label: 'Price (high to low)' })
      expect(options[3]).toEqual({ value: 'distance', label: 'Distance to campus' })
      expect(options[4]).toEqual({ value: 'newest', label: 'Newest first' })
    })
  })
})
