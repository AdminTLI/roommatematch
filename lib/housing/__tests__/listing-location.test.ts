import { describe, expect, it } from 'vitest'
import {
  composeStreetLine,
  formatListingLocationLine,
  normalizeAmenityList,
} from '@/lib/housing/listing-location'

describe('formatListingLocationLine', () => {
  it('shows street, city, and postcode without duplicating the city', () => {
    expect(
      formatListingLocationLine({
        address: 'Terheijdenstraat 342',
        city: 'Breda',
        postal_code: '4816BX',
      })
    ).toBe('Terheijdenstraat 342, Breda 4816BX')
  })

  it('omits a leading comma when address is city-only', () => {
    expect(
      formatListingLocationLine({
        address: 'Breda',
        city: 'Breda',
        postal_code: '4811AA',
      })
    ).toBe('Breda 4811AA')
  })

  it('omits a leading comma when street is empty', () => {
    expect(
      formatListingLocationLine({
        address: '',
        city: 'Breda',
        postalCode: '4811AA',
      })
    ).toBe('Breda 4811AA')
  })
})

describe('composeStreetLine', () => {
  it('returns empty when address equals city', () => {
    expect(composeStreetLine({ address: 'Breda', city: 'Breda' })).toBe('')
  })
})

describe('normalizeAmenityList', () => {
  it('normalizes spacing and dedupes', () => {
    expect(
      normalizeAmenityList(['wifi', 'Air Conditioning', 'air_conditioning', '  Heating '])
    ).toEqual(['wifi', 'air_conditioning', 'heating'])
  })
})
