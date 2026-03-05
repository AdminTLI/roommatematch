import { NextRequest, NextResponse } from 'next/server'
import { runMatchingAsSuggestions } from '@/lib/matching/orchestrator'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import { createAdminClient } from '@/lib/supabase/server'
import { createMatchNotification } from '@/lib/notifications/create'
import { safeLogger } from '@/lib/utils/logger'

export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verify cron secret for security - REQUIRED in production
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET
  
  // Require secret in production - fail fast if missing
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
    if (!cronSecret) {
      safeLogger.error('[Cron] CRON_SECRET or VERCEL_CRON_SECRET is required in production')
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      )
    }
  }
  
  // Verify authorization header matches secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    safeLogger.warn('[Cron] Unauthorized cron request attempt', {
      hasHeader: !!authHeader,
      hasSecret: !!cronSecret
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // If no secret configured in development, warn but allow (for local testing)
  if (!cronSecret && (process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV)) {
    safeLogger.warn('[Cron] No cron secret configured - allowing request in development only')
  }

  try {
    safeLogger.info('[Cron] Starting scheduled matching run (dual marketplace: student + professional)')
    
    const repo = await getMatchRepo()
    const baseRunId = `cron_${Date.now()}`
    const admin = await createAdminClient()
    let totalCreated = 0
    const allSuggestions: { memberIds: string[]; id: string }[] = []

    // Strict segregation: run matching separately for each user_type (Phase 3)
    for (const userType of ['student', 'professional'] as const) {
      const result = await runMatchingAsSuggestions({
        repo,
        mode: 'pairs',
        groupSize: 2,
        cohort: {
          onlyActive: true,
          excludeAlreadyMatched: true,
          userType
        },
        runId: `${baseRunId}_${userType}`
      })
      totalCreated += result.created
      result.suggestions.forEach(s => allSuggestions.push({ id: s.id, memberIds: s.memberIds }))
      safeLogger.info('[Cron] Cohort complete', { userType, created: result.created })
    }

    safeLogger.info('[Cron] Matching complete', {
      runId: baseRunId,
      created: totalCreated,
      suggestionCount: allSuggestions.length
    })

    // Create notifications for new suggestions
    let notificationCount = 0
    
    for (const suggestion of allSuggestions) {
      try {
        if (suggestion.memberIds.length === 2) {
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
      runId: baseRunId,
      created: totalCreated,
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
