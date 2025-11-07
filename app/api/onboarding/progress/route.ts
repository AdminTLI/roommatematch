import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkQuestionnaireCompletion } from '@/lib/onboarding/validation'
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
    
    // Map response count to section progress (approximate)
    const totalSections = 9
    const completedSections = Math.min(Math.floor(completionStatus.responseCount / 4), totalSections)
    
    // Determine next section based on completion status
    const allSections = [
      'intro',
      'location-commute', 
      'personality-values',
      'sleep-circadian',
      'noise-sensory',
      'home-operations',
      'social-hosting-language',
      'communication-conflict',
      'privacy-territoriality',
      'reliability-logistics'
    ]

    const nextSection = completionStatus.isComplete ? null : 
      allSections[Math.min(completedSections, allSections.length - 1)]

    // Return only high-level progress - don't expose missingKeys (reveals questionnaire structure)
    return NextResponse.json({
      completedSections: allSections.slice(0, completedSections),
      totalSections,
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
