import { NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { sendNotificationDigestEmails } from '@/lib/email/notification-digests'

export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/notification-digests
 * Sends email digests:
 * - New matches digest every ~72 hours
 * - New messages digest daily
 *
 * This endpoint is expected to be triggered by an external cron (e.g. Vercel/CI),
 * ideally running hourly so we can send only within the morning UTC window.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
      if (!cronSecret) {
        safeLogger.error('[Cron][NotificationDigests] CRON_SECRET or VERCEL_CRON_SECRET is required in production')
        return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
      }
    }

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      safeLogger.warn('[Cron][NotificationDigests] Unauthorized cron request attempt', {
        hasHeader: !!authHeader,
        hasSecret: !!cronSecret,
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sendNotificationDigestEmails()
    return NextResponse.json(result)
  } catch (error) {
    safeLogger.error('[Cron][NotificationDigests] Failed', { error })
    return NextResponse.json(
      { error: 'Notification digests failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

