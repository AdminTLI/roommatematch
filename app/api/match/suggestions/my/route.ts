import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import matchModeConfig from '@/config/match-mode.json'

export async function GET(request: NextRequest) {
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

    try {
      const repo = await getMatchRepo()
      const includeExpired = request.nextUrl.searchParams.get('includeExpired') === 'true'
      
      const suggestions = await repo.listSuggestionsForUser(user.id, includeExpired)
      
      // Filter by minFitIndex
      const minFitIndex = matchModeConfig.minFitIndex || 0
      const filteredSuggestions = (suggestions || []).filter(s => s.fitIndex >= minFitIndex)
      
      return NextResponse.json({ suggestions: filteredSuggestions })
    } catch (repoError: any) {
      // If table doesn't exist or query fails, return empty array instead of 500
      console.error('[Match Suggestions API] Repository error:', {
        error: repoError,
        message: repoError?.message,
        code: repoError?.code
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
