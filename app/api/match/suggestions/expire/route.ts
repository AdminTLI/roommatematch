import { NextRequest, NextResponse } from 'next/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import { requireAdminResponse } from '@/lib/auth/admin'

export async function POST(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminResponse(request, true)
  if (authError) {
    return authError
  }

  try {
    const repo = await getMatchRepo()
    
    // Get all suggestions that are pending or accepted and past expiry
    const now = new Date().toISOString()
    const allSuggestions = await repo.listSuggestionsForUser('', true) // Get all suggestions
    
    let changed = 0
    for (const suggestion of allSuggestions) {
      if ((suggestion.status === 'pending' || suggestion.status === 'accepted') && 
          new Date(suggestion.expiresAt).getTime() < Date.now()) {
        suggestion.status = 'expired'
        await repo.updateSuggestion(suggestion)
        changed++
      }
    }
    
    return NextResponse.json({ ok: true, changed })
    
  } catch (error) {
    console.error('Error expiring suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to expire suggestions' },
      { status: 500 }
    )
  }
}
