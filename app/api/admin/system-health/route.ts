import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { runAllHealthChecks } from '@/lib/monitoring/system-health'
import { logAdminApiFailure } from '@/lib/monitoring/ops-log'
import { safeLogger } from '@/lib/utils/logger'
import { capturePerformanceBaseline } from '@/lib/monitoring/performance-baseline'

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
    const performanceBaseline = capturePerformanceBaseline()

    return NextResponse.json({
      ...health,
      performance: {
        ...performanceBaseline,
        scoreReadMode:
          process.env.MATCH_SCORES_LIVE_SYNC === '1' ? 'live_sync' : 'stored_snapshot',
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
