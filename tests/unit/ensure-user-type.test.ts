import { describe, expect, it } from 'vitest'
import { getCohortOnboardingPath } from '@/lib/onboarding/ensure-user-type'

describe('getCohortOnboardingPath', () => {
  it('falls back to path when cohort is unknown', () => {
    expect(getCohortOnboardingPath(null)).toBe('/onboarding/path')
  })

  it('routes professionals to the professional welcome', () => {
    expect(getCohortOnboardingPath('professional')).toBe('/onboarding-professional/welcome')
  })

  it('routes students to student welcome by default', () => {
    expect(getCohortOnboardingPath('student')).toBe('/onboarding/welcome')
  })

  it('can prefer academic gate for unverified students', () => {
    expect(
      getCohortOnboardingPath('student', {
        preferAcademicGate: true,
        isVerifiedStudent: false,
      })
    ).toBe('/onboarding/path')
    expect(
      getCohortOnboardingPath('student', {
        preferAcademicGate: true,
        isVerifiedStudent: true,
      })
    ).toBe('/onboarding/welcome')
  })
})
