// API route to lock matches
// POST /api/match/lock

import { NextRequest, NextResponse } from 'next/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { runId, userIds } = body as { 
      runId: string
      userIds: string[]
    }

    if (!runId || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: runId and userIds' },
        { status: 400 }
      )
    }

    console.log('[API] Locking match:', { runId, userIds })

    const repo = await getMatchRepo()
    await repo.lockMatch(userIds, runId)
    await repo.markUsersMatched(userIds, runId)

    return NextResponse.json({ 
      success: true, 
      message: `Locked match for ${userIds.length} users` 
    })
  } catch (error) {
    console.error('[API] Lock match error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to lock match', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
