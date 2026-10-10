import { describe, expect, it } from 'vitest'
import { evaluateUniversityEmailOccupancy } from './claims'

describe('evaluateUniversityEmailOccupancy', () => {
  it('allows attaching own login academic email when no other holders', () => {
    const result = evaluateUniversityEmailOccupancy({
      currentUserId: 'me',
      currentUniversityEmail: null,
      currentLoginEmail: 'student@uva.nl',
      emailNormalized: 'student@uva.nl',
      occupantIds: ['me'],
    })
    expect(result).toEqual({ allow: true, createClaim: true })
  })

  it('blocks when another account already holds the email', () => {
    const result = evaluateUniversityEmailOccupancy({
      currentUserId: 'me',
      currentUniversityEmail: null,
      currentLoginEmail: 'personal@gmail.com',
      emailNormalized: 'taken@uva.nl',
      occupantIds: ['other'],
    })
    expect(result.allow).toBe(false)
    if (!result.allow) {
      expect(result.holderIds).toEqual(['other'])
    }
  })

  it('allows re-verify of own university_email even if grandfathered others exist', () => {
    const result = evaluateUniversityEmailOccupancy({
      currentUserId: 'me',
      currentUniversityEmail: 'me@uva.nl',
      emailNormalized: 'me@uva.nl',
      occupantIds: ['me', 'legacy'],
    })
    expect(result).toEqual({ allow: true, createClaim: false })
  })
})
