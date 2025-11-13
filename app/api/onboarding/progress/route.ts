import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkQuestionnaireCompletion } from '@/lib/onboarding/validation'
import { calculateSectionProgress } from '@/lib/onboarding/sections'
import { safeLogger } from '@/lib/utils/logger'

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
    
    // Use proper section progress calculation instead of naive approximation
    const sectionProgress = calculateSectionProgress(completionStatus.missingKeys)
    
    // Determine next section based on completion status
    // Find the first incomplete section
    const nextSection = completionStatus.isComplete ? null : 
      Object.keys(sectionProgress.sectionDetails).find(section => {
        const details = sectionProgress.sectionDetails[section]
        return details.completed < details.total
      }) || null

    // Return only high-level progress - don't expose missingKeys (reveals questionnaire structure)
    return NextResponse.json({
      completedSections: sectionProgress.completedSections,
      totalSections: sectionProgress.totalSections,
      progressCount: completionStatus.responseCount,
      isFullySubmitted: completionStatus.isComplete,
      hasPartialProgress: completionStatus.responseCount > 0 && !completionStatus.isComplete,
      nextSection,
      lastUpdated: null, // Not tracked in new system
      submittedAt: completionStatus.hasSubmission ? new Date().toISOString() : null
      // missingKeys removed - don't expose questionnaire structure
    })

  } catch (error) {
    safeLogger.error('[Progress] Unexpected error', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
