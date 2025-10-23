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

    const repo = await getMatchRepo()
    
    // Get user's current profile to build cohort filter
    const candidates = await repo.loadCandidates({ 
      excludeAlreadyMatched: true, 
      onlyActive: true, 
      limit: 1 
    })
    
    const currentUser = candidates.find(c => c.id === user.id)
    if (!currentUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    
    // Build cohort filter based on user's profile
    const cohort = {
      campusCity: currentUser.campusCity,
      institutionId: currentUser.universityId,
      degreeLevel: currentUser.degreeLevel,
      programmeId: currentUser.programmeId,
      excludeUserIds: [user.id] // Exclude current user from suggestions
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
