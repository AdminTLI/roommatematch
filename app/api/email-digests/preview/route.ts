import { NextResponse } from 'next/server'
import {
  buildMatchesDigestEmail,
  buildMessagesDigestEmail,
  buildPlatformUpdatesDigestEmail,
} from '@/lib/email/notification-digests'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/email-digests/preview?kind=matches|messages|platform&name=...&count=...
 *
 * This is a NO-SEND preview endpoint (useful for visually checking HTML).
 * In production it requires CRON_SECRET/VERCEL_CRON_SECRET (same auth pattern as other cron endpoints).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const kind = (searchParams.get('kind') || '').toLowerCase()
    const name = searchParams.get('name') || 'Alex'
    const count = Number(searchParams.get('count') || '3')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
      const authHeader = request.headers.get('authorization')
      const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET
      if (!cronSecret) {
        return NextResponse.json({ error: 'Preview auth not configured' }, { status: 500 })
      }
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (!kind) {
      return NextResponse.json({ error: 'Missing kind' }, { status: 400 })
    }

    if (kind === 'matches') {
      return NextResponse.json(buildMatchesDigestEmail({ toName: name, appUrl, count }))
    }

    if (kind === 'messages') {
      return NextResponse.json(buildMessagesDigestEmail({ toName: name, appUrl, count }))
    }

    if (kind === 'platform') {
      const title = searchParams.get('title') || 'New feature drop'
      const body = searchParams.get('body') || 'Check out what’s new this week!'
      const actionUrl = searchParams.get('actionUrl') || null
      return NextResponse.json(
        buildPlatformUpdatesDigestEmail({
          toName: name,
          appUrl,
          announcementTitle: title,
          announcementBody: body,
          actionUrl,
        }),
      )
    }

    return NextResponse.json({ error: `Unknown kind: ${kind}` }, { status: 400 })
  } catch (error) {
    safeLogger.error('[EmailDigestPreview] Failed', { error })
    return NextResponse.json({ error: 'Preview failed' }, { status: 500 })
  }
}

