import { NextResponse } from 'next/server'
import { checkProgrammeCoverage, storeCoverageMetrics, checkCoverageRegression } from '@/lib/admin/coverage-monitor'
import { sendAlert } from '@/lib/monitoring/alerts'
import { checkAndAlertStudyMonthCompleteness } from '@/lib/monitoring/alerts'
import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/cron/coverage-check
 * Cron job to check programme coverage and send alerts
 * Runs daily to monitor coverage regressions
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security - REQUIRED in production
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

    // Require secret in production - fail fast if missing
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
      if (!cronSecret) {
        safeLogger.error('[Cron] CRON_SECRET or VERCEL_CRON_SECRET is required in production')
        return NextResponse.json(
          { error: 'Cron secret not configured' },
          { status: 500 }
        )
      }
    }

    // Verify authorization header matches secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      safeLogger.warn('[Cron] Unauthorized coverage check request attempt', {
        hasHeader: !!authHeader,
        hasSecret: !!cronSecret
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // If no secret configured in development, warn but allow (for local testing)
    if (!cronSecret && (process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV)) {
      safeLogger.warn('[Cron] No cron secret configured - allowing request in development only')
    }

    safeLogger.info('[Cron] Starting coverage check')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current coverage report
    const currentReport = await checkProgrammeCoverage()

    // Get previous coverage report from analytics_metrics (last 24 hours)
    const { data: previousMetrics } = await supabase
      .from('analytics_metrics')
      .select('filter_criteria')
      .eq('metric_name', 'programme_coverage_percentage')
      .order('period_end', { ascending: false })
      .limit(1)
      .maybeSingle()

    let previousReport: any = null
    if (previousMetrics?.filter_criteria) {
      // Reconstruct previous report from metrics
      previousReport = {
        totalInstitutions: previousMetrics.filter_criteria.totalInstitutions || 0,
        completeInstitutions: previousMetrics.filter_criteria.completeInstitutions || 0,
        incompleteInstitutions: previousMetrics.filter_criteria.incompleteInstitutions || 0,
        missingInstitutions: previousMetrics.filter_criteria.missingInstitutions || 0,
        institutions: []
      }
    }

    // Check for regressions
    const regressionCheck = await checkCoverageRegression(previousReport)

    // Store metrics
    await storeCoverageMetrics(currentReport)

    // Send alerts if regression detected
    if (regressionCheck.hasRegression) {
      const { newlyIncomplete, newlyMissing, coverageDropped } = regressionCheck.regressionDetails

      let alertMessage = 'Programme coverage regression detected:\n'
      if (newlyIncomplete.length > 0) {
        alertMessage += `- ${newlyIncomplete.length} institution(s) became incomplete: ${newlyIncomplete.map(i => i.label).join(', ')}\n`
      }
      if (newlyMissing.length > 0) {
        alertMessage += `- ${newlyMissing.length} institution(s) became missing: ${newlyMissing.map(i => i.label).join(', ')}\n`
      }
      if (coverageDropped) {
        const prevPercentage = previousReport
          ? ((previousReport.completeInstitutions / previousReport.totalInstitutions) * 100).toFixed(1)
          : 'unknown'
        const currentPercentage = ((currentReport.completeInstitutions / currentReport.totalInstitutions) * 100).toFixed(1)
        alertMessage += `- Coverage percentage dropped from ${prevPercentage}% to ${currentPercentage}%`
      }

      await sendAlert(
        'coverage',
        'Programme Coverage Regression Alert',
        alertMessage,
        newlyMissing.length > 0 ? 'high' : 'medium',
        {
          currentReport,
          regressionDetails: regressionCheck.regressionDetails
        }
      )
    }

    // Check if coverage is below threshold (90%)
    const coveragePercentage = currentReport.totalInstitutions > 0
      ? (currentReport.completeInstitutions / currentReport.totalInstitutions) * 100
      : 0

    if (coveragePercentage < 90) {
      await sendAlert(
        'coverage',
        'Programme Coverage Below Threshold',
        `${coveragePercentage.toFixed(1)}% of institutions have complete programme coverage (${currentReport.completeInstitutions}/${currentReport.totalInstitutions}). ${currentReport.incompleteInstitutions} incomplete, ${currentReport.missingInstitutions} missing.`,
        coveragePercentage < 70 ? 'high' : 'medium',
        {
          coveragePercentage,
          completeInstitutions: currentReport.completeInstitutions,
          incompleteInstitutions: currentReport.incompleteInstitutions,
          missingInstitutions: currentReport.missingInstitutions,
          totalInstitutions: currentReport.totalInstitutions
        }
      )
    }

    // Also check study month completeness
    const studyMonthAlert = await checkAndAlertStudyMonthCompleteness(10)

    safeLogger.info('[Cron] Coverage check complete', {
      coveragePercentage: coveragePercentage.toFixed(1),
      hasRegression: regressionCheck.hasRegression,
      studyMonthAlert: studyMonthAlert ? {
        percentage: studyMonthAlert.percentage.toFixed(1),
        shouldAlert: studyMonthAlert.shouldAlert
      } : null
    })

    return NextResponse.json({
      success: true,
      runId: `coverage_check_${Date.now()}`,
      coverage: {
        percentage: coveragePercentage,
        completeInstitutions: currentReport.completeInstitutions,
        incompleteInstitutions: currentReport.incompleteInstitutions,
        missingInstitutions: currentReport.missingInstitutions,
        hasRegression: regressionCheck.hasRegression
      },
      studyMonths: studyMonthAlert ? {
        percentage: studyMonthAlert.percentage,
        usersWithMissingMonths: studyMonthAlert.usersWithMissingMonths,
        totalUsers: studyMonthAlert.totalUsers,
        shouldAlert: studyMonthAlert.shouldAlert
      } : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    safeLogger.error('[Cron] Coverage check failed', { error })
    return NextResponse.json(
      { error: 'Coverage check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

