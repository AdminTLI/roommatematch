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

function unwrapAnswerPayload(raw: any): any {
  if (raw && typeof raw === 'object' && 'value' in raw && (raw as any).value !== undefined) {
    return (raw as any).value
  }
  return raw
}

function likert1to5(raw: any): number | null {
  const v = unwrapAnswerPayload(raw)
  return typeof v === 'number' && v >= 1 && v <= 5 ? v : null
}

function getTimeRangeBounds(raw: any): { start: string; end: string } | null {
  const v = unwrapAnswerPayload(raw)
  if (v && typeof v === 'object' && typeof (v as any).start === 'string' && typeof (v as any).end === 'string') {
    return { start: (v as any).start, end: (v as any).end }
  }
  return null
}

function pushTimeRangeAlignment(
  itemId: string,
  rawA: any,
  rawB: any,
  alignments: AnswerAlignment[],
  labels: { exactDescription: string; closeDescription: string }
) {
  const a = getTimeRangeBounds(rawA)
  const b = getTimeRangeBounds(rawB)
  if (!a || !b) return

  const startA = parseTime(a.start)
  const endA = parseTime(a.end)
  const startB = parseTime(b.start)
  const endB = parseTime(b.end)

  const startDiff = Math.abs(startA - startB)
  const endDiff = Math.abs(endA - endB)

  if (startDiff <= 1 && endDiff <= 1) {
    alignments.push({
      itemId,
      category: 'schedule',
      strength: 'exact_match',
      description: labels.exactDescription,
      valueA: rawA,
      valueB: rawB,
      humanizedA: formatTimeRangeForDisplay(a),
      humanizedB: formatTimeRangeForDisplay(b),
    })
  } else if (startDiff <= 2 && endDiff <= 2) {
    alignments.push({
      itemId,
      category: 'schedule',
      strength: 'close_match',
      description: labels.closeDescription,
      valueA: rawA,
      valueB: rawB,
      humanizedA: formatTimeRangeForDisplay(a),
      humanizedB: formatTimeRangeForDisplay(b),
    })
  }
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
  // Compare sleep windows (M2_Q1 Sun–Thu, M2_Q2 Fri–Sat)
  pushTimeRangeAlignment('M2_Q1', studentA.raw['M2_Q1'], studentB.raw['M2_Q1'], alignments, {
    exactDescription: 'Similar Sun–Thu sleep windows',
    closeDescription: 'Close Sun–Thu sleep windows',
  })
  pushTimeRangeAlignment('M2_Q2', studentA.raw['M2_Q2'], studentB.raw['M2_Q2'], alignments, {
    exactDescription: 'Similar Fri–Sat sleep windows',
    closeDescription: 'Close Fri–Sat sleep windows',
  })

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
 * Compare cleanliness / home-operations alignment (student M4)
 */
function compareCleanliness(
  studentA: StudentProfile,
  studentB: StudentProfile,
  alignments: AnswerAlignment[]
) {
  const pushScaleClose = (
    itemId: string,
    rawA: any,
    rawB: any,
    exactDescription: string,
    closeDescription: string,
    humanize: (id: string, v: any) => string
  ) => {
    if (!rawA || !rawB) return
    const a = likert1to5(rawA)
    const b = likert1to5(rawB)
    if (a == null || b == null) return
    if (a === b) {
      alignments.push({
        itemId,
        category: 'lifestyle',
        strength: 'exact_match',
        description: exactDescription,
        valueA: rawA,
        valueB: rawB,
        humanizedA: humanize(itemId, rawA),
        humanizedB: humanize(itemId, rawB)
      })
    } else if (Math.abs(a - b) <= 1) {
      alignments.push({
        itemId,
        category: 'lifestyle',
        strength: 'close_match',
        description: closeDescription,
        valueA: rawA,
        valueB: rawB,
        humanizedA: humanize(itemId, rawA),
        humanizedB: humanize(itemId, rawB)
      })
    }
  }

  const pushMcqExact = (itemId: string, rawA: any, rawB: any, description: string) => {
    if (!rawA || !rawB) return
    const valueA = unwrapAnswerPayload(rawA)
    const valueB = unwrapAnswerPayload(rawB)
    if (valueA === valueB) {
      alignments.push({
        itemId,
        category: 'lifestyle',
        strength: 'exact_match',
        description,
        valueA: rawA,
        valueB: rawB,
        humanizedA: humanizeAnswer(itemId, rawA),
        humanizedB: humanizeAnswer(itemId, rawB)
      })
    }
  }

  pushScaleClose(
    'M4_Q1',
    studentA.raw['M4_Q1'],
    studentB.raw['M4_Q1'],
    'Same expectation for how tidy shared living areas should feel',
    'Similar expectation for how tidy shared living areas should feel',
    humanizeAnswer
  )

  pushMcqExact(
    'M4_Q2',
    studentA.raw['M4_Q2'],
    studentB.raw['M4_Q2'],
    'Same preferred timing for cleaning up after cooking'
  )

  pushScaleClose(
    'M4_Q3',
    studentA.raw['M4_Q3'],
    studentB.raw['M4_Q3'],
    'Same diligence about wiping down the bathroom after use',
    'Similar diligence about wiping down the bathroom after use',
    humanizeAnswer
  )

  pushScaleClose(
    'M4_Q4',
    studentA.raw['M4_Q4'],
    studentB.raw['M4_Q4'],
    'Same view on personal items in shared living space',
    'Similar view on personal items in shared living space',
    humanizeAnswer
  )

  pushMcqExact(
    'M4_Q5',
    studentA.raw['M4_Q5'],
    studentB.raw['M4_Q5'],
    'Same shoes-in-the-house preference'
  )
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
          description: 'Similar calm-home / predictability preference',
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

  const pushSocialMcqExact = (
    itemId: string,
    rawA: any,
    rawB: any,
    description: string
  ) => {
    if (!rawA || !rawB) return
    if (unwrapAnswerPayload(rawA) === unwrapAnswerPayload(rawB)) {
      alignments.push({
        itemId,
        category: 'social',
        strength: 'exact_match',
        description,
        valueA: rawA,
        valueB: rawB,
        humanizedA: humanizeAnswer(itemId, rawA),
        humanizedB: humanizeAnswer(itemId, rawB)
      })
    }
  }

  const pushSocialScaleClose = (
    itemId: string,
    rawA: any,
    rawB: any,
    exactDescription: string,
    closeDescription: string
  ) => {
    if (!rawA || !rawB) return
    const a = likert1to5(rawA)
    const b = likert1to5(rawB)
    if (a == null || b == null) return
    if (a === b) {
      alignments.push({
        itemId,
        category: 'social',
        strength: 'exact_match',
        description: exactDescription,
        valueA: rawA,
        valueB: rawB,
        humanizedA: humanizeAnswer(itemId, rawA),
        humanizedB: humanizeAnswer(itemId, rawB)
      })
    } else if (Math.abs(a - b) <= 1) {
      alignments.push({
        itemId,
        category: 'social',
        strength: 'close_match',
        description: closeDescription,
        valueA: rawA,
        valueB: rawB,
        humanizedA: humanizeAnswer(itemId, rawA),
        humanizedB: humanizeAnswer(itemId, rawB)
      })
    }
  }

  pushSocialScaleClose(
    'M5_Q1',
    studentA.raw['M5_Q1'],
    studentB.raw['M5_Q1'],
    'Same view of shared living/kitchen as social vs private space',
    'Similar view of shared living/kitchen as social vs private space'
  )

  pushSocialMcqExact(
    'M5_Q3',
    studentA.raw['M5_Q3'],
    studentB.raw['M5_Q3'],
    'Same preference for shared meals vs cooking independently'
  )

  pushSocialScaleClose(
    'M5_Q4',
    studentA.raw['M5_Q4'],
    studentB.raw['M5_Q4'],
    'Same weekend rhythm with housemates vs solo plans',
    'Similar weekend rhythm with housemates vs solo plans'
  )

  pushSocialMcqExact(
    'M5_Q11',
    studentA.raw['M5_Q11'],
    studentB.raw['M5_Q11'],
    'Same comfort level with large house parties'
  )

  pushSocialMcqExact(
    'M5_Q21',
    studentA.raw['M5_Q21'],
    studentB.raw['M5_Q21'],
    'Same preferred household language for rules and day-to-day chat'
  )

  pushSocialScaleClose(
    'M5_Q13',
    studentA.raw['M5_Q13'],
    studentB.raw['M5_Q13'],
    'Same view on weeknight guests after 22:00',
    'Similar view on weeknight guests after 22:00'
  )
}

/**
 * Compare personality traits
 */
function comparePersonalityTraits(
  studentA: StudentProfile,
  studentB: StudentProfile,
  alignments: AnswerAlignment[]
) {
  // Compare household organization role (M1_Q7)
  const roleA = studentA.raw['M1_Q7']
  const roleB = studentB.raw['M1_Q7']
  if (roleA && roleB) {
    const valueA = typeof roleA === 'object' ? roleA.value : roleA
    const valueB = typeof roleB === 'object' ? roleB.value : roleB
    if (valueA === valueB) {
      alignments.push({
        itemId: 'M1_Q7',
        category: 'personality',
        strength: 'exact_match',
        description: 'Similar household organization style',
        valueA: roleA,
        valueB: roleB,
        humanizedA: humanizeAnswer('M1_Q7', roleA),
        humanizedB: humanizeAnswer('M1_Q7', roleB)
      })
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

