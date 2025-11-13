import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkQuestionnaireCompletion } from '@/lib/onboarding/validation'
import { safeLogger } from '@/lib/utils/logger'
import itemBank from '@/data/item-bank.v1.json'
import locItems from '@/data/item-bank.location.v1.json'

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
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.id) {
    return NextResponse.json({ 
      error: 'Authentication required' 
    }, { status: 401 })
  }

  try {
    // Use the completion helper for consistent logic
    const completionStatus = await checkQuestionnaireCompletion(user.id)
    
    // Calculate progress based on actual items answered from onboarding_sections
    // Get all sections which store the actual item answers
    const { data: sections } = await supabase
      .from('onboarding_sections')
      .select('section, answers')
      .eq('user_id', user.id)
    
    // Combine all items from item bank
    const allItems = [...itemBank, ...locItems]
    const totalItems = allItems.length
    
    // Create a map of item IDs for quick lookup
    const itemIdSet = new Set(allItems.map(item => item.id))
    
    // Count answered items from onboarding_sections
    let answeredItems = 0
    const sectionItemCounts: Record<string, { answered: number; total: number }> = {}
    
    // Group items by section for counting
    const itemsBySection: Record<string, any[]> = {}
    for (const item of allItems) {
      const section = item.section || 'other'
      if (!itemsBySection[section]) {
        itemsBySection[section] = []
      }
      itemsBySection[section].push(item)
    }
    
    // Initialize all sections with 0 answered
    for (const [sectionName, items] of Object.entries(itemsBySection)) {
      sectionItemCounts[sectionName] = { answered: 0, total: items.length }
    }
    
    // Count answered items per section from onboarding_sections
    for (const section of sections || []) {
      const sectionName = section.section
      const answers = Array.isArray(section.answers) ? section.answers : []
      
      // Count how many items in this section have valid answers
      for (const answer of answers) {
        if (hasValidValue(answer) && itemIdSet.has(answer.itemId)) {
          answeredItems++
          // Increment count for this section if it exists
          if (sectionItemCounts[sectionName]) {
            sectionItemCounts[sectionName].answered++
          }
        }
      }
    }
    
    // Calculate completion percentage based on actual items
    const completionPercentage = totalItems > 0 
      ? Math.round((answeredItems / totalItems) * 100)
      : 0
    
    // Count fully completed sections (sections where all items are answered)
    const completedSections = Object.values(sectionItemCounts).filter(
      s => s.answered === s.total && s.total > 0
    ).length
    const totalSections = Object.keys(sectionItemCounts).length
    
    // Determine next section based on completion status
    const nextSection = completionStatus.isComplete ? null : 
      Object.keys(sectionItemCounts).find(section => {
        const details = sectionItemCounts[section]
        return details.answered < details.total
      }) || null

    // Return progress based on actual items answered
    return NextResponse.json({
      completedSections,
      totalSections,
      completionPercentage, // Based on actual items answered
      progressCount: completionStatus.responseCount,
      isFullySubmitted: completionStatus.isComplete,
      hasPartialProgress: completionStatus.responseCount > 0 && !completionStatus.isComplete,
      nextSection,
      lastUpdated: null,
      submittedAt: completionStatus.hasSubmission ? new Date().toISOString() : null
    })

  } catch (error) {
    safeLogger.error('[Progress] Unexpected error', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
