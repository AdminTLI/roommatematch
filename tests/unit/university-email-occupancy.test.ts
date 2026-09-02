import { describe, expect, it } from 'vitest'
import {
  evaluateUniversityEmailOccupancy,
  normalizeUniversityEmail,
  occupantIdsExcluding,
} from '@/lib/university-email/claims'

describe('university email occupancy', () => {
  it('normalizes with trim and lowercase only', () => {
    expect(normalizeUniversityEmail('  Student@UvA.NL  ')).toBe('student@uva.nl')
    expect(normalizeUniversityEmail('a+tag@student.avans.nl')).toBe('a+tag@student.avans.nl')
  })

  it('allows a first-time claim when nobody holds the email', () => {
    expect(
      evaluateUniversityEmailOccupancy({
        currentUserId: 'user-a',
        currentUniversityEmail: null,
        emailNormalized: 'a@uva.nl',
        occupantIds: [],
      })
    ).toEqual({ allow: true, createClaim: true })
  })

  it('allows the same user to re-verify an email they already have', () => {
    expect(
      evaluateUniversityEmailOccupancy({
        currentUserId: 'user-a',
        currentUniversityEmail: 'A@UvA.nl',
        emailNormalized: 'a@uva.nl',
        occupantIds: ['user-a'],
      })
    ).toEqual({ allow: true, createClaim: true })
  })

  it('lets a grandfathered holder keep their email without taking an exclusive claim', () => {
    expect(
      evaluateUniversityEmailOccupancy({
        currentUserId: 'user-a',
        currentUniversityEmail: 'shared@uva.nl',
        emailNormalized: 'shared@uva.nl',
        occupantIds: ['user-a', 'user-b'],
      })
    ).toEqual({ allow: true, createClaim: false })
  })

  it('blocks a new account from attaching an email another user already has', () => {
    expect(
      evaluateUniversityEmailOccupancy({
        currentUserId: 'user-c',
        currentUniversityEmail: null,
        emailNormalized: 'shared@uva.nl',
        occupantIds: ['user-a', 'user-b'],
      })
    ).toEqual({ allow: false, holderIds: ['user-a', 'user-b'] })
  })

  it('blocks switching onto an email held by someone else', () => {
    expect(
      evaluateUniversityEmailOccupancy({
        currentUserId: 'user-a',
        currentUniversityEmail: 'old@uva.nl',
        emailNormalized: 'taken@uva.nl',
        occupantIds: ['user-b'],
      })
    ).toEqual({ allow: false, holderIds: ['user-b'] })
  })

  it('ignores the current user when listing other occupants', () => {
    expect(occupantIdsExcluding(['user-a', 'user-b', 'user-a'], 'user-a')).toEqual(['user-b'])
  })
})
