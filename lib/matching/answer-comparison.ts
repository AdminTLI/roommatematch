// Answer comparison logic
// Analyzes alignments and differences between two users' answers

import type { StudentProfile } from './answer-map'
import { getItemMetadata } from './answer-map'
import { humanizeAnswer, formatTimeRangeForDisplay, describeBipolarValue } from './answer-humanizer'

export interface AnswerAlignment {
  itemId: string
  category: 'schedule' | 'lifestyle' | 'social' | 'personality' | 'academic'
  strength: 'exact_match' | 'close_match' | 'complementary' | 'different' | 'conflict'
  description: string
  valueA: any
  valueB: any
  humanizedA: string
  humanizedB: string
}

/**
 * Compare specific answers between two students
 */
export function compareAnswers(
  studentA: StudentProfile,
  studentB: StudentProfile
): AnswerAlignment[] {
  const alignments: AnswerAlignment[] = []

  // Compare sleep schedules
  compareSleepSchedules(studentA, studentB, alignments)
  
  // Compare cleanliness standards
  compareCleanliness(studentA, studentB, alignments)
  
  // Compare noise tolerance
  compareNoiseTolerance(studentA, studentB, alignments)
  
  // Compare social preferences
  compareSocialPreferences(studentA, studentB, alignments)
  
  // Compare personality traits
  comparePersonalityTraits(studentA, studentB, alignments)

  return alignments
}

/**
 * Compare sleep schedules
 */
function compareSleepSchedules(
  studentA: StudentProfile,
  studentB: StudentProfile,
  alignments: AnswerAlignment[]
) {
  // Compare chronotype (M2_Q1)
  const chronoA = studentA.raw['M2_Q1']
  const chronoB = studentB.raw['M2_Q1']
  if (chronoA !== undefined && chronoA !== null && chronoB !== undefined && chronoB !== null) {
    const valueA = typeof chronoA === 'object' && chronoA !== null && 'value' in chronoA ? chronoA.value : chronoA
    const valueB = typeof chronoB === 'object' && chronoB !== null && 'value' in chronoB ? chronoB.value : chronoB
    if (typeof valueA === 'number' && typeof valueB === 'number' && Math.abs(valueA - valueB) <= 1) {
      alignments.push({
        itemId: 'M2_Q1',
        category: 'schedule',
        strength: 'exact_match',
        description: 'Similar chronotype preferences',
        valueA: chronoA,
        valueB: chronoB,
        humanizedA: describeBipolarValue('M2_Q1', chronoA),
        humanizedB: describeBipolarValue('M2_Q1', chronoB)
      })
    }
  }

  // Compare sleep times (M2_Q2 - weeknight)
  const sleepA = studentA.raw['M2_Q2']
  const sleepB = studentB.raw['M2_Q2']
  if (sleepA && sleepB) {
    const valueA = typeof sleepA === 'object' ? sleepA : sleepA
    const valueB = typeof sleepB === 'object' ? sleepB : sleepB
    
    if (typeof valueA === 'object' && typeof valueB === 'object' && 
        'start' in valueA && 'end' in valueA && 'start' in valueB && 'end' in valueB) {
      const startA = parseTime(valueA.start)
      const endA = parseTime(valueA.end)
      const startB = parseTime(valueB.start)
      const endB = parseTime(valueB.end)
      
      const startDiff = Math.abs(startA - startB)
      const endDiff = Math.abs(endA - endB)
      
      if (startDiff <= 1 && endDiff <= 1) {
        alignments.push({
          itemId: 'M2_Q2',
          category: 'schedule',
          strength: 'exact_match',
          description: 'Similar sleep schedules',
          valueA: sleepA,
          valueB: sleepB,
          humanizedA: formatTimeRangeForDisplay(valueA),
          humanizedB: formatTimeRangeForDisplay(valueB)
        })
      } else if (startDiff <= 2 && endDiff <= 2) {
        alignments.push({
          itemId: 'M2_Q2',
          category: 'schedule',
          strength: 'close_match',
          description: 'Similar sleep schedules',
          valueA: sleepA,
          valueB: sleepB,
          humanizedA: formatTimeRangeForDisplay(valueA),
          humanizedB: formatTimeRangeForDisplay(valueB)
        })
      }
    }
  }

  // Compare quiet hours (M2_Q13)
  const quietA = studentA.raw['M2_Q13']
  const quietB = studentB.raw['M2_Q13']
  if (quietA && quietB) {
    const valueA = typeof quietA === 'object' ? quietA.value : quietA
    const valueB = typeof quietB === 'object' ? quietB.value : quietB
    if (valueA === valueB) {
      alignments.push({
        itemId: 'M2_Q13',
        category: 'schedule',
        strength: 'exact_match',
        description: 'Same quiet hours preference',
        valueA: quietA,
        valueB: quietB,
        humanizedA: humanizeAnswer('M2_Q13', quietA),
        humanizedB: humanizeAnswer('M2_Q13', quietB)
      })
    }
  }
}

/**
 * Compare cleanliness standards
 */
function compareCleanliness(
  studentA: StudentProfile,
  studentB: StudentProfile,
  alignments: AnswerAlignment[]
) {
  // Compare kitchen cleanliness (M4_Q1)
  const kitchenA = studentA.raw['M4_Q1']
  const kitchenB = studentB.raw['M4_Q1']
  if (kitchenA && kitchenB) {
    const valueA = typeof kitchenA === 'object' ? kitchenA.value : kitchenA
    const valueB = typeof kitchenB === 'object' ? kitchenB.value : kitchenB
    if (valueA === valueB) {
      alignments.push({
        itemId: 'M4_Q1',
        category: 'lifestyle',
        strength: 'exact_match',
        description: 'Same kitchen cleanliness standard',
        valueA: kitchenA,
        valueB: kitchenB,
        humanizedA: humanizeAnswer('M4_Q1', kitchenA),
        humanizedB: humanizeAnswer('M4_Q1', kitchenB)
      })
    }
  }

  // Compare bathroom cleanliness (M4_Q2)
  const bathroomA = studentA.raw['M4_Q2']
  const bathroomB = studentB.raw['M4_Q2']
  if (bathroomA && bathroomB) {
    const valueA = typeof bathroomA === 'object' ? bathroomA.value : bathroomA
    const valueB = typeof bathroomB === 'object' ? bathroomB.value : bathroomB
    if (valueA === valueB) {
      alignments.push({
        itemId: 'M4_Q2',
        category: 'lifestyle',
        strength: 'exact_match',
        description: 'Same bathroom cleanliness standard',
        valueA: bathroomA,
        valueB: bathroomB,
        humanizedA: humanizeAnswer('M4_Q2', bathroomA),
        humanizedB: humanizeAnswer('M4_Q2', bathroomB)
      })
    }
  }

  // Compare shoes policy (M4_Q11)
  const shoesA = studentA.raw['M4_Q11']
  const shoesB = studentB.raw['M4_Q11']
  if (shoesA && shoesB) {
    const valueA = typeof shoesA === 'object' ? shoesA.value : shoesA
    const valueB = typeof shoesB === 'object' ? shoesB.value : shoesB
    if (valueA === valueB) {
      alignments.push({
        itemId: 'M4_Q11',
        category: 'lifestyle',
        strength: 'exact_match',
        description: 'Same shoes policy',
        valueA: shoesA,
        valueB: shoesB,
        humanizedA: describeBipolarValue('M4_Q11', shoesA),
        humanizedB: describeBipolarValue('M4_Q11', shoesB)
      })
    }
  }
}

/**
 * Compare noise tolerance
 */
function compareNoiseTolerance(
  studentA: StudentProfile,
  studentB: StudentProfile,
  alignments: AnswerAlignment[]
) {
  // Compare noise sensitivity (M3_Q1)
  const noiseA = studentA.raw['M3_Q1']
  const noiseB = studentB.raw['M3_Q1']
  if (noiseA && noiseB) {
    const valueA = typeof noiseA === 'object' ? noiseA.value : noiseA
    const valueB = typeof noiseB === 'object' ? noiseB.value : noiseB
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      const diff = Math.abs(valueA - valueB)
      if (diff <= 1) {
        alignments.push({
          itemId: 'M3_Q1',
          category: 'lifestyle',
          strength: 'close_match',
          description: 'Similar noise sensitivity',
          valueA: noiseA,
          valueB: noiseB,
          humanizedA: humanizeAnswer('M3_Q1', noiseA),
          humanizedB: humanizeAnswer('M3_Q1', noiseB)
        })
      }
    }
  }

  // Compare temperature preference (M3_Q12)
  const tempA = studentA.raw['M3_Q12']
  const tempB = studentB.raw['M3_Q12']
  if (tempA && tempB) {
    const valueA = typeof tempA === 'object' ? tempA.value : tempA
    const valueB = typeof tempB === 'object' ? tempB.value : tempB
    if (valueA === valueB) {
      alignments.push({
        itemId: 'M3_Q12',
        category: 'lifestyle',
        strength: 'exact_match',
        description: 'Same temperature preference',
        valueA: tempA,
        valueB: tempB,
        humanizedA: humanizeAnswer('M3_Q12', tempA),
        humanizedB: humanizeAnswer('M3_Q12', tempB)
      })
    }
  }
}

/**
 * Compare social preferences
 */
function compareSocialPreferences(
  studentA: StudentProfile,
  studentB: StudentProfile,
  alignments: AnswerAlignment[]
) {
  // Compare home identity (M1_Q6)
  const homeA = studentA.raw['M1_Q6']
  const homeB = studentB.raw['M1_Q6']
  if (homeA && homeB) {
    const valueA = typeof homeA === 'object' ? homeA.value : homeA
    const valueB = typeof homeB === 'object' ? homeB.value : homeB
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      const diff = Math.abs(valueA - valueB)
      if (diff <= 1) {
        alignments.push({
          itemId: 'M1_Q6',
          category: 'social',
          strength: 'close_match',
          description: 'Similar home environment preference',
          valueA: homeA,
          valueB: homeB,
          humanizedA: describeBipolarValue('M1_Q6', homeA),
          humanizedB: describeBipolarValue('M1_Q6', homeB)
        })
      }
    }
  }

  // Compare guest frequency (M5_Q3)
  const guestsA = studentA.raw['M5_Q3']
  const guestsB = studentB.raw['M5_Q3']
  if (guestsA && guestsB) {
    const valueA = typeof guestsA === 'object' ? guestsA.value : guestsA
    const valueB = typeof guestsB === 'object' ? guestsB.value : guestsB
    if (valueA === valueB) {
      alignments.push({
        itemId: 'M5_Q3',
        category: 'social',
        strength: 'exact_match',
        description: 'Similar guest frequency preference',
        valueA: guestsA,
        valueB: guestsB,
        humanizedA: humanizeAnswer('M5_Q3', guestsA),
        humanizedB: humanizeAnswer('M5_Q3', guestsB)
      })
    }
  }
}

/**
 * Compare personality traits
 */
function comparePersonalityTraits(
  studentA: StudentProfile,
  studentB: StudentProfile,
  alignments: AnswerAlignment[]
) {
  // Compare feedback style (M1_Q7)
  const feedbackA = studentA.raw['M1_Q7']
  const feedbackB = studentB.raw['M1_Q7']
  if (feedbackA && feedbackB) {
    const valueA = typeof feedbackA === 'object' ? feedbackA.value : feedbackA
    const valueB = typeof feedbackB === 'object' ? feedbackB.value : feedbackB
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      const diff = Math.abs(valueA - valueB)
      if (diff <= 1) {
        alignments.push({
          itemId: 'M1_Q7',
          category: 'personality',
          strength: 'close_match',
          description: 'Similar communication style',
          valueA: feedbackA,
          valueB: feedbackB,
          humanizedA: describeBipolarValue('M1_Q7', feedbackA),
          humanizedB: describeBipolarValue('M1_Q7', feedbackB)
        })
      }
    }
  }

  // Compare flexibility (M1_Q11)
  const flexA = studentA.raw['M1_Q11']
  const flexB = studentB.raw['M1_Q11']
  if (flexA && flexB) {
    const valueA = typeof flexA === 'object' ? flexA.value : flexA
    const valueB = typeof flexB === 'object' ? flexB.value : flexB
    if (typeof valueA === 'number' && typeof valueB === 'number' && 
        valueA >= 4 && valueB >= 4) {
      alignments.push({
        itemId: 'M1_Q11',
        category: 'personality',
        strength: 'exact_match',
        description: 'Both value flexibility',
        valueA: flexA,
        valueB: flexB,
        humanizedA: humanizeAnswer('M1_Q11', flexA),
        humanizedB: humanizeAnswer('M1_Q11', flexB)
      })
    }
  }
}

/**
 * Parse time string to hours for comparison (e.g., "22:00" -> 22)
 */
function parseTime(time: string): number {
  if (!time || typeof time !== 'string') return 0
  const parts = time.split(':')
  if (parts.length >= 1) {
    return parseInt(parts[0], 10) || 0
  }
  return 0
}

/**
 * Find top alignments by strength and category
 */
export function getTopAlignments(
  alignments: AnswerAlignment[],
  maxCount: number = 3
): AnswerAlignment[] {
  // Sort by strength priority
  const strengthOrder = {
    'exact_match': 4,
    'close_match': 3,
    'complementary': 2,
    'different': 1,
    'conflict': 0
  }

  return alignments
    .sort((a, b) => {
      const strengthDiff = strengthOrder[b.strength] - strengthOrder[a.strength]
      if (strengthDiff !== 0) return strengthDiff
      
      // Secondary sort by category priority
      const categoryOrder = {
        'schedule': 5,
        'lifestyle': 4,
        'social': 3,
        'personality': 2,
        'academic': 1
      }
      return categoryOrder[b.category] - categoryOrder[a.category]
    })
    .slice(0, maxCount)
}

