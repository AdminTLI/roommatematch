import { questionSchemas } from './validation'

// Map question keys to their sections
export const questionToSection: Record<string, string> = {
  // Basics
  'degree_level': 'basics',
  'program': 'basics',
  'campus': 'basics',
  'move_in_window': 'basics',
  
  // Logistics
  'budget_min': 'logistics',
  'budget_max': 'logistics',
  'commute_max': 'logistics',
  'lease_length': 'logistics',
  'room_type': 'logistics',
  
  // Lifestyle
  'sleep_start': 'lifestyle',
  'sleep_end': 'lifestyle',
  'study_intensity': 'lifestyle',
  'cleanliness_room': 'lifestyle',
  'cleanliness_kitchen': 'lifestyle',
  'noise_tolerance': 'lifestyle',
  'guests_frequency': 'lifestyle',
  'parties_frequency': 'lifestyle',
  'chores_preference': 'lifestyle',
  'alcohol_at_home': 'lifestyle',
  'pets_tolerance': 'lifestyle',
  
  // Social
  'social_level': 'social',
  'food_sharing': 'social',
  'utensils_sharing': 'social',
  
  // Personality
  'extraversion': 'personality',
  'agreeableness': 'personality',
  'conscientiousness': 'personality',
  'neuroticism': 'personality',
  'openness': 'personality',
  
  // Communication
  'conflict_style': 'communication',
  'communication_preference': 'communication',
  
  // Languages
  'languages_daily': 'languages',
  
  // Deal breakers
  'smoking': 'deal_breakers',
  'pets_allowed': 'deal_breakers',
  'parties_max': 'deal_breakers',
  'guests_max': 'deal_breakers',
}

export function calculateSectionProgress(missingKeys: string[]): {
  completedSections: number
  totalSections: number
  sectionDetails: Record<string, { completed: number; total: number }>
} {
  const allKeys = Object.keys(questionSchemas)
  const completedKeys = allKeys.filter(key => !missingKeys.includes(key))
  
  // Group by section
  const sectionCompletion: Record<string, { completed: number; total: number }> = {}
  
  for (const key of allKeys) {
    const section = questionToSection[key] || 'other'
    if (!sectionCompletion[section]) {
      sectionCompletion[section] = { completed: 0, total: 0 }
    }
    sectionCompletion[section].total++
    if (completedKeys.includes(key)) {
      sectionCompletion[section].completed++
    }
  }
  
  // Count fully completed sections
  const completedSections = Object.values(sectionCompletion).filter(
    s => s.completed === s.total
  ).length
  
  const totalSections = Object.keys(sectionCompletion).length
  
  return {
    completedSections,
    totalSections,
    sectionDetails: sectionCompletion
  }
}
