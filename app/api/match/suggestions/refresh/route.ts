import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import { runMatchingAsSuggestions } from '@/lib/matching/orchestrator'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check email verification
    if (!user.email_confirmed_at) {
      return NextResponse.json({ 
        error: 'Email verification required',
        requiresVerification: true 
      }, { status: 403 })
    }

    const repo = await getMatchRepo()
    
    // Efficiently fetch the current user's profile
    const currentUser = await repo.getCandidateByUserId(user.id)
    if (!currentUser) {
      console.error('[DEBUG] Refresh route - user not eligible:', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      })
      return NextResponse.json({ 
        error: 'User profile not found or not eligible for matching',
        details: 'Check server logs for missing required fields'
      }, { status: 404 })
    }
    
    // Build cohort filter based on user's profile
    // Note: programmeId is NOT included as a filter - program matching is a preference/boost
    // in the scoring system, not a hard requirement. Users with different programs or undecided
    // programs should still be eligible for matching (they just won't get the program bonus).
    // Only include campusCity if it's not null/empty (filter only applies if truthy)
    const cohort: any = {
      institutionId: currentUser.universityId,
      degreeLevel: currentUser.degreeLevel,
      excludeUserIds: [user.id] // Exclude current user from suggestions
    }
    
    // Only add campusCity filter if it has a value
    if (currentUser.campusCity) {
      cohort.campusCity = currentUser.campusCity
    }
    
    // Generate new suggestions
    const result = await runMatchingAsSuggestions({
      repo,
      mode: 'pairs',
      groupSize: 2,
      cohort,
      runId: `refresh_${Date.now()}`
    })
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error refreshing suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to refresh suggestions' },
      { status: 500 }
    )
  }
}
