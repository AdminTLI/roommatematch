// API route to list matches
// GET /api/match/list?runId=xxx&locked=true

import { NextRequest, NextResponse } from 'next/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import { requireAdminResponse } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminResponse(request, true)
  if (authError) {
    return authError
  }

  try {
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('runId')
    const locked = searchParams.get('locked')
    
    const repo = await getMatchRepo()
    const matches = await repo.listMatches(
      runId || undefined,
      locked ? locked === 'true' : undefined
    )

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('[API] List matches error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to list matches', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
