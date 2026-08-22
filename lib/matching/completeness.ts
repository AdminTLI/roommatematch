// Optional fields that don't affect matching scores (logistics/housing preferences)
// These can be missing without affecting eligibility
const OPTIONAL_FIELDS = [
  'move_in_window',
  'budget_min',
  'budget_max',
  'commute_max',
  'lease_length',
  'room_type',
] as const

// v1 required question keys (legacy 200-question bank)
const REQUIRED_QUESTION_KEYS_V1 = [
  // Basics
  'degree_level',
  'program',
  'campus',

  // Lifestyle (core matching fields)
  'sleep_start',
  'sleep_end',
  'study_intensity',
  'cleanliness_room',
  'cleanliness_kitchen',
  'noise_tolerance',
  'guests_frequency',
  'parties_frequency',
  'chores_preference',
  'alcohol_at_home',
  'pets_tolerance',

  // Social
  'social_level',
  'food_sharing',
  'utensils_sharing',

  // Personality
  'extraversion',
  'agreeableness',
  'conscientiousness',
  'neuroticism',
  'openness',

  // Communication
  'conflict_style',
  'communication_preference',

  // Languages
  'languages_daily',

  // Deal breakers (v1 only)
  'smoking',
  'pets_allowed',
  'parties_max',
  'guests_max',
] as const

// v2 required item IDs — all 60 questions across the 5 new modules.
// Sections: logistics-context (M1_*), environment-rhythms (M2_*),
// cleanliness-operations (M3_*), communication-resolution (M4_*), social-spaces (M5_*)
const REQUIRED_QUESTION_KEYS_V2 = [
  // M1 – Logistics & Context (12 items, feed context score only)
  'M1_Q1', 'M1_Q2', 'M1_Q3', 'M1_Q4', 'M1_Q5', 'M1_Q6',
  'M1_Q7', 'M1_Q8', 'M1_Q9', 'M1_Q10', 'M1_Q11', 'M1_Q12',
  // M2 – Environment & Rhythms (12 items)
  'M2_Q1', 'M2_Q2', 'M2_Q3', 'M2_Q4', 'M2_Q5', 'M2_Q6',
  'M2_Q7', 'M2_Q8', 'M2_Q9', 'M2_Q10', 'M2_Q11', 'M2_Q12',
  // M3 – Cleanliness & Operations (12 items)
  'M3_Q1', 'M3_Q2', 'M3_Q3', 'M3_Q4', 'M3_Q5', 'M3_Q6',
  'M3_Q7', 'M3_Q8', 'M3_Q9', 'M3_Q10', 'M3_Q11', 'M3_Q12',
  // M4 – Communication & Resolution (12 items)
  'M4_Q1', 'M4_Q2', 'M4_Q3', 'M4_Q4', 'M4_Q5', 'M4_Q6',
  'M4_Q7', 'M4_Q8', 'M4_Q9', 'M4_Q10', 'M4_Q11', 'M4_Q12',
  // M5 – Social & Spaces (12 items, includes 4 hard gates)
  'M5_Q1', 'M5_Q2', 'M5_Q3', 'M5_Q4', 'M5_Q5', 'M5_Q6',
  'M5_Q7', 'M5_Q8', 'M5_Q9', 'M5_Q10', 'M5_Q11', 'M5_Q12',
] as const

// Back-compat alias — matching is v2-only going forward
const REQUIRED_QUESTION_KEYS = REQUIRED_QUESTION_KEYS_V2

/**
 * Detect whether a flat answers record belongs to the v2 questionnaire.
 * Note: legacy v1 also used M*_Q* ids in some banks; prefer section-based checks
 * at the DB layer. For flat maps, treat M1–M5 keys as v2.
 */
function isV2Answers(answers: Record<string, any>): boolean {
  return Object.keys(answers).some((k) => /^M[1-5]_Q\d+$/.test(k))
}

function hasAnswerValue(value: unknown): boolean {
  return (
    value !== undefined &&
    value !== null &&
    value !== '' &&
    !(Array.isArray(value) && value.length === 0)
  )
}

/**
 * Check if a user has answered all required questions for matching (v2 only).
 * Accepts flat maps keyed by M1_Q1 … M5_Q12 (from onboarding_sections).
 */
export function hasCompleteResponses(answers: Record<string, any>): boolean {
  return REQUIRED_QUESTION_KEYS_V2.every((key) => hasAnswerValue(answers[key]))
}

/**
 * v2 users often store answers only in onboarding_sections (itemId keys),
 * while legacy submit paths map to question_key names in `responses`.
 */
export function isEligibleForMatching(answers: Record<string, any>): boolean {
  const hasV2ItemKeys = Object.keys(answers).some((k) => /^M[1-5]_Q\d+$/.test(k))
  if (hasV2ItemKeys) {
    return hasCompleteResponses(answers)
  }
  // Legacy flat responses cannot satisfy v2-only matching anymore.
  return false
}

/**
 * Get the count of missing required fields
 */
export function getMissingFieldsCount(answers: Record<string, any>): number {
  return REQUIRED_QUESTION_KEYS_V2.filter((key) => {
    const value = answers[key]
    return value === undefined || value === null || value === '' ||
           (Array.isArray(value) && value.length === 0)
  }).length
}

/**
 * Get the list of missing required fields
 */
export function getMissingFields(answers: Record<string, any>): string[] {
  return REQUIRED_QUESTION_KEYS_V2.filter((key) => {
    const value = answers[key]
    return value === undefined || value === null || value === '' ||
           (Array.isArray(value) && value.length === 0)
  })
}

/**
 * Calculate completion percentage
 */
export function getCompletionPercentage(answers: Record<string, any>): number {
  const total = REQUIRED_QUESTION_KEYS_V2.length
  const missing = getMissingFieldsCount(answers)
  return Math.round(((total - missing) / total) * 100)
}

// Export for debugging and external use
export { REQUIRED_QUESTION_KEYS, REQUIRED_QUESTION_KEYS_V1, REQUIRED_QUESTION_KEYS_V2, isV2Answers }
