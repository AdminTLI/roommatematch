import { NextRequest, NextResponse } from 'next/server'
import { runMatchingAsSuggestions } from '@/lib/matching/orchestrator'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import { createAdminClient } from '@/lib/supabase/server'
import { createMatchNotification } from '@/lib/notifications/create'
import { safeLogger } from '@/lib/utils/logger'

export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    safeLogger.warn('[Cron] Unauthorized cron request attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    safeLogger.info('[Cron] Starting scheduled matching run')
    
    const repo = await getMatchRepo()
    const runId = `cron_${Date.now()}`
    
    // Run matching for all active users
    const result = await runMatchingAsSuggestions({
      repo,
      mode: 'pairs',
      groupSize: 2,
      cohort: {
        onlyActive: true,
        excludeAlreadyMatched: true
      },
      runId
    })
    
    safeLogger.info('[Cron] Matching complete', {
      runId: result.runId,
      created: result.created,
      suggestionCount: result.suggestions.length
    })

    // Create notifications for new suggestions
    const admin = await createAdminClient()
    let notificationCount = 0
    
    for (const suggestion of result.suggestions) {
      try {
        if (suggestion.memberIds.length === 2) {
          // Pair match - notify both users
          await createMatchNotification(
            suggestion.memberIds[0],
            suggestion.memberIds[1],
            'match_created',
            suggestion.id
          )
          notificationCount += 2
        }
      } catch (error) {
        safeLogger.error('[Cron] Failed to create notification', { error, suggestionId: suggestion.id })
      }
    }

    safeLogger.info('[Cron] Notifications created', { count: notificationCount })
    
    return NextResponse.json({
      success: true,
      runId: result.runId,
      created: result.created,
      notificationsSent: notificationCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    safeLogger.error('[Cron] Matching failed', error)
    return NextResponse.json(
      { 
        error: 'Matching failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
