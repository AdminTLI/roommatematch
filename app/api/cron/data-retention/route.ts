import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/cron/data-retention
 * 
 * Automated data retention cleanup job
 * Runs daily to purge expired data per GDPR and Dutch law requirements
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      safeLogger.warn('[Cron] Unauthorized data retention request attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    safeLogger.info('[Cron] Starting data retention cleanup')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const results = {
      verifications: { deleted: 0, error: null as string | null },
      messages: { deleted: 0, error: null as string | null },
      reports: { deleted: 0, error: null as string | null },
      app_events: { deleted: 0, error: null as string | null },
      inactive_accounts: { anonymized: 0, error: null as string | null },
      match_suggestions: { expired: 0, error: null as string | null }
    }

    // 1. Purge expired verification documents (4 weeks per Dutch law)
    try {
      const { data: verificationResult, error } = await supabase.rpc('purge_expired_verifications')
      if (error) {
        throw error
      }
      results.verifications.deleted = verificationResult || 0
      safeLogger.info('[Cron] Purged expired verification documents', { count: results.verifications.deleted })
    } catch (error) {
      results.verifications.error = error instanceof Error ? error.message : 'Unknown error'
      safeLogger.error('[Cron] Failed to purge expired verifications', { error })
    }

    // 2. Purge expired messages (1 year)
    try {
      const { data: messageResult, error } = await supabase.rpc('purge_expired_messages')
      if (error) {
        throw error
      }
      results.messages.deleted = messageResult || 0
      safeLogger.info('[Cron] Purged expired messages', { count: results.messages.deleted })
    } catch (error) {
      results.messages.error = error instanceof Error ? error.message : 'Unknown error'
      safeLogger.error('[Cron] Failed to purge expired messages', { error })
    }

    // 3. Purge expired reports (1 year after resolution)
    try {
      const { data: reportResult, error } = await supabase.rpc('purge_expired_reports')
      if (error) {
        throw error
      }
      results.reports.deleted = reportResult || 0
      safeLogger.info('[Cron] Purged expired reports', { count: results.reports.deleted })
    } catch (error) {
      results.reports.error = error instanceof Error ? error.message : 'Unknown error'
      safeLogger.error('[Cron] Failed to purge expired reports', { error })
    }

    // 4. Purge expired app events (90 days)
    try {
      const { data: eventResult, error } = await supabase.rpc('purge_expired_app_events')
      if (error) {
        throw error
      }
      results.app_events.deleted = eventResult || 0
      safeLogger.info('[Cron] Purged expired app events', { count: results.app_events.deleted })
    } catch (error) {
      results.app_events.error = error instanceof Error ? error.message : 'Unknown error'
      safeLogger.error('[Cron] Failed to purge expired app events', { error })
    }

    // 5. Anonymize inactive accounts (2 years)
    try {
      const { data: accountResult, error } = await supabase.rpc('anonymize_inactive_accounts')
      if (error) {
        throw error
      }
      results.inactive_accounts.anonymized = accountResult || 0
      safeLogger.info('[Cron] Anonymized inactive accounts', { count: results.inactive_accounts.anonymized })
    } catch (error) {
      results.inactive_accounts.error = error instanceof Error ? error.message : 'Unknown error'
      safeLogger.error('[Cron] Failed to anonymize inactive accounts', { error })
    }

    // 6. Expire old match suggestions (90 days after expiry)
    try {
      // Check if match_suggestions table exists and has expiry logic
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
          results.match_suggestions.expired = suggestionIds.length
          safeLogger.info('[Cron] Expired old match suggestions', { count: results.match_suggestions.expired })
        }
      }
    } catch (error) {
      results.match_suggestions.error = error instanceof Error ? error.message : 'Unknown error'
      safeLogger.error('[Cron] Failed to expire match suggestions', { error })
    }

    // 7. Process account deletions (after grace period)
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
        
        // Note: Actual deletion should be handled by admin or separate process
        // This cron job just identifies accounts ready for deletion
        for (const request of deletionRequests) {
          safeLogger.info('[Cron] Account ready for deletion', {
            userId: request.user_id,
            scheduledAt: request.deletion_scheduled_at,
            requestId: request.id
          })
        }
      }
    } catch (error) {
      safeLogger.error('[Cron] Failed to process account deletions', { error })
    }

    const successCount = Object.values(results).filter(r => !r.error).length
    const failureCount = Object.values(results).filter(r => r.error).length

    safeLogger.info('[Cron] Data retention cleanup complete', {
      success: successCount,
      failures: failureCount,
      results
    })

    return NextResponse.json({
      success: true,
      runId: `retention_${Date.now()}`,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    safeLogger.error('[Cron] Data retention cleanup failed', { error })
    return NextResponse.json(
      { 
        error: 'Data retention cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

