// Unit tests for URL sync utilities

import { 
  filtersToSearchParams, 
  searchParamsToFilters, 
  getDefaultFilters,
  hasActiveFilters,
  clearAllFilters
} from '../url-sync'
import { FiltersState } from '@/types/housing'

describe('URL Sync Utilities', () => {
  describe('filtersToSearchParams', () => {
    it('should convert empty filters to empty search params', () => {
      const filters: FiltersState = {}
      const params = filtersToSearchParams(filters)
      
      expect(params.toString()).toBe('')
    })

    it('should convert basic filters to search params', () => {
      const filters: FiltersState = {
        q: 'Amsterdam',
        priceMin: 500,
        priceMax: 1000,
        city: 'Amsterdam',
        universityVerifiedOnly: true
      }
      const params = filtersToSearchParams(filters)
      
      expect(params.get('q')).toBe('Amsterdam')
      expect(params.get('priceMin')).toBe('500')
      expect(params.get('priceMax')).toBe('1000')
      expect(params.get('city')).toBe('Amsterdam')
      expect(params.get('universityVerifiedOnly')).toBe('true')
    })

    it('should handle array filters', () => {
      const filters: FiltersState = {
        roomTypes: ['studio', 'apartment'],
        leaseMonths: [6, 12],
        accessibility: ['elevator', 'stepFree'],
        lifestyleTags: ['quiet', 'clean']
      }
      const params = filtersToSearchParams(filters)
      
      expect(params.get('roomTypes')).toBe('studio,apartment')
      expect(params.get('leaseMonths')).toBe('6,12')
      expect(params.get('accessibility')).toBe('elevator,stepFree')
      expect(params.get('lifestyleTags')).toBe('quiet,clean')
    })

    it('should handle boolean filters', () => {
      const filters: FiltersState = {
        furnished: true,
        utilitiesIncluded: false,
        petsAllowed: true
      }
      const params = filtersToSearchParams(filters)
      
      expect(params.get('furnished')).toBe('true')
      expect(params.get('utilitiesIncluded')).toBe('false')
      expect(params.get('petsAllowed')).toBe('true')
    })

    it('should handle enum filters', () => {
      const filters: FiltersState = {
        smokingPolicy: 'none',
        quietHours: 'strict',
        guestPolicy: 'rare'
      }
      const params = filtersToSearchParams(filters)
      
      expect(params.get('smokingPolicy')).toBe('none')
      expect(params.get('quietHours')).toBe('strict')
      expect(params.get('guestPolicy')).toBe('rare')
    })

    it('should handle numeric filters', () => {
      const filters: FiltersState = {
        radiusKm: 5,
        minCompatibility: 70,
        cleanlinessLevel: 3
      }
      const params = filtersToSearchParams(filters)
      
      expect(params.get('radiusKm')).toBe('5')
      expect(params.get('minCompatibility')).toBe('70')
      expect(params.get('cleanlinessLevel')).toBe('3')
    })
  })

  describe('searchParamsToFilters', () => {
    it('should convert empty search params to empty filters', () => {
      const params = new URLSearchParams()
      const filters = searchParamsToFilters(params)
      
      expect(filters).toEqual({})
    })

    it('should convert search params to filters', () => {
      const params = new URLSearchParams({
        q: 'Amsterdam',
        priceMin: '500',
        priceMax: '1000',
        city: 'Amsterdam',
        universityVerifiedOnly: 'true'
      })
      const filters = searchParamsToFilters(params)
      
      expect(filters.q).toBe('Amsterdam')
      expect(filters.priceMin).toBe(500)
      expect(filters.priceMax).toBe(1000)
      expect(filters.city).toBe('Amsterdam')
      expect(filters.universityVerifiedOnly).toBe(true)
    })

    it('should handle array filters', () => {
      const params = new URLSearchParams({
        roomTypes: 'studio,apartment',
        leaseMonths: '6,12',
        accessibility: 'elevator,stepFree',
        lifestyleTags: 'quiet,clean'
      })
      const filters = searchParamsToFilters(params)
      
      expect(filters.roomTypes).toEqual(['studio', 'apartment'])
      expect(filters.leaseMonths).toEqual([6, 12])
      expect(filters.accessibility).toEqual(['elevator', 'stepFree'])
      expect(filters.lifestyleTags).toEqual(['quiet', 'clean'])
    })

    it('should handle boolean filters', () => {
      const params = new URLSearchParams({
        furnished: 'true',
        utilitiesIncluded: 'false',
        petsAllowed: 'true'
      })
      const filters = searchParamsToFilters(params)
      
      expect(filters.furnished).toBe(true)
      expect(filters.utilitiesIncluded).toBe(false)
      expect(filters.petsAllowed).toBe(true)
    })

    it('should handle enum filters', () => {
      const params = new URLSearchParams({
        smokingPolicy: 'none',
        quietHours: 'strict',
        guestPolicy: 'rare'
      })
      const filters = searchParamsToFilters(params)
      
      expect(filters.smokingPolicy).toBe('none')
      expect(filters.quietHours).toBe('strict')
      expect(filters.guestPolicy).toBe('rare')
    })

    it('should handle numeric filters', () => {
      const params = new URLSearchParams({
        radiusKm: '5',
        minCompatibility: '70',
        cleanlinessLevel: '3'
      })
      const filters = searchParamsToFilters(params)
      
      expect(filters.radiusKm).toBe(5)
      expect(filters.minCompatibility).toBe(70)
      expect(filters.cleanlinessLevel).toBe(3)
    })

    it('should handle invalid enum values', () => {
      const params = new URLSearchParams({
        smokingPolicy: 'invalid',
        quietHours: 'invalid',
        guestPolicy: 'invalid'
      })
      const filters = searchParamsToFilters(params)
      
      expect(filters.smokingPolicy).toBeUndefined()
      expect(filters.quietHours).toBeUndefined()
      expect(filters.guestPolicy).toBeUndefined()
    })

    it('should handle invalid numeric values', () => {
      const params = new URLSearchParams({
        cleanlinessLevel: 'invalid'
      })
      const filters = searchParamsToFilters(params)
      
      expect(filters.cleanlinessLevel).toBeUndefined()
    })
  })

  describe('round-trip conversion', () => {
    it('should maintain data integrity through round-trip conversion', () => {
      const originalFilters: FiltersState = {
        q: 'Amsterdam',
        priceMin: 500,
        priceMax: 1000,
        city: 'Amsterdam',
        radiusKm: 5,
        roomTypes: ['studio', 'apartment'],
        furnished: true,
        utilitiesIncluded: false,
        petsAllowed: true,
        smokingPolicy: 'none',
        universityVerifiedOnly: true,
        minCompatibility: 70,
        quietHours: 'strict',
        cleanlinessLevel: 3,
        guestPolicy: 'rare',
        lifestyleTags: ['quiet', 'clean'],
        sort: 'best',
        view: 'split',
        page: 2
      }

      const params = filtersToSearchParams(originalFilters)
      const convertedFilters = searchParamsToFilters(params)

      expect(convertedFilters).toEqual(originalFilters)
    })
  })

  describe('getDefaultFilters', () => {
    it('should return default filter values', () => {
      const defaults = getDefaultFilters()
      
      expect(defaults).toEqual({
        minCompatibility: 70,
        universityVerifiedOnly: false,
        sort: 'best',
        view: 'split',
        page: 1
      })
    })
  })

  describe('hasActiveFilters', () => {
    it('should return false for default filters', () => {
      const filters = getDefaultFilters()
      expect(hasActiveFilters(filters)).toBe(false)
    })

    it('should return true for filters with values', () => {
      const filters: FiltersState = {
        q: 'Amsterdam',
        priceMin: 500,
        universityVerifiedOnly: true
      }
      expect(hasActiveFilters(filters)).toBe(true)
    })

    it('should return true for array filters with values', () => {
      const filters: FiltersState = {
        roomTypes: ['studio'],
        amenities: ['wifi']
      }
      expect(hasActiveFilters(filters)).toBe(true)
    })

    it('should return false for empty arrays', () => {
      const filters: FiltersState = {
        roomTypes: [],
        amenities: []
      }
      expect(hasActiveFilters(filters)).toBe(false)
    })
  })

  describe('clearAllFilters', () => {
    it('should return default filters', () => {
      const cleared = clearAllFilters()
      expect(cleared).toEqual(getDefaultFilters())
    })
  })
})
