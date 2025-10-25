import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.id) {
    return NextResponse.json({ 
      error: 'Authentication required' 
    }, { status: 401 })
  }

  try {
    // Delete the submission record to allow re-submission
    const { error: submissionError } = await supabase
      .from('onboarding_submissions')
      .delete()
      .eq('user_id', user.id)

    if (submissionError) {
      console.error('[Questionnaire Reset] Submission delete error:', submissionError)
      return NextResponse.json({ 
        error: 'Failed to reset questionnaire submission' 
      }, { status: 500 })
    }

    // Note: We keep the onboarding_sections records so users can edit their answers
    // If they want to start completely fresh, they would need to manually delete sections

    return NextResponse.json({ 
      success: true,
      message: 'Questionnaire reset successfully. You can now retake it.' 
    })

  } catch (error) {
    console.error('[Questionnaire Reset] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
