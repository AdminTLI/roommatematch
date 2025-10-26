import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkQuestionnaireCompletion } from '@/lib/onboarding/validation'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.id) {
    return NextResponse.json({ 
      error: 'Authentication required' 
    }, { status: 401 })
  }

  try {
    const completionStatus = await checkQuestionnaireCompletion(user.id)
    
    return NextResponse.json({
      isComplete: completionStatus.isComplete,
      missingKeys: completionStatus.missingKeys,
      responseCount: completionStatus.responseCount,
      hasSubmission: completionStatus.hasSubmission,
      needsReOnboarding: !completionStatus.isComplete && completionStatus.responseCount > 0
    })
    
  } catch (error) {
    console.error('[Check Completeness] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to check completeness' 
    }, { status: 500 })
  }
}
