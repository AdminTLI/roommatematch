import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
      
      // Filter by minFitIndex (client-side filtering for now)
      const filteredSuggestions = (suggestions || []).filter(s => s.fitIndex >= minFitIndex)
      
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
