// Answer transformation logic
// Converts raw onboarding_sections answers to engine format for matching

import itemBank from '@/data/item-bank.v1.json'
import { VECTOR_MAPPING } from './scoring'

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
  
  // Use VECTOR_MAPPING from scoring.ts for consistency
  // Also handle legacy keys that might be used in older data
  const legacyKeyMap: Record<string, string> = {
    // Map any legacy question_key variations to current keys
    // Add any known legacy keys here if needed
  }
  
  // Map answers to vector positions
  for (const [itemId, value] of Object.entries(answers)) {
    // Check for legacy key mapping first
    const normalizedKey = legacyKeyMap[itemId] || itemId
    const position = VECTOR_MAPPING[normalizedKey as keyof typeof VECTOR_MAPPING]
    
    if (position !== undefined) {
      if (typeof value === 'number') {
        // Normalize value to 0-1 range (assuming 0-10 scale)
        vector[position] = Math.max(0, Math.min(1, value / 10))
      } else if (typeof value === 'string') {
        // Handle string values (e.g., sleep times)
        switch (normalizedKey) {
          case 'sleep_start':
          case 'sleep_end':
            const numValue = parseInt(value)
            if (!isNaN(numValue)) {
              vector[position] = numValue / 24 // Normalize to [0,1]
            }
            break
        }
      } else if (Array.isArray(value)) {
        // Handle array values (e.g., languages)
        vector[position] = value.length > 0 ? 1 : 0
      }
    }
  }
  
  // Normalize the vector (same as scoring.ts)
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  if (magnitude > 0) {
    return vector.map(val => val / magnitude)
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
