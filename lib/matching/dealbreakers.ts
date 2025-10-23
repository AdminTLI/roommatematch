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
    case 'M2_Q20': // No loud calls/gaming in common areas after quiet hours
      if (valueA === 'strongly_disagree' && valueB === 'strongly_agree') {
        return 'Quiet hours conflict: one needs silence, other is noisy'
      }
      break
      
    case 'M3_Q15': // Smoking tolerance
      if (valueA === 'no_smoking' && valueB === 'smoking_ok') {
        return 'Smoking conflict: one is non-smoker, other is smoker'
      }
      break
      
    case 'M4_Q8': // Pet tolerance
      if (valueA === 'no_pets' && valueB === 'pets_ok') {
        return 'Pet conflict: one doesn\'t want pets, other has/wants pets'
      }
      break
      
    case 'M5_Q12': // Party frequency
      if ((valueA === 'never' || valueA === 'rarely') && valueB === 'frequently') {
        return 'Social conflict: one is quiet, other is very social'
      }
      break
      
    case 'M6_Q18': // Alcohol at home
      if (valueA === 'no_alcohol' && valueB === 'alcohol_ok') {
        return 'Alcohol conflict: one doesn\'t want alcohol at home, other is okay with it'
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
