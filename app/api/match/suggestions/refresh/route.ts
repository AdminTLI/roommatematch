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
    let currentUser = await repo.getCandidateByUserId(user.id)
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
    
    // Auto-generate vector if missing
    if (!currentUser.vector) {
      console.log(`[DEBUG] Current user missing vector, generating...`)
      const { error: vectorError } = await supabase.rpc('compute_user_vector_and_store', { 
        p_user_id: user.id 
      })
      
      if (vectorError) {
        console.error('[DEBUG] Vector generation failed:', vectorError)
      } else {
        console.log(`[DEBUG] Vector generated successfully, refetching user...`)
        // Refetch user to get updated vector
        const refetched = await repo.getCandidateByUserId(user.id)
        if (refetched) {
          currentUser = refetched
        }
      }
    }
    
    // Ensure currentUser is still valid after vector generation
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'User profile not found or not eligible for matching',
        details: 'Check server logs for missing required fields'
      }, { status: 404 })
    }
    
    // Build cohort filter based on user's profile
    // Note: 
    // - institutionId is NOT included - students from different universities can match
    //   (same university is a bonus in scoring, not a requirement)
    // - programmeId is NOT included - program matching is a preference/boost in scoring
    // - campusCity is included to match students in the same city (works across universities)
    // - degreeLevel is kept as a requirement for similar academic stage matching
    const cohort: any = {
      degreeLevel: currentUser.degreeLevel,
      excludeUserIds: [user.id],
      onlyActive: true, // Require verified/active profiles for suggestions
      excludeAlreadyMatched: true
    }
    
    // Only add campusCity filter if it has a value (city-based matching works across universities)
    if (currentUser.campusCity) {
      cohort.campusCity = currentUser.campusCity
    }
    
    console.log('[DEBUG] Refresh route - cohort filter:', {
      cohort,
      currentUser: {
        universityId: currentUser.universityId,
        degreeLevel: currentUser.degreeLevel,
        campusCity: currentUser.campusCity,
        programmeId: currentUser.programmeId
      },
      timestamp: new Date().toISOString()
    })
    
    // Expire old pending/accepted suggestions for this user before creating new ones
    const expiredCount = await repo.expireOldSuggestionsForUser(user.id)
    if (expiredCount > 0) {
      console.log(`[DEBUG] Expired ${expiredCount} old suggestions for user ${user.id}`)
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
