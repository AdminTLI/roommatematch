import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkQuestionnaireCompletion } from '@/lib/onboarding/validation'
import { safeLogger } from '@/lib/utils/logger'
import itemBank from '@/data/item-bank.v2.json'
import { V2_SECTION_KEYS } from '@/types/questionnaire'

// Helper to check if an answer has a valid value
function hasValidValue(answer: any): boolean {
  if (!answer || !answer.itemId) return false

  let value = answer.value

  // Handle nested value object: { value: X }
  if (value && typeof value === 'object' && 'value' in value) {
    value = value.value
  }

  // Value is valid if it's not null or undefined
  return value !== null && value !== undefined && value !== ''
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    return NextResponse.json(
      {
        error: 'Authentication required',
      },
      { status: 401 }
    )
  }

  try {
    // Use the completion helper for consistent logic
    const completionStatus = await checkQuestionnaireCompletion(user.id)

    // Calculate progress based on actual items answered from onboarding_sections
    const { data: sections } = await supabase
      .from('onboarding_sections')
      .select('section, answers')
      .eq('user_id', user.id)
      .in('section', [...V2_SECTION_KEYS])

    const allItems = itemBank as Array<{ id: string; section?: string }>
    const totalItems = allItems.length
    const itemIdSet = new Set(allItems.map((item) => item.id))

    let answeredItems = 0
    const sectionItemCounts: Record<string, { answered: number; total: number }> = {}

    const itemsBySection: Record<string, typeof allItems> = {}
    for (const item of allItems) {
      const section = item.section || 'other'
      if (!itemsBySection[section]) {
        itemsBySection[section] = []
      }
      itemsBySection[section].push(item)
    }

    for (const sectionName of V2_SECTION_KEYS) {
      const items = itemsBySection[sectionName] || []
      sectionItemCounts[sectionName] = { answered: 0, total: items.length }
    }

    for (const section of sections || []) {
      const sectionName = section.section
      const answers = Array.isArray(section.answers) ? section.answers : []

      for (const answer of answers) {
        if (hasValidValue(answer) && itemIdSet.has(answer.itemId)) {
          answeredItems++
          if (sectionItemCounts[sectionName]) {
            sectionItemCounts[sectionName].answered++
          }
        }
      }
    }

    const completionPercentage =
      totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0

    const completedSections = Object.values(sectionItemCounts).filter(
      (s) => s.answered === s.total && s.total > 0
    ).length
    const totalSections = V2_SECTION_KEYS.length

    const nextSection = completionStatus.isComplete
      ? null
      : V2_SECTION_KEYS.find((section) => {
          const details = sectionItemCounts[section]
          return details && details.answered < details.total
        }) || null

    return NextResponse.json({
      completedSections,
      totalSections,
      completionPercentage,
      progressCount: completionStatus.responseCount,
      isFullySubmitted: completionStatus.isComplete,
      hasPartialProgress:
        (completionStatus.responseCount > 0 || answeredItems > 0) && !completionStatus.isComplete,
      nextSection,
      lastUpdated: null,
      submittedAt: completionStatus.hasSubmission ? new Date().toISOString() : null,
    })
  } catch (error) {
    safeLogger.error('[Progress] Unexpected error', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
