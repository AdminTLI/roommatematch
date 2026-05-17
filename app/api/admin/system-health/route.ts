import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { runAllHealthChecks } from '@/lib/monitoring/system-health'
import { logAdminApiFailure } from '@/lib/monitoring/ops-log'
import { safeLogger } from '@/lib/utils/logger'
import { channelManager } from '@/lib/realtime/channel-manager'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)

    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const health = await runAllHealthChecks()
    const realtimeStats = channelManager.getStats()

    return NextResponse.json({
      ...health,
      performance: {
        realtime: {
          totalChannels: realtimeStats.totalChannels,
          totalSubscriptions: realtimeStats.totalSubscriptions,
          channels: realtimeStats.channels.map((ch) => ({
            table: ch.table,
            event: ch.event,
            subscriptionCount: ch.subscriptionCount,
            state: ch.state,
          })),
        },
        cache: {},
      },
    })
  } catch (error) {
    safeLogger.error('[Admin] System health check error', error)
    await logAdminApiFailure(
      '/api/admin/system-health',
      500,
      error instanceof Error ? error.message : 'Internal server error'
    )
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
