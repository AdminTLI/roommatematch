import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { openScopedAnalyticsSession } from '@/lib/admin/analytics-scope'

export async function GET(request: NextRequest) {
  try {
    const ctx = await openScopedAnalyticsSession(request)
    if (!ctx.ok) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status })
    }

    const { admin, scopedUserIds } = ctx

    if (scopedUserIds.size === 0) {
      return NextResponse.json({
        activeUsers: 0,
        activeSessions: 0,
        eventsLast5Min: 0,
      })
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const { data: activeEvents, error } = await admin
      .from('user_journey_events')
      .select('user_id, session_id, event_timestamp')
      .gte('event_timestamp', fiveMinutesAgo.toISOString())
      .in('user_id', Array.from(scopedUserIds))
      .order('event_timestamp', { ascending: false })

    if (error) {
      safeLogger.error('[Admin Analytics] Realtime error', { error })
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const uniqueUsers = new Set((activeEvents || []).map((e) => e.user_id).filter(Boolean))
    const uniqueSessions = new Set((activeEvents || []).map((e) => e.session_id).filter(Boolean))

    return NextResponse.json({
      activeUsers: uniqueUsers.size,
      activeSessions: uniqueSessions.size,
      eventsLast5Min: activeEvents?.length || 0,
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] Realtime error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
