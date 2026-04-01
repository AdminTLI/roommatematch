// Deal-breaker filtering logic
// Checks hard constraints between two users to determine if they can be matched

import type { StudentProfile } from './answer-map'
import { isDealBreakerItem, getItemMetadata } from './answer-map'

export interface DealBreakerResult {
  canMatch: boolean
  reasons: string[]
  conflicts: string[]
}

export function checkDealBreakers(studentA: StudentProfile, studentB: StudentProfile): DealBreakerResult {
  const reasons: string[] = []
  const conflicts: string[] = []
  
  // Check location constraints
  const locationResult = checkLocationConstraints(studentA, studentB)
  if (!locationResult.canMatch) {
    conflicts.push(...locationResult.conflicts)
  } else {
    reasons.push(...locationResult.reasons)
  }
  
  // Check deal-breaker items
  const dealBreakerResult = checkDealBreakerItems(studentA, studentB)
  if (!dealBreakerResult.canMatch) {
    conflicts.push(...dealBreakerResult.conflicts)
  }
  
  // Check academic compatibility
  const academicResult = checkAcademicCompatibility(studentA, studentB)
  if (!academicResult.canMatch) {
    conflicts.push(...academicResult.conflicts)
  } else {
    reasons.push(...academicResult.reasons)
  }
  
  return {
    canMatch: conflicts.length === 0,
    reasons,
    conflicts
  }
}

function checkLocationConstraints(studentA: StudentProfile, studentB: StudentProfile): DealBreakerResult {
  const reasons: string[] = []
  const conflicts: string[] = []
  
  // Same city is always good
  if (studentA.campusCity && studentB.campusCity && studentA.campusCity === studentB.campusCity) {
    reasons.push(`Same city: ${studentA.campusCity}`)
    return { canMatch: true, reasons, conflicts }
  }
  
  // Check if both are open to cross-city
  const aOpenCrossCity = studentA.raw.openCrossCity !== 'no'
  const bOpenCrossCity = studentB.raw.openCrossCity !== 'no'
  
  if (aOpenCrossCity && bOpenCrossCity) {
    reasons.push('Both open to cross-city if needed')
    return { canMatch: true, reasons, conflicts }
  }
  
  // If one is not open to cross-city and they're in different cities, it's a conflict
  if (studentA.campusCity && studentB.campusCity && studentA.campusCity !== studentB.campusCity) {
    if (!aOpenCrossCity || !bOpenCrossCity) {
      conflicts.push('Location mismatch: different cities and not open to cross-city')
      return { canMatch: false, reasons, conflicts }
    }
  }
  
  return { canMatch: true, reasons, conflicts }
}

function checkDealBreakerItems(studentA: StudentProfile, studentB: StudentProfile): DealBreakerResult {
  const conflicts: string[] = []
  
  // Get all deal-breaker items from both students
  const aDealBreakers = Object.entries(studentA.raw)
    .filter(([itemId]) => isDealBreakerItem(itemId))
    .map(([itemId, value]) => ({ itemId, value }))
  
  const bDealBreakers = Object.entries(studentB.raw)
    .filter(([itemId]) => isDealBreakerItem(itemId))
    .map(([itemId, value]) => ({ itemId, value }))
  
  // Check for conflicting deal-breakers
  for (const aItem of aDealBreakers) {
    for (const bItem of bDealBreakers) {
      if (aItem.itemId === bItem.itemId) {
        const conflict = checkItemConflict(aItem.itemId, aItem.value, bItem.value)
        if (conflict) {
          conflicts.push(conflict)
        }
      }
    }
  }
  
  return {
    canMatch: conflicts.length === 0,
    reasons: [],
    conflicts
  }
}

function checkItemConflict(itemId: string, valueA: any, valueB: any): string | null {
  const item = getItemMetadata(itemId)
  if (!item) return null
  
  // Check for specific deal-breaker conflicts
  switch (itemId) {
    case 'M5_Q11': // Big parties (10+) frequency
      {
        const lowParty = (v: string) => v === 'party_never' || v === 'party_rarely'
        const highParty = (v: string) => v === 'party_weekly'
        if (lowParty(valueA) && highParty(valueB)) {
          return 'Social conflict: very different comfort with house parties'
        }
        if (lowParty(valueB) && highParty(valueA)) {
          return 'Social conflict: very different comfort with house parties'
        }
      }
      break
  }
  
  return null
}

function checkAcademicCompatibility(studentA: StudentProfile, studentB: StudentProfile): DealBreakerResult {
  const reasons: string[] = []
  const conflicts: string[] = []
  
  // Same university is good
  if (studentA.meta.universityId && studentB.meta.universityId && 
      studentA.meta.universityId === studentB.meta.universityId) {
    reasons.push('Same university')
  }
  
  // Same degree level is good
  if (studentA.meta.degreeLevel && studentB.meta.degreeLevel && 
      studentA.meta.degreeLevel === studentB.meta.degreeLevel) {
    reasons.push(`Same degree level: ${studentA.meta.degreeLevel}`)
  }
  
  // Check for large age/study year gaps
  if (studentA.meta.graduationYear && studentB.meta.graduationYear) {
    const yearGap = Math.abs(studentA.meta.graduationYear - studentB.meta.graduationYear)
    if (yearGap > 3) {
      conflicts.push(`Large age gap: ${yearGap} years difference`)
    } else if (yearGap <= 1) {
      reasons.push('Similar graduation year')
    }
  }
  
  return {
    canMatch: conflicts.length === 0,
    reasons,
    conflicts
  }
}

export function getReadableReasons(studentA: StudentProfile, studentB: StudentProfile): string[] {
  const result = checkDealBreakers(studentA, studentB)
  return result.reasons
}
