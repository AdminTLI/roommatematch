// API route to run matching algorithm
// POST /api/match/run

import { NextRequest, NextResponse } from 'next/server'
import { runMatching, runMatchingAsSuggestions } from '@/lib/matching/orchestrator'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import type { CohortFilter } from '@/lib/matching/repo'
import matchModeConfig from '@/config/match-mode.json'
import { requireAdminResponse } from '@/lib/auth/admin'

export async function POST(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminResponse(request, true)
  if (authError) {
    return authError
  }

  try {
    const body = await request.json()
    const { 
      mode = 'pairs', 
      groupSize = 2, 
      cohort = {}, 
      runId,
      suggestionMode = false
    } = body as { 
      mode: 'pairs' | 'groups'
      groupSize?: number
      cohort: CohortFilter
      runId?: string
      suggestionMode?: boolean
    }

    console.log('[API] Running matching with params:', { mode, groupSize, cohort, runId, suggestionMode })

    const repo = await getMatchRepo()
    
    // Check if we should run in suggestion mode based on config or request
    const shouldUseSuggestions = suggestionMode || matchModeConfig.mode === 'double_consent'
    
    if (shouldUseSuggestions) {
      const result = await runMatchingAsSuggestions({ 
        repo, 
        mode, 
        groupSize, 
        cohort, 
        runId 
      })
      return NextResponse.json(result)
    } else {
      const result = await runMatching({ 
        repo, 
        mode, 
        groupSize, 
        cohort, 
        runId 
      })
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('[API] Matching error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to run matching', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
