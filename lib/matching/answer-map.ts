// Answer transformation logic
// Converts raw onboarding_sections answers to engine format for matching

import itemBank from '@/data/item-bank.v1.json'

export interface StudentProfile {
  id: string
  raw: Record<string, any> // itemId -> value
  campusCity?: string
  openCrossCity?: string
  maxCommutePtBand?: string
  meta: {
    universityId?: string
    degreeLevel?: string
    programmeId?: string
    graduationYear?: number
  }
}

export interface DealBreaker {
  itemId: string
  value: any
  isDealBreaker: boolean
}

export function toStudent(candidate: {
  id: string
  answers: Record<string, any>
  campusCity?: string
  universityId?: string
  degreeLevel?: string
  programmeId?: string
  graduationYear?: number
}): StudentProfile {
  return {
    id: candidate.id,
    raw: candidate.answers,
    campusCity: candidate.campusCity,
    openCrossCity: candidate.answers.openCrossCity,
    maxCommutePtBand: candidate.answers.maxCommutePtBand,
    meta: {
      universityId: candidate.universityId,
      degreeLevel: candidate.degreeLevel,
      programmeId: candidate.programmeId,
      graduationYear: candidate.graduationYear
    }
  }
}

export function extractDealBreakers(answers: Record<string, any>): DealBreaker[] {
  const dealBreakers: DealBreaker[] = []
  
  // Find items marked as deal-breakers in the item bank
  const dealBreakerItems = itemBank.filter((item: any) => item.dbEligible === true)
  
  for (const item of dealBreakerItems) {
    const value = answers[item.id]
    if (value !== undefined) {
      dealBreakers.push({
        itemId: item.id,
        value,
        isDealBreaker: true
      })
    }
  }
  
  return dealBreakers
}

export function mapAnswersToVector(answers: Record<string, any>): number[] {
  // Create a 50-dimensional vector based on the VECTOR_MAPPING from scoring.ts
  const vector = new Array(50).fill(0)
  
  // Map specific answers to vector positions
  const mappings: Record<string, number> = {
    // Lifestyle dimensions (0-9)
    sleep_start: 0,
    sleep_end: 1,
    study_intensity: 2,
    cleanliness_room: 3,
    cleanliness_kitchen: 4,
    noise_tolerance: 5,
    guests_frequency: 6,
    parties_frequency: 7,
    chores_preference: 8,
    alcohol_at_home: 9,
    
    // Social dimensions (10-19)
    social_level: 10,
    food_sharing: 11,
    utensils_sharing: 12,
    
    // Personality dimensions (20-39) - Big Five
    extraversion: 20,
    agreeableness: 21,
    conscientiousness: 22,
    neuroticism: 23,
    openness: 24,
    
    // Communication style (40-49)
    conflict_style: 40,
    communication_preference: 41
  }
  
  // Map answers to vector positions
  for (const [itemId, value] of Object.entries(answers)) {
    const position = mappings[itemId]
    if (position !== undefined && typeof value === 'number') {
      // Normalize value to 0-1 range
      vector[position] = Math.max(0, Math.min(1, value / 10))
    }
  }
  
  return vector
}

export function getItemMetadata(itemId: string) {
  return itemBank.find((item: any) => item.id === itemId)
}

export function isDealBreakerItem(itemId: string): boolean {
  const item = getItemMetadata(itemId)
  return item?.dbEligible === true
}
