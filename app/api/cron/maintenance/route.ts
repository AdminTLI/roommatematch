import { NextResponse } from 'next/server'
import { checkProgrammeCoverage, storeCoverageMetrics, checkCoverageRegression } from '@/lib/admin/coverage-monitor'
import { sendAlert } from '@/lib/monitoring/alerts'
import { checkAndAlertStudyMonthCompleteness } from '@/lib/monitoring/alerts'
import { calculateSupplyDemandMetrics, storeSupplyDemandMetrics, calculateCohortRetentionMetrics, storeCohortRetentionMetrics } from '@/lib/analytics/supply-demand'
import { detectAllAnomalies } from '@/lib/analytics/anomaly-detection'
import { processOnboardingEmailSequence, getUsersNeedingEmailReminders, sendVerificationReminderEmail } from '@/lib/email/onboarding-sequences'
import { sendSLAReminders, processPendingDSARRequests } from '@/lib/privacy/dsar-automation'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

export const maxDuration = 300 // 5 minutes - maximum allowed for Hobby plan
export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/maintenance
 * Combined cron job for coverage check, metrics, anomaly detection, email sequences, and data retention
 * Runs daily to perform all maintenance tasks including GDPR-compliant data cleanup
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
      safeLogger.warn('[Cron] Unauthorized maintenance request attempt', {
        hasHeader: !!authHeader,
        hasSecret: !!cronSecret
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // If no secret configured in development, warn but allow (for local testing)
    if (!cronSecret && (process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV)) {
      safeLogger.warn('[Cron] No cron secret configured - allowing request in development only')
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
      emails: { success: false, error: null as string | null },
      dsar: { success: false, error: null as string | null },
      dataRetention: {
        verifications: { deleted: 0, error: null as string | null },
        messages: { deleted: 0, error: null as string | null },
        reports: { deleted: 0, error: null as string | null },
        app_events: { deleted: 0, error: null as string | null },
        inactive_accounts: { anonymized: 0, error: null as string | null },
        match_suggestions: { expired: 0, error: null as string | null },
        account_deletions: { deleted: 0, errors: [] as string[] }
      }
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

      // Calculate cohort retention metrics for last 7 days only (reduced to stay within 5min timeout)
      // Process only the most recent days to prioritize current data
      const today = new Date()
      const daysToProcess = 7 // Reduced from 30 to save execution time
      for (let daysAgo = 0; daysAgo < daysToProcess; daysAgo++) {
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

    // 5. DSAR Automation (SLA reminders and processing)
    try {
      safeLogger.info('[Cron] Starting DSAR automation')
      
      // Send SLA reminders and escalate overdue requests
      const reminderResults = await sendSLAReminders()
      safeLogger.info('[Cron] SLA reminders processed', {
        approaching: reminderResults.approaching,
        overdue: reminderResults.overdue,
        errors: reminderResults.errors
      })

      // Process pending DSAR requests
      const processingResults = await processPendingDSARRequests()
      safeLogger.info('[Cron] Pending DSAR requests processed', {
        processed: processingResults.processed,
        errors: processingResults.errors
      })

      results.dsar.success = true
      safeLogger.info('[Cron] DSAR automation complete', {
        reminders: {
          approaching: reminderResults.approaching,
          overdue: reminderResults.overdue
        },
        processed: processingResults.processed,
        totalErrors: reminderResults.errors + processingResults.errors
      })
    } catch (error) {
      results.dsar.error = error instanceof Error ? error.message : 'Unknown error'
      safeLogger.error('[Cron] DSAR automation failed', { error })
    }

    // 6. Data Retention Cleanup (GDPR-compliant data purging)
    try {
      safeLogger.info('[Cron] Starting data retention cleanup')
      
      // 6.1. Purge expired verification documents (4 weeks per Dutch law)
      try {
        const { data: verificationResult, error } = await supabase.rpc('purge_expired_verifications')
        if (error) {
          throw error
        }
        results.dataRetention.verifications.deleted = verificationResult || 0
        safeLogger.info('[Cron] Purged expired verification documents', { count: results.dataRetention.verifications.deleted })
      } catch (error) {
        results.dataRetention.verifications.error = error instanceof Error ? error.message : 'Unknown error'
        safeLogger.error('[Cron] Failed to purge expired verifications', { error })
      }

      // 6.2. Purge expired messages (1 year)
      try {
        const { data: messageResult, error } = await supabase.rpc('purge_expired_messages')
        if (error) {
          throw error
        }
        results.dataRetention.messages.deleted = messageResult || 0
        safeLogger.info('[Cron] Purged expired messages', { count: results.dataRetention.messages.deleted })
      } catch (error) {
        results.dataRetention.messages.error = error instanceof Error ? error.message : 'Unknown error'
        safeLogger.error('[Cron] Failed to purge expired messages', { error })
      }

      // 6.3. Purge expired reports (1 year after resolution)
      try {
        const { data: reportResult, error } = await supabase.rpc('purge_expired_reports')
        if (error) {
          throw error
        }
        results.dataRetention.reports.deleted = reportResult || 0
        safeLogger.info('[Cron] Purged expired reports', { count: results.dataRetention.reports.deleted })
      } catch (error) {
        results.dataRetention.reports.error = error instanceof Error ? error.message : 'Unknown error'
        safeLogger.error('[Cron] Failed to purge expired reports', { error })
      }

      // 6.4. Purge expired app events (90 days)
      try {
        const { data: eventResult, error } = await supabase.rpc('purge_expired_app_events')
        if (error) {
          throw error
        }
        results.dataRetention.app_events.deleted = eventResult || 0
        safeLogger.info('[Cron] Purged expired app events', { count: results.dataRetention.app_events.deleted })
      } catch (error) {
        results.dataRetention.app_events.error = error instanceof Error ? error.message : 'Unknown error'
        safeLogger.error('[Cron] Failed to purge expired app events', { error })
      }

      // 6.5. Anonymize inactive accounts (2 years)
      try {
        const { data: accountResult, error } = await supabase.rpc('anonymize_inactive_accounts')
        if (error) {
          throw error
        }
        results.dataRetention.inactive_accounts.anonymized = accountResult || 0
        safeLogger.info('[Cron] Anonymized inactive accounts', { count: results.dataRetention.inactive_accounts.anonymized })
      } catch (error) {
        results.dataRetention.inactive_accounts.error = error instanceof Error ? error.message : 'Unknown error'
        safeLogger.error('[Cron] Failed to anonymize inactive accounts', { error })
      }

      // 6.6. Expire old match suggestions (90 days after expiry)
      try {
        const { data: suggestions, error: fetchError } = await supabase
          .from('match_suggestions')
          .select('id')
          .eq('status', 'expired')
          .lt('updated_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
          .limit(1000)

        if (!fetchError && suggestions) {
          const suggestionIds = suggestions.map(s => s.id)
          if (suggestionIds.length > 0) {
            const { error: deleteError } = await supabase
              .from('match_suggestions')
              .delete()
              .in('id', suggestionIds)

            if (deleteError) {
              throw deleteError
            }
            results.dataRetention.match_suggestions.expired = suggestionIds.length
            safeLogger.info('[Cron] Expired old match suggestions', { count: results.dataRetention.match_suggestions.expired })
          }
        }
      } catch (error) {
        results.dataRetention.match_suggestions.error = error instanceof Error ? error.message : 'Unknown error'
        safeLogger.error('[Cron] Failed to expire match suggestions', { error })
      }

      // 6.7. Process account deletions (after grace period)
      try {
        const { data: deletionRequests, error: fetchError } = await supabase
          .from('dsar_requests')
          .select('user_id, deletion_scheduled_at, id')
          .eq('request_type', 'deletion')
          .eq('status', 'completed')
          .not('deletion_scheduled_at', 'is', null)
          .lt('deletion_scheduled_at', new Date().toISOString())
          .is('deletion_completed_at', null)

        if (!fetchError && deletionRequests && deletionRequests.length > 0) {
          safeLogger.info('[Cron] Found accounts ready for permanent deletion', { count: deletionRequests.length })
          
          const adminClient = createAdminClient()
          
          for (const request of deletionRequests) {
            if (!request.user_id) {
              results.dataRetention.account_deletions.errors.push(`Request ${request.id}: Missing user_id`)
              continue
            }

            try {
              const targetUserId = request.user_id

              // Check verification document retention (4 weeks per Dutch law)
              const { data: verifications } = await supabase
                .from('verifications')
                .select('created_at, updated_at')
                .eq('user_id', targetUserId)
                .order('updated_at', { ascending: false })
                .limit(1)

              const latestVerificationDate = verifications?.[0]?.updated_at 
                ? new Date(verifications[0].updated_at)
                : null

              const fourWeeksAgo = new Date()
              fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

              let verificationFilesDeleted = false
              let verificationFilesRetained = false

              if (latestVerificationDate && latestVerificationDate > fourWeeksAgo) {
                verificationFilesRetained = true
                safeLogger.info('[Cron] Preserving verification documents per Dutch law', {
                  userId: targetUserId,
                  requestId: request.id,
                  latestVerificationDate: latestVerificationDate.toISOString(),
                  retentionUntil: new Date(latestVerificationDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString()
                })
                
                await supabase
                  .from('dsar_requests')
                  .update({
                    admin_notes: `Deletion delayed: Verification documents must be retained for 4 weeks per Dutch law. Retention until ${new Date(latestVerificationDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString()}`
                  })
                  .eq('id', request.id)
                
                continue
              } else if (latestVerificationDate) {
                // Delete verification files from storage
                try {
                  const { data: files, error: listError } = await supabase.storage
                    .from('verification-documents')
                    .list(`${targetUserId}`, {
                      limit: 1000,
                      sortBy: { column: 'created_at', order: 'desc' }
                    })

                  if (!listError && files && files.length > 0) {
                    const filePaths = files.map(file => `${targetUserId}/${file.name}`)
                    const { error: deleteStorageError } = await supabase.storage
                      .from('verification-documents')
                      .remove(filePaths)

                    if (deleteStorageError) {
                      safeLogger.warn('[Cron] Failed to delete some verification files from storage', {
                        error: deleteStorageError,
                        userId: targetUserId,
                        requestId: request.id
                      })
                    } else {
                      verificationFilesDeleted = true
                      safeLogger.info('[Cron] Deleted verification files from storage', {
                        userId: targetUserId,
                        fileCount: files.length,
                        requestId: request.id
                      })
                    }
                  }
                } catch (storageError) {
                  safeLogger.error('[Cron] Error deleting verification files from storage', {
                    error: storageError,
                    userId: targetUserId,
                    requestId: request.id
                  })
                }
              }

              // Delete verification records from database
              if (!verificationFilesRetained) {
                const { error: deleteVerificationsError } = await supabase
                  .from('verifications')
                  .delete()
                  .eq('user_id', targetUserId)

                if (deleteVerificationsError) {
                  safeLogger.warn('[Cron] Failed to delete verification records', {
                    error: deleteVerificationsError,
                    userId: targetUserId,
                    requestId: request.id
                  })
                }
              }

              // Delete user data (cascade will handle most tables)
              const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', targetUserId)

              if (deleteError) {
                throw new Error(`Failed to delete user: ${deleteError.message}`)
              }

              // Delete auth user
              const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetUserId)

              if (authDeleteError) {
                safeLogger.error('[Cron] Failed to delete auth user', { 
                  error: authDeleteError, 
                  userId: targetUserId,
                  requestId: request.id
                })
                throw new Error(`Failed to delete auth user: ${authDeleteError.message}`)
              }

              // Update DSAR request with completion
              const adminNotes = verificationFilesRetained
                ? 'Account permanently deleted by automated cron job. Verification documents retained per Dutch law (4 weeks).'
                : verificationFilesDeleted
                ? 'Account permanently deleted by automated cron job. Verification files and records deleted after 4-week retention period.'
                : 'Account permanently deleted by automated cron job.'

              await supabase
                .from('dsar_requests')
                .update({
                  status: 'completed',
                  deletion_completed_at: new Date().toISOString(),
                  admin_notes: adminNotes
                })
                .eq('id', request.id)

              results.dataRetention.account_deletions.deleted++
              safeLogger.info('[Cron] Account permanently deleted', {
                requestId: request.id,
                userId: targetUserId
              })

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error'
              results.dataRetention.account_deletions.errors.push(`User ${request.user_id} (request ${request.id}): ${errorMessage}`)
              safeLogger.error('[Cron] Failed to delete account', { 
                error, 
                userId: request.user_id,
                requestId: request.id
              })
            }
          }

          safeLogger.info('[Cron] Account deletion processing complete', {
            deleted: results.dataRetention.account_deletions.deleted,
            errors: results.dataRetention.account_deletions.errors.length
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.dataRetention.account_deletions.errors.push(`Failed to process deletions: ${errorMessage}`)
        safeLogger.error('[Cron] Failed to process account deletions', { error })
      }

      safeLogger.info('[Cron] Data retention cleanup complete')
    } catch (error) {
      safeLogger.error('[Cron] Data retention cleanup failed', { error })
    }

    const successCount = Object.values(results).filter(r => {
      if ('success' in r) return r.success
      return true
    }).length
    const failureCount = Object.values(results).filter(r => {
      if ('success' in r) return !r.success
      if ('error' in r) return !!r.error
      if ('errors' in r) return r.errors.length > 0
      return false
    }).length

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
        emails: results.emails.success ? 'success' : `error: ${results.emails.error}`,
        dsar: results.dsar.success ? 'success' : `error: ${results.dsar.error}`,
        dataRetention: results.dataRetention
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

