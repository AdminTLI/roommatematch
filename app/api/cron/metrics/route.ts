import { NextResponse } from 'next/server'
import { calculateSupplyDemandMetrics, storeSupplyDemandMetrics, calculateCohortRetentionMetrics, storeCohortRetentionMetrics } from '@/lib/analytics/supply-demand'
import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/cron/metrics
 * Cron job to calculate and store analytics metrics
 * Runs daily to update supply/demand and cohort retention metrics
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      safeLogger.warn('[Cron] Unauthorized metrics collection request attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    safeLogger.info('[Cron] Starting metrics collection')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all universities
    const { data: universities, error: universitiesError } = await supabase
      .from('universities')
      .select('id')

    if (universitiesError) {
      safeLogger.error('[Cron] Failed to fetch universities', { error: universitiesError })
      return NextResponse.json(
        { error: 'Failed to fetch universities', details: universitiesError.message },
        { status: 500 }
      )
    }

    const results = {
      supplyDemand: [] as Array<{ universityId?: string; success: boolean; error?: string }>,
      cohortRetention: [] as Array<{ cohortDate: string; success: boolean; error?: string }>
    }

    // Calculate supply/demand metrics for all universities and overall
    for (const university of [{ id: undefined }, ...(universities || [])]) {
      try {
        const metrics = await calculateSupplyDemandMetrics(university.id, 30)
        const stored = await storeSupplyDemandMetrics(metrics, university.id)

        results.supplyDemand.push({
          universityId: university.id,
          success: stored,
          error: stored ? undefined : 'Failed to store metrics'
        })

        safeLogger.info('[Cron] Supply/demand metrics calculated', {
          universityId: university.id,
          supply: metrics.totalSupply,
          demand: metrics.totalDemand,
          ratio: metrics.supplyDemandRatio
        })
      } catch (error) {
        safeLogger.error('[Cron] Failed to calculate supply/demand metrics', {
          error,
          universityId: university.id
        })
        results.supplyDemand.push({
          universityId: university.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Calculate cohort retention metrics for last 90 days
    const today = new Date()
    for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
      const cohortDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      const cohortDateStr = cohortDate.toISOString().split('T')[0]

      try {
        // Calculate for all universities
        for (const university of [{ id: undefined }, ...(universities || [])]) {
          const metrics = await calculateCohortRetentionMetrics(
            cohortDateStr,
            university.id
          )

          // Only store if cohort size > 0
          if (metrics.cohortSize > 0) {
            const stored = await storeCohortRetentionMetrics(metrics, university.id)

            results.cohortRetention.push({
              cohortDate: cohortDateStr,
              success: stored,
              error: stored ? undefined : 'Failed to store metrics'
            })

            safeLogger.info('[Cron] Cohort retention metrics calculated', {
              cohortDate: cohortDateStr,
              universityId: university.id,
              cohortSize: metrics.cohortSize,
              day1Retention: metrics.day1Retention,
              day7Retention: metrics.day7Retention,
              day30Retention: metrics.day30Retention
            })
          }
        }
      } catch (error) {
        safeLogger.error('[Cron] Failed to calculate cohort retention metrics', {
          error,
          cohortDate: cohortDateStr
        })
        results.cohortRetention.push({
          cohortDate: cohortDateStr,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.supplyDemand.filter(r => r.success).length
    const failureCount = results.supplyDemand.filter(r => !r.success).length
    const retentionSuccessCount = results.cohortRetention.filter(r => r.success).length
    const retentionFailureCount = results.cohortRetention.filter(r => !r.success).length

    safeLogger.info('[Cron] Metrics collection complete', {
      supplyDemand: { success: successCount, failures: failureCount },
      cohortRetention: { success: retentionSuccessCount, failures: retentionFailureCount }
    })

    return NextResponse.json({
      success: true,
      runId: `metrics_collection_${Date.now()}`,
      results: {
        supplyDemand: {
          total: results.supplyDemand.length,
          success: successCount,
          failures: failureCount
        },
        cohortRetention: {
          total: results.cohortRetention.length,
          success: retentionSuccessCount,
          failures: retentionFailureCount
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    safeLogger.error('[Cron] Metrics collection failed', { error })
    return NextResponse.json(
      { error: 'Metrics collection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

