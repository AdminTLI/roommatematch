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

// Required question keys for complete onboarding
// Core compatibility fields needed for matching algorithm
const REQUIRED_QUESTION_KEYS = [
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
  
  // Deal breakers
  'smoking',
  'pets_allowed',
  'parties_max',
  'guests_max',
] as const

/**
 * Check if a user has answered all required questions for matching
 */
export function hasCompleteResponses(answers: Record<string, any>): boolean {
  return REQUIRED_QUESTION_KEYS.every(key => {
    const value = answers[key]
    
    // Special handling for campus - allow null/empty as it's used for filtering, not scoring
    if (key === 'campus') {
      // Campus is optional if user has other academic info
      return true
    }
    
    return value !== undefined && value !== null && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true)
  })
}

/**
 * Get the count of missing required fields
 */
export function getMissingFieldsCount(answers: Record<string, any>): number {
  return REQUIRED_QUESTION_KEYS.filter(key => {
    const value = answers[key]
    return value === undefined || value === null || value === '' || 
           (Array.isArray(value) && value.length === 0)
  }).length
}

/**
 * Get the list of missing required fields
 */
export function getMissingFields(answers: Record<string, any>): string[] {
  return REQUIRED_QUESTION_KEYS.filter(key => {
    // Skip campus in missing fields check (it's optional)
    if (key === 'campus') {
      return false
    }
    
    const value = answers[key]
    return value === undefined || value === null || value === '' || 
           (Array.isArray(value) && value.length === 0)
  })
}

/**
 * Calculate completion percentage
 */
export function getCompletionPercentage(answers: Record<string, any>): number {
  const total = REQUIRED_QUESTION_KEYS.length
  const completed = total - getMissingFieldsCount(answers)
  return Math.round((completed / total) * 100)
}

/**
 * Check if user is eligible for matching (has complete responses)
 */
export function isEligibleForMatching(answers: Record<string, any>): boolean {
  return hasCompleteResponses(answers)
}

// Export REQUIRED_QUESTION_KEYS for debugging and external use
export { REQUIRED_QUESTION_KEYS }
