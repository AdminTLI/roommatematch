// Personalized explanation generator
// Creates deep, personalized match explanations based on actual user answers

import type { StudentProfile } from './answer-map'
import { compareAnswers, getTopAlignments, type AnswerAlignment } from './answer-comparison'
import { generateOpening, generateStrength, generateConcern } from './explanation-templates'

export interface PersonalizedExplanationContext {
  studentA: StudentProfile
  studentB: StudentProfile
  sectionScores: Record<string, number>
  matchId: string
}

/**
 * Generate a personalized match explanation
 */
export function generatePersonalizedExplanation(
  context: PersonalizedExplanationContext
): string {
  const { studentA, studentB, sectionScores, matchId } = context

  // Compare answers to find alignments
  const alignments = compareAnswers(studentA, studentB)
  
  // Get top alignments to highlight
  const topAlignments = getTopAlignments(alignments, 3)
  
  // Build explanation sections
  const sections: string[] = []

  // Opening sentence
  const openingContext = {
    alignments: topAlignments.map(a => ({
      description: a.description,
      humanizedA: a.humanizedA,
      humanizedB: a.humanizedB,
      category: a.category
    })),
    sectionScores
  }
  const opening = generateOpening(openingContext, matchId)
  sections.push(opening)

  // Add specific alignment details if available
  if (topAlignments.length > 0) {
    // Include specific answer details in the strength section
    const strengthContext = {
      alignments: topAlignments.map(a => ({
        description: formatAlignmentDescription(a),
        humanizedA: a.humanizedA,
        humanizedB: a.humanizedB,
        category: a.category
      })),
      sectionScores
    }
    const strength = generateStrength(strengthContext, matchId)
    sections.push(strength)
  } else {
    // Fallback to general strength based on scores
    const strengthContext = {
      alignments: [],
      sectionScores
    }
    const strength = generateStrength(strengthContext, matchId)
    sections.push(strength)
  }

  // Add constructive concerns/feedback
  const concernContext = {
    alignments: [],
    sectionScores,
    concerns: []
  }
  const concern = generateConcern(concernContext, matchId)
  sections.push(concern)

  return sections.join(' ')
}

/**
 * Format alignment description with specific answer details
 */
function formatAlignmentDescription(alignment: AnswerAlignment): string {
  const { description, humanizedA, humanizedB, strength, category } = alignment

  // For exact matches, show the shared value
  if (strength === 'exact_match') {
    // Try to make it more natural by using one of the values
    return `you both ${description.toLowerCase()} (${humanizedA})`
  }

  // For close matches, show both values
  if (strength === 'close_match') {
    return `you have similar ${category} preferences - you prefer ${humanizedA} and they prefer ${humanizedB}`
  }

  // Default
  return description.toLowerCase()
}

/**
 * Generate explanation for specific category
 */
function generateCategoryExplanation(
  category: string,
  alignments: AnswerAlignment[]
): string {
  const categoryAlignments = alignments.filter(a => a.category === category)
  if (categoryAlignments.length === 0) return ''

  const top = categoryAlignments[0]
  return `Your ${category} preferences align well - ${top.description.toLowerCase()}.`
}


