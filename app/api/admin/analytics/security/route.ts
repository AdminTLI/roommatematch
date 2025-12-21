import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const admin = createAdminClient()
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

    // Get security events from analytics_metrics
    // Sum metric_value for each event type per day
    const { data: securityEvents } = await admin
      .from('analytics_metrics')
      .select('metric_name, metric_value, period_start, period_end, filter_criteria')
      .eq('metric_category', 'safety_incidents')
      .like('metric_name', 'security_event_%')
      .gte('period_start', fourteenDaysAgo.toISOString())
      .order('period_start', { ascending: true })

    // Group by date and event type, summing metric_value
    const dailyEvents = new Map<string, {
      date: string
      failed_login: number
      suspicious_activity: number
      rls_violation: number
      verification_failure: number
      rate_limit_exceeded: number
      total: number
    }>()

    securityEvents?.forEach(event => {
      // Use period_start date for grouping (events are logged hourly, so we group by day)
      const date = new Date(event.period_start).toISOString().split('T')[0]
      const existing = dailyEvents.get(date) || {
        date,
        failed_login: 0,
        suspicious_activity: 0,
        rls_violation: 0,
        verification_failure: 0,
        rate_limit_exceeded: 0,
        total: 0
      }

      // Extract event type from metric_name (format: security_event_<type>)
      const eventType = event.metric_name.replace('security_event_', '') as
        | 'failed_login'
        | 'suspicious_activity'
        | 'rls_violation'
        | 'verification_failure'
        | 'rate_limit_exceeded'

      // Sum metric_value (each event logs with metric_value = 1, so we sum all events per day)
      const value = Number(event.metric_value) || 0
      
      if (eventType === 'failed_login') {
        existing.failed_login += value
      } else if (eventType === 'suspicious_activity') {
        existing.suspicious_activity += value
      } else if (eventType === 'rls_violation') {
        existing.rls_violation += value
      } else if (eventType === 'verification_failure') {
        existing.verification_failure += value
      } else if (eventType === 'rate_limit_exceeded') {
        existing.rate_limit_exceeded += value
      }
      
      existing.total += value
      dailyEvents.set(date, existing)
    })

    // Fill in missing days with zeros
    const timeSeries = []
    for (let i = 13; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      timeSeries.push(
        dailyEvents.get(date) || {
          date,
          failed_login: 0,
          suspicious_activity: 0,
          rls_violation: 0,
          verification_failure: 0,
          rate_limit_exceeded: 0,
          total: 0
        }
      )
    }

    // Calculate totals
    const totals = {
      failed_login: timeSeries.reduce((sum, d) => sum + d.failed_login, 0),
      suspicious_activity: timeSeries.reduce((sum, d) => sum + d.suspicious_activity, 0),
      rls_violation: timeSeries.reduce((sum, d) => sum + d.rls_violation, 0),
      verification_failure: timeSeries.reduce((sum, d) => sum + d.verification_failure, 0),
      rate_limit_exceeded: timeSeries.reduce((sum, d) => sum + d.rate_limit_exceeded, 0),
      total: timeSeries.reduce((sum, d) => sum + d.total, 0)
    }

    return NextResponse.json({
      timeSeries,
      totals
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] Security metrics error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


