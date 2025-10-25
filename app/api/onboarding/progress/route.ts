import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.id) {
    return NextResponse.json({ 
      error: 'Authentication required' 
    }, { status: 401 })
  }

  try {
    // Get completed sections
    const { data: sections, error: sectionsError } = await supabase
      .from('onboarding_sections')
      .select('section, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: true })

    if (sectionsError) {
      console.error('[Progress] Error fetching sections:', sectionsError)
      return NextResponse.json({ 
        error: 'Failed to fetch progress' 
      }, { status: 500 })
    }

    // Check if questionnaire is fully submitted
    const { data: submission, error: submissionError } = await supabase
      .from('onboarding_submissions')
      .select('id, submitted_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (submissionError) {
      console.error('[Progress] Error fetching submission:', submissionError)
      return NextResponse.json({ 
        error: 'Failed to fetch submission status' 
      }, { status: 500 })
    }

    const requiredSections = [
      'location-commute',
      'personality-values',
      'sleep-circadian',
      'noise-sensory',
      'home-operations',
      'social-hosting-language',
      'communication-conflict',
      'privacy-territoriality',
      'reliability-logistics',
    ]

    const dbSections = sections?.map(s => s.section) || []
    let completedSections = requiredSections.filter(s => dbSections.includes(s))
    const totalSections = requiredSections.length
    const isFullySubmitted = !!submission
    const hasPartialProgress = completedSections.length > 0 && !isFullySubmitted

    // If submitted, consider all required sections completed
    if (isFullySubmitted) {
      completedSections = requiredSections
    }

    // Determine next section to complete
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

    const nextSection = allSections.find(section => !completedSections.includes(section)) || null

    return NextResponse.json({
      completedSections,
      totalSections,
      progressCount: completedSections.length,
      isFullySubmitted,
      hasPartialProgress,
      nextSection,
      lastUpdated: sections?.[sections.length - 1]?.updated_at || null,
      submittedAt: submission?.submitted_at || null
    })

  } catch (error) {
    console.error('[Progress] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
