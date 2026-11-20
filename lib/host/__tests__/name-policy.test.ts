import { describe, expect, it } from 'vitest'
import {
  evaluateHostNameFields,
  isDomuBrandName,
  namesMatchProtectedOrg,
  normalizeHostNameKey,
} from '@/lib/host/name-policy'

describe('isDomuBrandName', () => {
  it('blocks Domu Match variants', () => {
    expect(isDomuBrandName('Domu Match')).toBe(true)
    expect(isDomuBrandName('domu-match')).toBe(true)
    expect(isDomuBrandName('DomuMatch')).toBe(true)
    expect(isDomuBrandName('Official Domu Match Housing')).toBe(true)
    expect(isDomuBrandName('d0mu match')).toBe(true)
  })

  it('allows unrelated names', () => {
    expect(isDomuBrandName('Alice Landlord')).toBe(false)
    expect(isDomuBrandName('Our Domus')).toBe(false)
    expect(isDomuBrandName('Kamernet Breda')).toBe(false)
  })
})

describe('namesMatchProtectedOrg', () => {
  const orgs = [
    { name: 'Kamernet', normalized_name: 'kamernet' },
    { name: 'HousingAnywhere', normalized_name: 'housinganywhere' },
  ]

  it('matches known orgs and close variants', () => {
    expect(namesMatchProtectedOrg('Kamernet', orgs)).toBe('Kamernet')
    expect(namesMatchProtectedOrg('kamernet.nl rooms', orgs)).toBe('Kamernet')
    expect(namesMatchProtectedOrg('Housing Anywhere', orgs)).toBe('HousingAnywhere')
  })

  it('ignores unrelated names', () => {
    expect(namesMatchProtectedOrg('Breda Student House', orgs)).toBeNull()
  })
})

describe('evaluateHostNameFields', () => {
  const protectedOrgs = [{ name: 'SSH', normalized_name: 'ssh' }]

  it('hard-blocks Domu brand for normal users', () => {
    const result = evaluateHostNameFields({
      displayName: 'Domu Match Housing',
      protectedOrgs,
      userId: 'some-random-user',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.kind).toBe('brand_blocked')
  })

  it('allows Domu brand for official host user', () => {
    const result = evaluateHostNameFields({
      displayName: 'Domu Match Housing',
      protectedOrgs,
      userId: '2763f0a1-91fd-482c-81ed-f830327b2c2c',
    })
    expect(result.ok).toBe(true)
    expect(result.kind).toBe('clear')
  })

  it('flags protected org claims for review', () => {
    const result = evaluateHostNameFields({
      displayName: 'Maria',
      companyName: 'SSH',
      protectedOrgs,
      userId: 'abc',
    })
    expect(result.ok).toBe(true)
    expect(result.kind).toBe('needs_review')
  })
})

describe('normalizeHostNameKey', () => {
  it('strips punctuation and case', () => {
    expect(normalizeHostNameKey('Domu-Match!')).toBe('domumatch')
  })
})
