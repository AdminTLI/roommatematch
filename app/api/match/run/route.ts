// API route to run matching algorithm
// POST /api/match/run

import { NextRequest, NextResponse } from 'next/server'
import { runMatching, runMatchingAsSuggestions } from '@/lib/matching/orchestrator'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import type { CohortFilter } from '@/lib/matching/repo'
import matchModeConfig from '@/config/match-mode.json'
import { requireAdminResponse } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'
import { getMaxGroupMembers, getPlatformSettings } from '@/lib/platform-settings'

export async function POST(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminResponse(request, true)
  if (authError) {
    return authError
  }

  try {
    const body = await request.json()
    const platformSettings = await getPlatformSettings()
    const defaultGroupSize = getMaxGroupMembers(platformSettings)

    const { 
      mode = 'pairs', 
      groupSize = defaultGroupSize, 
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

    const resolvedGroupSize = Math.min(
      getMaxGroupMembers(platformSettings),
      Math.max(2, groupSize ?? defaultGroupSize)
    )

    safeLogger.info('[API] Running matching', { mode, groupSize: resolvedGroupSize, runId, suggestionMode })

    const repo = await getMatchRepo()
    
    // Check if we should run in suggestion mode based on config or request
    const shouldUseSuggestions = suggestionMode || matchModeConfig.mode === 'double_consent'
    
    if (shouldUseSuggestions) {
      const result = await runMatchingAsSuggestions({ 
        repo, 
        mode, 
        groupSize: resolvedGroupSize, 
        cohort, 
        runId 
      })
      return NextResponse.json(result)
    } else {
      const result = await runMatching({ 
        repo, 
        mode, 
        groupSize: resolvedGroupSize, 
        cohort, 
        runId 
      })
      return NextResponse.json(result)
    }
  } catch (error) {
    safeLogger.error('[API] Matching error', error)
    return NextResponse.json(
      { 
        error: 'Failed to run matching', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
