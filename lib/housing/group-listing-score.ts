/**
 * Group × listing compatibility for blind host ranking.
 * Uses worst-member / intersection semantics + optional internal cohesion.
 *
 * Lifestyle dimensions are weighted individually so host questionnaire prefs
 * map cleanly onto student onboarding signals and produce distinct fit %
 * per listing × student pair.
 *
 * House-rule conflicts (smoking / pets / airbnb / group size) apply a
 * multiplicative drag with per-conflict weights — they reduce overall fit
 * but no longer hard-cap it.
 */

import type { ListingDealbreakers, ListingLifestylePrefs } from '@/lib/host/types'
import {
  buildListingFitInsights,
  type ListingFitInsights,
} from '@/lib/housing/listing-fit-insights'
import { normalizeAmenityKey } from '@/lib/housing/listing-location'

export interface MemberHousingSignals {
  userId: string
  maxRentMonthly?: number | null
  moveInFlexibilityDays?: number | null
  minStayMonths?: number | null
  maxStayMonths?: number | null
  smokingOk?: boolean
  petsOk?: boolean
  airbnbOk?: boolean
  brpNeeded?: boolean
  cleanliness?: number | null // 1-5
  quietHoursImportance?: number | null
  guestsFrequency?: number | null
  overnightGuests?: number | null
  partiesFrequency?: number | null
  socialLevel?: number | null
  choresExpectation?: number | null
  preferredSchedule?: 'early' | 'flexible' | 'late' | null
  requiredAmenities?: string[]
  preferredAmenities?: string[]
  verified?: boolean
  universityEmailVerified?: boolean
}

export interface ListingScoreInput {
  rentMonthly: number
  availableRooms: number
  seekingPeople: number
  petFriendly: boolean
  smokingAllowed: boolean
  lifestylePrefs?: ListingLifestylePrefs | null
  dealbreakers?: ListingDealbreakers | null
  availableFrom?: string | null
  minStayMonths?: number | null
  maxStayMonths?: number | null
  amenities?: string[] | null
}

export interface GroupListingScoreResult {
  overall: number
  /** Soft-dimension blend before dealbreaker drag (0–1). */
  softOverall: number
  /** Multiplicative factor from house-rule conflicts (1 = none). */
  dealbreakerFactor: number
  cohesion: number
  hardGatesPassed: boolean
  gateConflicts: string[]
  breakdown: {
    lifestyle: number
    budget: number
    timeline: number
    capacity: number
    amenities: number
  }
  watchOuts: string[]
  /** Human-readable why for lifestyle / budget / timeline */
  insights: ListingFitInsights
  verificationBadges: string[]
  groupSize: number
}

/** Relative importance of host lifestyle prefs when scoring against student answers. */
export const LIFESTYLE_PREF_WEIGHTS = {
  cleanliness: 0.18,
  quiet_hours_importance: 0.16,
  guests_frequency: 0.12,
  overnight_guests: 0.12,
  parties_frequency: 0.12,
  social_level: 0.12,
  chores_expectation: 0.1,
  preferred_schedule: 0.08,
} as const

/** Top-level blend for overall listing fit (sums to 1). */
export const LISTING_FIT_WEIGHTS = {
  lifestyle: 0.34,
  budget: 0.2,
  timeline: 0.14,
  capacity: 0.12,
  amenities: 0.1,
  cohesion: 0.1,
} as const

/**
 * How hard each house-rule conflict drags overall fit.
 * Applied multiplicatively: overall = base × Π(1 − weight_d).
 * Soft dimensions still dominate; conflicts reduce, they do not hard-cap.
 *
 * Severity rationale (relative):
 * - group_size: physical capacity clash (also reflected in capacity dim)
 * - smoking: shared-air / health preference, hard to negotiate in a home
 * - pets: allergies / damage / lasting lifestyle clash
 * - airbnb: policy preference, usually less day-to-day than pets/smoking
 */
export const DEALBREAKER_PENALTY_WEIGHTS = {
  group_size: 0.2,
  smoking: 0.18,
  pets: 0.14,
  airbnb: 0.08,
} as const

export type DealbreakerConflictKey = keyof typeof DEALBREAKER_PENALTY_WEIGHTS

/**
 * Multiplicative dealbreaker factor in [0, 1].
 * No conflicts → 1. One mild conflict (airbnb 0.08) → 0.92.
 * Stacking compounds: smoking + pets → (1-0.18)*(1-0.14) = 0.705.
 */
export function dealbreakerFactor(conflicts: string[]): number {
  if (!conflicts.length) return 1
  let factor = 1
  const seen = new Set<string>()
  for (const raw of conflicts) {
    const key = raw as DealbreakerConflictKey
    if (seen.has(key)) continue
    seen.add(key)
    const weight = DEALBREAKER_PENALTY_WEIGHTS[key]
    if (weight == null || weight <= 0) continue
    factor *= 1 - Math.min(1, weight)
  }
  return clamp01(factor)
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(1, n))
}

function likertSim(a: number, b: number): number {
  return clamp01(1 - Math.abs(a - b) / 4)
}

function minOrNull(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
  if (!nums.length) return null
  return Math.min(...nums)
}

function scheduleSim(
  host: NonNullable<ListingLifestylePrefs['preferred_schedule']>,
  student: NonNullable<MemberHousingSignals['preferredSchedule']>
): number {
  if (host === student) return 1
  if (host === 'flexible' || student === 'flexible') return 0.75
  return 0.35
}

/**
 * Weighted lifestyle similarity for one member vs listing prefs.
 * Only dimensions present on both sides contribute; weights are re-normalized.
 */
export function scoreMemberLifestyle(
  member: MemberHousingSignals,
  prefs: ListingLifestylePrefs
): number {
  const parts: Array<{ weight: number; sim: number }> = []

  if (prefs.cleanliness != null && member.cleanliness != null) {
    parts.push({
      weight: LIFESTYLE_PREF_WEIGHTS.cleanliness,
      sim: likertSim(prefs.cleanliness, member.cleanliness),
    })
  }
  if (prefs.quiet_hours_importance != null && member.quietHoursImportance != null) {
    parts.push({
      weight: LIFESTYLE_PREF_WEIGHTS.quiet_hours_importance,
      sim: likertSim(prefs.quiet_hours_importance, member.quietHoursImportance),
    })
  }
  if (prefs.guests_frequency != null && member.guestsFrequency != null) {
    parts.push({
      weight: LIFESTYLE_PREF_WEIGHTS.guests_frequency,
      sim: likertSim(prefs.guests_frequency, member.guestsFrequency),
    })
  }
  if (prefs.overnight_guests != null && member.overnightGuests != null) {
    parts.push({
      weight: LIFESTYLE_PREF_WEIGHTS.overnight_guests,
      sim: likertSim(prefs.overnight_guests, member.overnightGuests),
    })
  }
  if (prefs.parties_frequency != null && member.partiesFrequency != null) {
    parts.push({
      weight: LIFESTYLE_PREF_WEIGHTS.parties_frequency,
      sim: likertSim(prefs.parties_frequency, member.partiesFrequency),
    })
  }
  if (prefs.social_level != null && member.socialLevel != null) {
    parts.push({
      weight: LIFESTYLE_PREF_WEIGHTS.social_level,
      sim: likertSim(Number(prefs.social_level), member.socialLevel),
    })
  }
  if (prefs.chores_expectation != null && member.choresExpectation != null) {
    parts.push({
      weight: LIFESTYLE_PREF_WEIGHTS.chores_expectation,
      sim: likertSim(prefs.chores_expectation, member.choresExpectation),
    })
  }
  if (prefs.preferred_schedule && member.preferredSchedule) {
    parts.push({
      weight: LIFESTYLE_PREF_WEIGHTS.preferred_schedule,
      sim: scheduleSim(prefs.preferred_schedule, member.preferredSchedule),
    })
  }

  if (!parts.length) {
    // No overlapping prefs yet — neutral, slightly below a strong match so
    // listings with filled lifestyle prefs can still differentiate.
    return 0.62
  }

  const weightSum = parts.reduce((s, p) => s + p.weight, 0)
  return clamp01(parts.reduce((s, p) => s + (p.weight / weightSum) * p.sim, 0))
}

function scoreTimeline(
  members: MemberHousingSignals[],
  listing: ListingScoreInput
): number {
  const flexDays = minOrNull(members.map((m) => m.moveInFlexibilityDays)) ?? 30

  let moveInScore = 0.55
  if (listing.availableFrom) {
    const available = new Date(listing.availableFrom)
    if (!Number.isNaN(available.getTime())) {
      const now = new Date()
      const daysUntil = Math.ceil(
        (available.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntil <= flexDays && daysUntil >= -14) {
        moveInScore = clamp01(0.7 + (1 - Math.abs(daysUntil) / Math.max(flexDays, 1)) * 0.3)
      } else if (daysUntil > flexDays) {
        const overshoot = daysUntil - flexDays
        moveInScore = clamp01(0.65 - overshoot / 180)
      } else {
        // Already available for a while — still fine if student is flexible
        moveInScore = clamp01(0.55 + flexDays / 120)
      }
    }
  } else {
    moveInScore = clamp01(0.45 + flexDays / 90)
  }

  let stayScore = 0.7
  const listingMin = listing.minStayMonths ?? listing.dealbreakers?.min_stay_months ?? null
  const listingMax = listing.maxStayMonths ?? null
  const studentMins = members
    .map((m) => m.minStayMonths)
    .filter((n): n is number => typeof n === 'number' && n > 0)
  const studentMaxes = members
    .map((m) => m.maxStayMonths)
    .filter((n): n is number => typeof n === 'number' && n > 0)

  if (listingMin != null && studentMins.length) {
    const studentMin = Math.min(...studentMins)
    // Student willing to stay at least as long as host requires
    stayScore = studentMin >= listingMin ? 1 : clamp01(studentMin / listingMin)
  }
  if (listingMax != null && studentMaxes.length) {
    const studentMax = Math.max(...studentMaxes)
    const maxFit = studentMax <= listingMax ? 1 : clamp01(listingMax / studentMax)
    stayScore = (stayScore + maxFit) / 2
  }

  return clamp01(0.65 * moveInScore + 0.35 * stayScore)
}

function scoreAmenities(
  members: MemberHousingSignals[],
  listingAmenities: string[]
): number {
  const listingSet = new Set(listingAmenities.map(normalizeAmenityKey))
  const required = members.flatMap((m) => m.requiredAmenities || []).map(normalizeAmenityKey)
  const preferred = members.flatMap((m) => m.preferredAmenities || []).map(normalizeAmenityKey)

  // No amenity prefs stated — neutral baseline (independent of house-rule conflicts)
  if (!required.length && !preferred.length) {
    return 0.72
  }

  let requiredScore = 1
  if (required.length) {
    const uniqueReq = [...new Set(required)]
    const hit = uniqueReq.filter((a) => listingSet.has(a)).length
    requiredScore = hit / uniqueReq.length
    if (requiredScore < 1) {
      // Missing a required amenity is a soft penalty (house-rule conflicts handled separately)
      requiredScore *= 0.85
    }
  }

  let preferredScore = 0.7
  if (preferred.length) {
    const uniquePref = [...new Set(preferred)]
    const hit = uniquePref.filter((a) => listingSet.has(a)).length
    preferredScore = uniquePref.length ? hit / uniquePref.length : 0.7
  }

  return clamp01(0.65 * requiredScore + 0.35 * preferredScore)
}

/**
 * Score a set of applicants (1..n) against a listing.
 * cohesionScore: pass group internal fit (0-1) from group-compat v2; 1 for individuals.
 */
export function scoreGroupAgainstListing(
  members: MemberHousingSignals[],
  listing: ListingScoreInput,
  cohesionScore = 1
): GroupListingScoreResult {
  const groupSize = Math.max(1, members.length)
  const watchOuts: string[] = []
  const gateConflicts: string[] = []
  const deal = listing.dealbreakers || {}
  const prefs = listing.lifestylePrefs || {}

  // --- Hard gates (any member fails → conflict) ---
  if (deal.no_smoking || !listing.smokingAllowed) {
    const smokers = members.filter((m) => m.smokingOk === true)
    if (smokers.length) {
      gateConflicts.push('smoking')
      watchOuts.push('At least one applicant is open to smoking while this listing prefers smoke-free')
    }
  }
  if (deal.no_pets || !listing.petFriendly) {
    const petPeople = members.filter((m) => m.petsOk === true)
    if (petPeople.length) {
      gateConflicts.push('pets')
      watchOuts.push('Pet preference conflicts with listing rules')
    }
  }
  if (deal.no_airbnb) {
    const airbnb = members.filter((m) => m.airbnbOk === true)
    if (airbnb.length) {
      gateConflicts.push('airbnb')
      watchOuts.push('Short-let / Airbnb openness conflicts with house rules')
    }
  }
  if (deal.brp_required) {
    const needBrp = members.filter((m) => m.brpNeeded === true)
    if (needBrp.length === members.length) {
      watchOuts.push('Applicants need BRP registration support')
    }
  }

  const maxGroup = deal.max_group_size ?? listing.seekingPeople ?? listing.availableRooms
  if (groupSize > maxGroup) {
    gateConflicts.push('group_size')
    watchOuts.push(`Group size (${groupSize}) exceeds seeking capacity (${maxGroup})`)
  }

  const hardGatesPassed = gateConflicts.length === 0

  // --- Budget: listing must fit every member (min of fits) ---
  const budgetFits = members.map((m) => {
    if (!m.maxRentMonthly || m.maxRentMonthly <= 0) return 0.7
    if (listing.rentMonthly <= m.maxRentMonthly) {
      const headroom = (m.maxRentMonthly - listing.rentMonthly) / Math.max(m.maxRentMonthly, 1)
      return clamp01(0.75 + headroom * 0.25)
    }
    const over = (listing.rentMonthly - m.maxRentMonthly) / Math.max(m.maxRentMonthly, 1)
    return clamp01(1 - over)
  })
  const budget = minOrNull(budgetFits) ?? 0.5
  if (budget < 0.5) watchOuts.push('Budget is tight for at least one applicant')

  // --- Timeline: move-in window + stay length ---
  const timeline = scoreTimeline(members, listing)
  if (timeline < 0.45) watchOuts.push('Move-in or stay length may not align with this listing')

  // --- Capacity ---
  const capacityTarget = Math.max(listing.seekingPeople || 1, listing.availableRooms || 1)
  const capacity =
    groupSize === capacityTarget
      ? 1
      : groupSize < capacityTarget
        ? clamp01(groupSize / capacityTarget)
        : 0.2

  // --- Lifestyle vs listing prefs (worst-member of weighted prefs) ---
  const lifestyleScores = members.map((m) => scoreMemberLifestyle(m, prefs))
  const lifestyle = minOrNull(lifestyleScores) ?? 0.62
  if (lifestyle < 0.5) watchOuts.push('Lifestyle preferences diverge from what this host wants')

  // --- Amenities (required / preferred overlap) ---
  const amenities = scoreAmenities(members, listing.amenities || [])

  const cohesion = clamp01(cohesionScore)

  // Soft blend, then multiplicative dealbreaker drag (no hard cap).
  // overall = softOverall × Π(1 − weight_d) for each house-rule conflict.
  const softOverall = clamp01(
    LISTING_FIT_WEIGHTS.lifestyle * lifestyle +
      LISTING_FIT_WEIGHTS.budget * budget +
      LISTING_FIT_WEIGHTS.timeline * timeline +
      LISTING_FIT_WEIGHTS.capacity * capacity +
      LISTING_FIT_WEIGHTS.amenities * amenities +
      LISTING_FIT_WEIGHTS.cohesion * cohesion
  )
  const gateFactor = dealbreakerFactor(gateConflicts)
  const overall = clamp01(softOverall * gateFactor)

  const verificationBadges: string[] = []
  if (members.every((m) => m.verified)) verificationBadges.push('id_verified')
  if (members.every((m) => m.universityEmailVerified)) verificationBadges.push('university_email')
  if (groupSize > 1) verificationBadges.push('group_application')

  const breakdown = {
    lifestyle: clamp01(lifestyle),
    budget: clamp01(budget),
    timeline: clamp01(timeline),
    capacity: clamp01(capacity),
    amenities: clamp01(amenities),
  }

  const insights = buildListingFitInsights(
    members,
    listing,
    breakdown,
    overall
  )

  return {
    overall,
    softOverall,
    dealbreakerFactor: gateFactor,
    cohesion,
    hardGatesPassed,
    gateConflicts,
    breakdown,
    watchOuts,
    insights,
    verificationBadges,
    groupSize,
  }
}

export function anonymousApplicantLabel(index: number, groupSize: number): string {
  const letter = String.fromCharCode(65 + (index % 26))
  if (groupSize > 1) return `Applicant group ${letter}`
  return `Applicant ${letter}`
}
