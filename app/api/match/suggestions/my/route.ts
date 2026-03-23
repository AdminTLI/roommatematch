import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import matchModeConfig from '@/config/match-mode.json'
import { getUserFriendlyError } from '@/lib/errors/user-friendly-messages'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: getUserFriendlyError('Authentication required')
      }, { status: 401 })
    }

    // Check email verification
    if (!user.email_confirmed_at) {
      return NextResponse.json({ 
        error: getUserFriendlyError('Email verification required'),
        requiresVerification: true 
      }, { status: 403 })
    }

    // Phase 3: Require completed profile (user_type) to view matches  -  strict segregation
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, is_visible, privacy_settings')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile?.user_type) {
      return NextResponse.json(
        { error: 'Please complete your profile to view matches.' },
        { status: 403 }
      )
    }

    const isGhost = profile?.is_visible === false
    const showInMatchesSetting = profile?.privacy_settings?.showInMatches
    const showInMatches = typeof showInMatchesSetting === 'boolean' ? showInMatchesSetting : true
    const hideSuggestedAndPending = isGhost || showInMatches === false

    try {
      const repo = await getMatchRepo()
      const includeExpired = request.nextUrl.searchParams.get('includeExpired') === 'true'
      
      // Parse pagination parameters
      const limitParam = request.nextUrl.searchParams.get('limit')
      const offsetParam = request.nextUrl.searchParams.get('offset')
      const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : undefined // Max 50 per page
      const offset = offsetParam ? Math.max(parseInt(offsetParam, 10), 0) : undefined
      
      // Get total count using efficient COUNT query (before minFitIndex filtering)
      // Note: minFitIndex filtering happens client-side, so total may be slightly higher
      // but this is much more efficient than fetching all records
      const totalCount = await repo.countSuggestionsForUser(user.id, includeExpired)
      const minFitIndex = matchModeConfig.minFitIndex || 0
      
      // Get paginated suggestions
      const suggestions = await repo.listSuggestionsForUser(user.id, includeExpired, limit, offset)

      // Keep stored fit_index in sync with latest compatibility score so UI and DB match.
      // This prevents drift between "stored fit index" and "live score" shown elsewhere.
      const admin = await createAdminClient()
      const syncedSuggestions = await Promise.all(
        (suggestions || []).map(async (s) => {
          try {
            const otherUserId = s.memberIds?.find(id => id !== user.id)
            if (!otherUserId) return s

            const { data: scoreRows, error: scoreError } = await admin.rpc('compute_compatibility_score', {
              user_a_id: user.id,
              user_b_id: otherUserId
            })

            if (scoreError || !Array.isArray(scoreRows) || scoreRows.length === 0) {
              return s
            }

            const latestFitIndex = Math.round((Number(scoreRows[0]?.compatibility_score) || 0) * 100)
            if (!Number.isFinite(latestFitIndex)) return s
            if (latestFitIndex === s.fitIndex) return s

            // Best-effort persistence: keep DB snapshot aligned with latest score.
            await admin
              .from('match_suggestions')
              .update({ fit_index: latestFitIndex, fit_score: latestFitIndex / 100 })
              .eq('id', s.id)

            return { ...s, fitIndex: latestFitIndex }
          } catch {
            return s
          }
        })
      )
      
      // Filter by minFitIndex (client-side filtering for now)
      let filteredSuggestions = syncedSuggestions.filter(s => s.fitIndex >= minFitIndex)

      // If privacy settings disable matching suggestions, only keep confirmed/history items
      // so the UI never shows "Suggested" or "Pending".
      if (hideSuggestedAndPending) {
        filteredSuggestions = filteredSuggestions.filter(s => {
          if (s.status === 'declined') return true
          if (s.status === 'confirmed') return true
          if (s.status === 'accepted' && Array.isArray(s.memberIds) && Array.isArray(s.acceptedBy)) {
            const allAccepted = s.acceptedBy.includes(user.id) && s.acceptedBy.length === s.memberIds.length
            return allAccepted
          }
          return false
        })
      }
      
      // Calculate pagination metadata
      // Note: totalCount is approximate (before minFitIndex filter), but close enough for pagination
      // Actual filtered count would require fetching all, which we're avoiding
      const hasMore = limit !== undefined && offset !== undefined 
        ? (offset + limit) < totalCount && filteredSuggestions.length === limit
        : false
      
      return NextResponse.json({ 
        suggestions: filteredSuggestions,
        pagination: {
          limit: limit || filteredSuggestions.length,
          offset: offset || 0,
          total: totalCount, // Approximate total (before minFitIndex filter)
          has_more: hasMore
        }
      })
    } catch (repoError: any) {
      // If table doesn't exist or query fails, return empty array instead of 500
      console.error('[Match Suggestions API] Repository error:', {
        error: repoError,
        message: repoError?.message,
        code: repoError?.code,
        stack: repoError?.stack,
        userId: user?.id,
        timestamp: new Date().toISOString()
      })
      
      // Return empty suggestions instead of error to prevent UI crashes
      return NextResponse.json({ suggestions: [] })
    }
  } catch (error) {
    console.error('[Match Suggestions API] Unexpected error:', error)
    // Return empty array instead of 500 error to prevent UI crashes
    return NextResponse.json({ suggestions: [] })
  }
}
