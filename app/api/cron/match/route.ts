import { NextRequest, NextResponse } from 'next/server'
import { runMatchingAsSuggestions } from '@/lib/matching/orchestrator'
import { getMatchRepo } from '@/lib/matching/repo.factory'

export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[Cron] Starting scheduled matching run')
    
    const repo = await getMatchRepo()
    const runId = `cron_${Date.now()}`
    
    // Run matching for all active users
    const result = await runMatchingAsSuggestions({
      repo,
      mode: 'pairs',
      groupSize: 2,
      cohort: {}, // Empty = all users
      runId
    })
    
    console.log(`[Cron] Matching complete: ${result.created} suggestions created`)
    
    return NextResponse.json({
      success: true,
      runId: result.runId,
      created: result.created,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Cron] Matching failed:', error)
    return NextResponse.json(
      { 
        error: 'Matching failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
