import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'
import { calculateCRMMetrics } from '@/lib/analytics/crm-metrics'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { adminRecord } = adminCheck
    const universityId = adminRecord?.role === 'super_admin' ? undefined : adminRecord?.university_id

    // Get CRM metrics
    const crmMetrics = await calculateCRMMetrics(universityId, 30)

    // Get historical engagement scores for trend line
    const admin = createAdminClient()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const { data: engagementMetrics } = await admin
      .from('analytics_metrics')
      .select('metric_value, period_start')
      .eq('metric_category', 'user_engagement')
      .eq('metric_name', 'engagement_score')
      .gte('period_start', thirtyDaysAgo.toISOString())
      .order('period_start', { ascending: true })

    const engagementTrend = engagementMetrics?.map(m => ({
      date: new Date(m.period_start).toISOString().split('T')[0],
      score: m.metric_value
    })) || []

    return NextResponse.json({
      ...crmMetrics,
      engagementTrend: engagementTrend.slice(-30) // Last 30 days
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] User lifecycle error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

