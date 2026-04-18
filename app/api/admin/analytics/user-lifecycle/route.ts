import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { calculateCRMMetrics } from '@/lib/analytics/crm-metrics'
import { openScopedAnalyticsSession } from '@/lib/admin/analytics-scope'

export async function GET(request: NextRequest) {
  try {
    const ctx = await openScopedAnalyticsSession(request)
    if (!ctx.ok) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status })
    }

    const { universityId, admin } = ctx

    const crmMetrics = await calculateCRMMetrics(universityId, 30)

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const { data: engagementMetrics } = await admin
      .from('analytics_metrics')
      .select('metric_value, period_start, filter_criteria')
      .eq('metric_category', 'user_engagement')
      .eq('metric_name', 'engagement_score')
      .gte('period_start', thirtyDaysAgo.toISOString())
      .order('period_start', { ascending: true })

    const engagementTrend = (engagementMetrics || [])
      .filter((m: { filter_criteria?: unknown }) => {
        const fc = m.filter_criteria as { university_id?: string } | null | undefined
        if (!fc || typeof fc !== 'object' || !('university_id' in fc)) return false
        return fc.university_id === universityId
      })
      .map((m: { period_start: string; metric_value: number }) => ({
        date: new Date(m.period_start).toISOString().split('T')[0],
        score: m.metric_value,
      }))

    return NextResponse.json({
      ...crmMetrics,
      engagementTrend: engagementTrend.slice(-30),
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] User lifecycle error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
