import { NextRequest, NextResponse } from 'next/server'
import { sendSLAReminders, processPendingDSARRequests } from '@/lib/privacy/dsar-automation'
import { safeLogger } from '@/lib/utils/logger'

export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/dsar-automation
 * 
 * Automated DSAR request processing cron job
 * Runs daily to:
 * - Send SLA reminders for approaching deadlines
 * - Escalate overdue requests
 * - Process pending DSAR requests
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    safeLogger.warn('[Cron] Unauthorized DSAR automation request attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    safeLogger.info('[Cron] Starting DSAR automation run')

    // 1. Send SLA reminders and escalate overdue requests
    const reminderResults = await sendSLAReminders()
    safeLogger.info('[Cron] SLA reminders processed', {
      approaching: reminderResults.approaching,
      overdue: reminderResults.overdue,
      errors: reminderResults.errors
    })

    // 2. Process pending DSAR requests
    const processingResults = await processPendingDSARRequests()
    safeLogger.info('[Cron] Pending DSAR requests processed', {
      processed: processingResults.processed,
      errors: processingResults.errors
    })

    const totalErrors = reminderResults.errors + processingResults.errors

    safeLogger.info('[Cron] DSAR automation complete', {
      reminders: {
        approaching: reminderResults.approaching,
        overdue: reminderResults.overdue
      },
      processed: processingResults.processed,
      totalErrors
    })

    return NextResponse.json({
      success: true,
      runId: `dsar_automation_${Date.now()}`,
      results: {
        reminders: reminderResults,
        processing: processingResults
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    safeLogger.error('[Cron] DSAR automation failed', { error })
    return NextResponse.json(
      { 
        error: 'DSAR automation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

