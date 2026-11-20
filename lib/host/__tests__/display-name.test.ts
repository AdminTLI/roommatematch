import { describe, expect, it } from 'vitest'
import {
  hostProfileToListingIdentity,
  resolveListingHostDisplayName,
} from '@/lib/host/display-name'

describe('resolveListingHostDisplayName', () => {
  it('prefers live host profile name over stale landlord_name', () => {
    expect(
      resolveListingHostDisplayName({
        landlordName: 'Demo Housing Listing',
        hostDisplayName: 'Domu Match Housing',
      })
    ).toBe('Domu Match Housing')
  })

  it('falls back to landlord_name when profile name is missing', () => {
    expect(
      resolveListingHostDisplayName({
        landlordName: 'Alice Landlord',
        hostDisplayName: null,
      })
    ).toBe('Alice Landlord')
  })

  it('falls back to agency/company', () => {
    expect(
      resolveListingHostDisplayName({
        hostCompanyName: 'Canal Properties',
      })
    ).toBe('Canal Properties')
  })
})

describe('hostProfileToListingIdentity', () => {
  it('maps profile fields onto listing identity columns', () => {
    expect(
      hostProfileToListingIdentity({
        display_name: 'Domu Match Housing',
        company_name: 'Domu BV',
        phone: '0612345678',
        kvk_number: '12345678',
      })
    ).toEqual({
      landlord_name: 'Domu Match Housing',
      agency_name: 'Domu BV',
      landlord_phone: '0612345678',
      agency_license: '12345678',
    })
  })
})
