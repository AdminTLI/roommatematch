import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'
import { calculateSupplyDemandMetrics } from '@/lib/analytics/supply-demand'

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

    // Get metrics for 30 and 90 day periods
    const [metrics30d, metrics90d] = await Promise.all([
      calculateSupplyDemandMetrics(universityId, 30),
      calculateSupplyDemandMetrics(universityId, 90)
    ])

    // Get historical data for line chart (daily for last 30 days)
    const admin = createAdminClient()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const { data: historicalMetrics } = await admin
      .from('analytics_metrics')
      .select('metric_name, metric_value, period_start, filter_criteria')
      .eq('metric_category', 'housing_availability')
      .in('metric_name', ['total_supply', 'total_demand', 'supply_demand_ratio'])
      .gte('period_start', thirtyDaysAgo.toISOString())
      .order('period_start', { ascending: true })

    // Group by date and build time series
    const dailyData = new Map<string, { date: string; supply: number; demand: number; ratio: number }>()
    
    historicalMetrics?.forEach(metric => {
      const date = new Date(metric.period_start).toISOString().split('T')[0]
      const existing = dailyData.get(date) || { date, supply: 0, demand: 0, ratio: 0 }
      
      if (metric.metric_name === 'total_supply') {
        existing.supply = metric.metric_value
      } else if (metric.metric_name === 'total_demand') {
        existing.demand = metric.metric_value
      } else if (metric.metric_name === 'supply_demand_ratio') {
        existing.ratio = metric.metric_value
      }
      
      dailyData.set(date, existing)
    })

    const timeSeries = Array.from(dailyData.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // Last 30 days

    return NextResponse.json({
      current30d: metrics30d,
      current90d: metrics90d,
      timeSeries: timeSeries.length > 0 ? timeSeries : null
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] Supply/Demand error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

