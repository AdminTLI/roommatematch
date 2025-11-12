import { NextResponse } from 'next/server'
import { checkProgrammeCoverage, storeCoverageMetrics, checkCoverageRegression } from '@/lib/admin/coverage-monitor'
import { sendAlert } from '@/lib/monitoring/alerts'
import { checkAndAlertStudyMonthCompleteness } from '@/lib/monitoring/alerts'
import { calculateSupplyDemandMetrics, storeSupplyDemandMetrics, calculateCohortRetentionMetrics, storeCohortRetentionMetrics } from '@/lib/analytics/supply-demand'
import { detectAllAnomalies } from '@/lib/analytics/anomaly-detection'
import { processOnboardingEmailSequence, getUsersNeedingEmailReminders, sendVerificationReminderEmail } from '@/lib/email/onboarding-sequences'
import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/cron/maintenance
 * Combined cron job for coverage check, metrics, anomaly detection, and email sequences
 * Runs daily to perform all maintenance tasks
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      safeLogger.warn('[Cron] Unauthorized maintenance request attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    safeLogger.info('[Cron] Starting maintenance tasks')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const results = {
      coverage: { success: false, error: null as string | null },
      metrics: { success: false, error: null as string | null },
      anomalies: { success: false, error: null as string | null },
      emails: { success: false, error: null as string | null }
    }

    // 1. Coverage Check
    try {
      safeLogger.info('[Cron] Starting coverage check')
      const currentReport = await checkProgrammeCoverage()

      const { data: previousMetrics } = await supabase
        .from('analytics_metrics')
        .select('filter_criteria')
        .eq('metric_name', 'programme_coverage_percentage')
        .order('period_end', { ascending: false })
        .limit(1)
        .maybeSingle()

      let previousReport: any = null
      if (previousMetrics?.filter_criteria) {
        previousReport = {
          totalInstitutions: previousMetrics.filter_criteria.totalInstitutions || 0,
          completeInstitutions: previousMetrics.filter_criteria.completeInstitutions || 0,
          incompleteInstitutions: previousMetrics.filter_criteria.incompleteInstitutions || 0,
          missingInstitutions: previousMetrics.filter_criteria.missingInstitutions || 0,
          institutions: []
        }
      }

      const regressionCheck = await checkCoverageRegression(previousReport)
      await storeCoverageMetrics(currentReport)

      const coveragePercentage = currentReport.totalInstitutions > 0
        ? (currentReport.completeInstitutions / currentReport.totalInstitutions) * 100
        : 0

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

      await checkAndAlertStudyMonthCompleteness(10)
      results.coverage.success = true
      safeLogger.info('[Cron] Coverage check complete')
    } catch (error) {
      results.coverage.error = error instanceof Error ? error.message : 'Unknown error'
      safeLogger.error('[Cron] Coverage check failed', { error })
    }

    // 2. Metrics Collection
    try {
      safeLogger.info('[Cron] Starting metrics collection')
      const { data: universities } = await supabase
        .from('universities')
        .select('id')

      // Calculate supply/demand metrics
      for (const university of [{ id: undefined }, ...(universities || [])]) {
        try {
          const metrics = await calculateSupplyDemandMetrics(university.id, 30)
          await storeSupplyDemandMetrics(metrics, university.id)
        } catch (error) {
          safeLogger.error('[Cron] Failed to calculate supply/demand metrics', {
            error,
            universityId: university.id
          })
        }
      }

      // Calculate cohort retention metrics for last 90 days
      const today = new Date()
      for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
        const cohortDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000)
        const cohortDateStr = cohortDate.toISOString().split('T')[0]

        try {
          for (const university of [{ id: undefined }, ...(universities || [])]) {
            const metrics = await calculateCohortRetentionMetrics(
              cohortDateStr,
              university.id
            )

            if (metrics.cohortSize > 0) {
              await storeCohortRetentionMetrics(metrics, university.id)
            }
          }
        } catch (error) {
          safeLogger.error('[Cron] Failed to calculate cohort retention metrics', {
            error,
            cohortDate: cohortDateStr
          })
        }
      }

      results.metrics.success = true
      safeLogger.info('[Cron] Metrics collection complete')
    } catch (error) {
      results.metrics.error = error instanceof Error ? error.message : 'Unknown error'
      safeLogger.error('[Cron] Metrics collection failed', { error })
    }

    // 3. Anomaly Detection
    try {
      safeLogger.info('[Cron] Starting anomaly detection')
      const anomalies = await detectAllAnomalies(24)
      const criticalCount = anomalies.filter(a => a.severity === 'critical').length
      const highCount = anomalies.filter(a => a.severity === 'high').length

      safeLogger.info('[Cron] Anomaly detection complete', {
        total: anomalies.length,
        critical: criticalCount,
        high: highCount
      })

      results.anomalies.success = true
    } catch (error) {
      results.anomalies.error = error instanceof Error ? error.message : 'Unknown error'
      safeLogger.error('[Cron] Anomaly detection failed', { error })
    }

    // 4. Email Sequences
    try {
      safeLogger.info('[Cron] Starting email sequence processing')
      const emailResults = {
        verificationReminders: 0,
        onboardingReminders: 0,
        errors: 0
      }

      // Send verification reminder emails
      const usersNeedingVerification = await getUsersNeedingEmailReminders('verification_reminder', 24)
      for (const user of usersNeedingVerification) {
        try {
          const emailSent = await sendVerificationReminderEmail(
            user.user_id,
            user.email,
            `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
          )

          if (emailSent) {
            emailResults.verificationReminders++
          } else {
            emailResults.errors++
          }
        } catch (error) {
          safeLogger.error('Failed to send verification reminder email', { error, userId: user.user_id })
          emailResults.errors++
        }
      }

      // Send onboarding reminder emails
      const usersNeedingOnboarding = await getUsersNeedingEmailReminders('onboarding_reminder', 48)
      for (const user of usersNeedingOnboarding) {
        try {
          const emailSent = await processOnboardingEmailSequence(user.user_id, 'onboarding_started', 0)

          if (emailSent) {
            emailResults.onboardingReminders++
          } else {
            emailResults.errors++
          }
        } catch (error) {
          safeLogger.error('Failed to send onboarding reminder email', { error, userId: user.user_id })
          emailResults.errors++
        }
      }

      results.emails.success = true
      safeLogger.info('[Cron] Email sequence processing complete', {
        verificationReminders: emailResults.verificationReminders,
        onboardingReminders: emailResults.onboardingReminders,
        errors: emailResults.errors
      })
    } catch (error) {
      results.emails.error = error instanceof Error ? error.message : 'Unknown error'
      safeLogger.error('[Cron] Email sequence processing failed', { error })
    }

    const successCount = Object.values(results).filter(r => r.success).length
    const failureCount = Object.values(results).filter(r => !r.success).length

    safeLogger.info('[Cron] Maintenance tasks complete', {
      success: successCount,
      failures: failureCount,
      results
    })

    return NextResponse.json({
      success: true,
      runId: `maintenance_${Date.now()}`,
      results: {
        coverage: results.coverage.success ? 'success' : `error: ${results.coverage.error}`,
        metrics: results.metrics.success ? 'success' : `error: ${results.metrics.error}`,
        anomalies: results.anomalies.success ? 'success' : `error: ${results.anomalies.error}`,
        emails: results.emails.success ? 'success' : `error: ${results.emails.error}`
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    safeLogger.error('[Cron] Maintenance tasks failed', { error })
    return NextResponse.json(
      { error: 'Maintenance tasks failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

