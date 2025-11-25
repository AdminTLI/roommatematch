import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'
import { calculateCohortRetentionMetrics } from '@/lib/analytics/supply-demand'

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

    // Get cohorts from last 12 weeks
    const cohorts = []
    const now = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const cohortDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const cohortDateStr = cohortDate.toISOString().split('T')[0]
      
      try {
        const metrics = await calculateCohortRetentionMetrics(cohortDateStr, universityId)
        if (metrics.cohortSize > 0) {
          cohorts.push({
            cohortDate: cohortDateStr,
            cohortSize: metrics.cohortSize,
            day1Retention: parseFloat(metrics.day1Retention.toFixed(1)),
            day7Retention: parseFloat(metrics.day7Retention.toFixed(1)),
            day30Retention: parseFloat(metrics.day30Retention.toFixed(1)),
            day90Retention: parseFloat(metrics.day90Retention.toFixed(1))
          })
        }
      } catch (error) {
        safeLogger.warn('[Admin Analytics] Failed to calculate cohort', { cohortDate: cohortDateStr, error })
      }
    }

    // Calculate average retention across all cohorts
    const avgRetention = cohorts.length > 0 ? {
      day1: cohorts.reduce((sum, c) => sum + c.day1Retention, 0) / cohorts.length,
      day7: cohorts.reduce((sum, c) => sum + c.day7Retention, 0) / cohorts.length,
      day30: cohorts.reduce((sum, c) => sum + c.day30Retention, 0) / cohorts.length,
      day90: cohorts.reduce((sum, c) => sum + c.day90Retention, 0) / cohorts.length
    } : { day1: 0, day7: 0, day30: 0, day90: 0 }

    return NextResponse.json({
      cohorts: cohorts.slice(-8), // Last 8 cohorts
      averageRetention: {
        day1: parseFloat(avgRetention.day1.toFixed(1)),
        day7: parseFloat(avgRetention.day7.toFixed(1)),
        day30: parseFloat(avgRetention.day30.toFixed(1)),
        day90: parseFloat(avgRetention.day90.toFixed(1))
      }
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] Cohort retention error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


