import { describe, expect, it } from 'vitest'
import {
  decidePersonaIdentity,
  namesMatch,
  normalizePersonName,
} from '@/lib/verification/persona-decision'

describe('normalizePersonName', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalizePersonName('José')).toBe('jose')
    expect(normalizePersonName('  Mary-Jane  ')).toBe('mary-jane')
  })
})

describe('namesMatch', () => {
  it('matches exact names', () => {
    expect(namesMatch('Ada', 'Lovelace', 'Ada', 'Lovelace')).toBe(true)
  })

  it('tolerates middle names in first name field', () => {
    expect(namesMatch('Mary', 'Smith', 'Mary Jane', 'Smith')).toBe(true)
  })

  it('rejects last name mismatch', () => {
    expect(namesMatch('Ada', 'Lovelace', 'Ada', 'Byron')).toBe(false)
  })
})

describe('decidePersonaIdentity', () => {
  const expected = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    dateOfBirth: '1990-01-15',
  }

  it('approves when persona approved and identity matches', () => {
    const result = decidePersonaIdentity({
      personaApproved: true,
      expected,
      persona: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        dateOfBirth: '1990-01-15',
        issuingCountry: 'NL',
      },
    })
    expect(result.approved).toBe(true)
    expect(result.reasons).toEqual([])
  })

  it('rejects underage ID DOB', () => {
    const today = new Date()
    const underage = `${today.getFullYear() - 16}-06-01`
    const result = decidePersonaIdentity({
      personaApproved: true,
      expected: { ...expected, dateOfBirth: underage },
      persona: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        dateOfBirth: underage,
      },
    })
    expect(result.approved).toBe(false)
    expect(result.reasons).toContain('underage')
  })

  it('rejects missing persona DOB (fail closed)', () => {
    const result = decidePersonaIdentity({
      personaApproved: true,
      expected,
      persona: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        dateOfBirth: null,
      },
    })
    expect(result.approved).toBe(false)
    expect(result.reasons).toContain('dob_missing')
  })

  it('rejects DOB mismatch', () => {
    const result = decidePersonaIdentity({
      personaApproved: true,
      expected,
      persona: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        dateOfBirth: '1991-01-15',
      },
    })
    expect(result.approved).toBe(false)
    expect(result.reasons).toContain('dob_mismatch')
  })

  it('rejects name mismatch', () => {
    const result = decidePersonaIdentity({
      personaApproved: true,
      expected,
      persona: {
        firstName: 'Charles',
        lastName: 'Babbage',
        dateOfBirth: '1990-01-15',
      },
    })
    expect(result.approved).toBe(false)
    expect(result.reasons).toContain('name_mismatch')
  })

  it('rejects missing persona name', () => {
    const result = decidePersonaIdentity({
      personaApproved: true,
      expected,
      persona: {
        firstName: '',
        lastName: '',
        dateOfBirth: '1990-01-15',
      },
    })
    expect(result.approved).toBe(false)
    expect(result.reasons).toContain('name_missing')
  })
})
