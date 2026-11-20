import { describe, expect, it } from 'vitest'
import {
  anonymousApplicantLabel,
  dealbreakerFactor,
  DEALBREAKER_PENALTY_WEIGHTS,
  scoreGroupAgainstListing,
} from '@/lib/housing/group-listing-score'

describe('dealbreakerFactor', () => {
  it('is 1 with no conflicts', () => {
    expect(dealbreakerFactor([])).toBe(1)
  })

  it('applies a single airbnb weight multiplicatively', () => {
    expect(dealbreakerFactor(['airbnb'])).toBeCloseTo(1 - DEALBREAKER_PENALTY_WEIGHTS.airbnb, 5)
  })

  it('compounds distinct conflicts and ignores unknowns/duplicates', () => {
    const expected =
      (1 - DEALBREAKER_PENALTY_WEIGHTS.smoking) * (1 - DEALBREAKER_PENALTY_WEIGHTS.pets)
    expect(dealbreakerFactor(['smoking', 'pets', 'smoking', 'unknown'])).toBeCloseTo(expected, 5)
  })

  it('ranks airbnb milder than smoking', () => {
    expect(dealbreakerFactor(['airbnb'])).toBeGreaterThan(dealbreakerFactor(['smoking']))
  })
})

describe('scoreGroupAgainstListing', () => {
  it('uses worst-member budget semantics', () => {
    const result = scoreGroupAgainstListing(
      [
        { userId: 'a', maxRentMonthly: 900, verified: true },
        { userId: 'b', maxRentMonthly: 500, verified: true },
      ],
      {
        rentMonthly: 700,
        availableRooms: 2,
        seekingPeople: 2,
        petFriendly: false,
        smokingAllowed: false,
      },
      0.9
    )
    expect(result.groupSize).toBe(2)
    expect(result.breakdown.budget).toBeLessThan(0.75)
    expect(result.verificationBadges).toContain('id_verified')
    expect(result.verificationBadges).toContain('group_application')
    expect(result.insights.budget.length).toBeGreaterThan(20)
    expect(result.insights.lifestyle.length).toBeGreaterThan(20)
    expect(result.insights.timeline.length).toBeGreaterThan(20)
    expect(result.insights.overall.length).toBeGreaterThan(20)
  })

  it('flags smoking gate conflicts without hard-capping overall at 45%', () => {
    const clean = scoreGroupAgainstListing(
      [{ userId: 'a', smokingOk: false, maxRentMonthly: 800 }],
      {
        rentMonthly: 600,
        availableRooms: 1,
        seekingPeople: 1,
        petFriendly: false,
        smokingAllowed: false,
        dealbreakers: { no_smoking: true },
      },
      1
    )
    const smoking = scoreGroupAgainstListing(
      [{ userId: 'a', smokingOk: true, maxRentMonthly: 800 }],
      {
        rentMonthly: 600,
        availableRooms: 1,
        seekingPeople: 1,
        petFriendly: false,
        smokingAllowed: false,
        dealbreakers: { no_smoking: true },
      },
      1
    )
    expect(smoking.hardGatesPassed).toBe(false)
    expect(smoking.gateConflicts).toContain('smoking')
    expect(smoking.dealbreakerFactor).toBeCloseTo(1 - DEALBREAKER_PENALTY_WEIGHTS.smoking, 5)
    expect(smoking.overall).toBeCloseTo(smoking.softOverall * smoking.dealbreakerFactor, 5)
    expect(smoking.overall).toBeGreaterThan(0.45)
    expect(smoking.overall).toBeLessThan(clean.overall)
  })

  it('drags airbnb milder than smoking for otherwise identical soft fit', () => {
    const member = { userId: 'a', smokingOk: true, airbnbOk: true, maxRentMonthly: 800 }
    const listingBase = {
      rentMonthly: 600,
      availableRooms: 1,
      seekingPeople: 1,
      petFriendly: true,
      smokingAllowed: false,
    }
    const airbnbOnly = scoreGroupAgainstListing([member], {
      ...listingBase,
      smokingAllowed: true,
      dealbreakers: { no_airbnb: true },
    })
    const smokingOnly = scoreGroupAgainstListing([member], {
      ...listingBase,
      dealbreakers: { no_smoking: true },
    })
    expect(airbnbOnly.gateConflicts).toEqual(['airbnb'])
    expect(smokingOnly.gateConflicts).toEqual(['smoking'])
    expect(airbnbOnly.overall).toBeGreaterThan(smokingOnly.overall)
  })

  it('keeps a strong soft fit competitive when only airbnb conflicts (no 45% cap)', () => {
    // Mirrors Tilburg student × Breda listing: solid lifestyle/budget, solo vs seeking 2, no_airbnb
    const result = scoreGroupAgainstListing(
      [
        {
          userId: 'tilburg',
          maxRentMonthly: 700,
          airbnbOk: true,
          smokingOk: false,
          petsOk: false,
          cleanliness: 4,
          quietHoursImportance: 4,
          guestsFrequency: 2,
          partiesFrequency: 2,
          socialLevel: 3,
          choresExpectation: 4,
          preferredSchedule: 'flexible',
          moveInFlexibilityDays: 30,
          minStayMonths: 6,
        },
      ],
      {
        rentMonthly: 650,
        availableRooms: 2,
        seekingPeople: 2,
        petFriendly: true,
        smokingAllowed: false,
        dealbreakers: {
          no_smoking: true,
          no_airbnb: true,
          no_pets: false,
          max_group_size: 2,
          min_stay_months: 6,
        },
        lifestylePrefs: {
          cleanliness: 4,
          quiet_hours_importance: 4,
          guests_frequency: 2,
          parties_frequency: 2,
          social_level: 3,
          chores_expectation: 4,
          preferred_schedule: 'flexible',
        },
        availableFrom: new Date().toISOString().slice(0, 10),
        minStayMonths: 6,
      },
      1
    )
    expect(result.gateConflicts).toEqual(['airbnb'])
    expect(result.hardGatesPassed).toBe(false)
    expect(result.breakdown.lifestyle).toBeGreaterThan(0.7)
    expect(result.overall).toBeGreaterThan(0.55)
    expect(result.overall).toBeLessThan(result.softOverall)
    expect(result.overall).toBeCloseTo(result.softOverall * 0.92, 3)
  })

  it('scores expanded lifestyle prefs against student signals', () => {
    const aligned = scoreGroupAgainstListing(
      [
        {
          userId: 'a',
          maxRentMonthly: 900,
          cleanliness: 5,
          quietHoursImportance: 4,
          guestsFrequency: 2,
          partiesFrequency: 1,
          socialLevel: 2,
          choresExpectation: 4,
          preferredSchedule: 'early',
        },
      ],
      {
        rentMonthly: 700,
        availableRooms: 1,
        seekingPeople: 1,
        petFriendly: false,
        smokingAllowed: false,
        lifestylePrefs: {
          cleanliness: 5,
          quiet_hours_importance: 4,
          guests_frequency: 2,
          parties_frequency: 1,
          social_level: 2,
          chores_expectation: 5,
          preferred_schedule: 'early',
        },
      },
      1
    )
    const mismatched = scoreGroupAgainstListing(
      [
        {
          userId: 'b',
          maxRentMonthly: 900,
          cleanliness: 1,
          quietHoursImportance: 1,
          guestsFrequency: 5,
          partiesFrequency: 5,
          socialLevel: 5,
          choresExpectation: 1,
          preferredSchedule: 'late',
        },
      ],
      {
        rentMonthly: 700,
        availableRooms: 1,
        seekingPeople: 1,
        petFriendly: false,
        smokingAllowed: false,
        lifestylePrefs: {
          cleanliness: 5,
          quiet_hours_importance: 5,
          guests_frequency: 1,
          parties_frequency: 1,
          social_level: 1,
          chores_expectation: 5,
          preferred_schedule: 'early',
        },
      },
      1
    )
    expect(aligned.breakdown.lifestyle).toBeGreaterThan(mismatched.breakdown.lifestyle)
    expect(aligned.overall).toBeGreaterThan(mismatched.overall)
  })

  it('gives different overall fit for different host lifestyle prefs', () => {
    const student = {
      userId: 's1',
      maxRentMonthly: 900,
      moveInFlexibilityDays: 30,
      cleanliness: 4,
      quietHoursImportance: 4,
      guestsFrequency: 2,
      overnightGuests: 2,
      partiesFrequency: 2,
      socialLevel: 3,
      choresExpectation: 4,
      preferredSchedule: 'early' as const,
    }
    const baseListing = {
      rentMonthly: 700,
      availableRooms: 1,
      seekingPeople: 1,
      petFriendly: false,
      smokingAllowed: false,
      availableFrom: new Date().toISOString().slice(0, 10),
      minStayMonths: 6,
      amenities: ['wifi', 'heating'],
    }
    const quietHost = scoreGroupAgainstListing([student], {
      ...baseListing,
      lifestylePrefs: {
        cleanliness: 5,
        quiet_hours_importance: 5,
        guests_frequency: 1,
        overnight_guests: 1,
        parties_frequency: 1,
        social_level: 2,
        chores_expectation: 5,
        preferred_schedule: 'early',
      },
    })
    const partyHost = scoreGroupAgainstListing([student], {
      ...baseListing,
      lifestylePrefs: {
        cleanliness: 2,
        quiet_hours_importance: 1,
        guests_frequency: 5,
        overnight_guests: 5,
        parties_frequency: 5,
        social_level: 5,
        chores_expectation: 1,
        preferred_schedule: 'late',
      },
    })
    expect(quietHost.overall).not.toEqual(partyHost.overall)
    expect(quietHost.breakdown.lifestyle).toBeGreaterThan(partyHost.breakdown.lifestyle)
  })
})

describe('anonymousApplicantLabel', () => {
  it('labels groups and individuals', () => {
    expect(anonymousApplicantLabel(0, 1)).toBe('Applicant A')
    expect(anonymousApplicantLabel(1, 3)).toBe('Applicant group B')
  })
})
