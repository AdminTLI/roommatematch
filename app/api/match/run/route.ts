// API route to run matching algorithm
// POST /api/match/run

import { NextRequest, NextResponse } from 'next/server'
import { runMatching } from '@/lib/matching/orchestrator'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import type { CohortFilter } from '@/lib/matching/repo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      mode = 'pairs', 
      groupSize = 2, 
      cohort = {}, 
      runId 
    } = body as { 
      mode: 'pairs' | 'groups'
      groupSize?: number
      cohort: CohortFilter
      runId?: string
    }

    console.log('[API] Running matching with params:', { mode, groupSize, cohort, runId })

    const repo = await getMatchRepo()
    const result = await runMatching({ 
      repo, 
      mode, 
      groupSize, 
      cohort, 
      runId 
    })

    return NextResponse.json(result)
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
