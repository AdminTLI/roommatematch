import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/cron/data-retention
 * 
 * Automated data retention cleanup job
 * Runs daily to purge expired data per GDPR and Dutch law requirements
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
      safeLogger.warn('[Cron] Unauthorized data retention request attempt', {
        hasHeader: !!authHeader,
        hasSecret: !!cronSecret
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // If no secret configured in development, warn but allow (for local testing)
    if (!cronSecret && (process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV)) {
      safeLogger.warn('[Cron] No cron secret configured - allowing request in development only')
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
      match_suggestions: { expired: 0, error: null as string | null },
      account_deletions: { deleted: 0, errors: [] as string[] }
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
        
        // Use admin client for deletion operations
        const adminClient = createAdminClient()
        
        for (const request of deletionRequests) {
          if (!request.user_id) {
            results.account_deletions.errors.push(`Request ${request.id}: Missing user_id`)
            continue
          }

          try {
            const targetUserId = request.user_id

            // 1. Check verification document retention (4 weeks per Dutch law)
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
            fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28) // 4 weeks

            let verificationFilesDeleted = false
            let verificationFilesRetained = false

            if (latestVerificationDate && latestVerificationDate > fourWeeksAgo) {
              // Verification documents must be retained for 4 weeks
              // Skip deletion and log retention requirement
              verificationFilesRetained = true
              safeLogger.info('[Cron] Preserving verification documents per Dutch law', {
                userId: targetUserId,
                requestId: request.id,
                latestVerificationDate: latestVerificationDate.toISOString(),
                retentionUntil: new Date(latestVerificationDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString()
              })
              
              // Update request to note retention requirement
              await supabase
                .from('dsar_requests')
                .update({
                  admin_notes: `Deletion delayed: Verification documents must be retained for 4 weeks per Dutch law. Retention until ${new Date(latestVerificationDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString()}`
                })
                .eq('id', request.id)
              
              continue // Skip this deletion for now
            } else if (latestVerificationDate) {
              // Verification retention period has passed, delete files from storage
              try {
                // List all files in the user's verification folder
                const { data: files, error: listError } = await supabase.storage
                  .from('verification-documents')
                  .list(`${targetUserId}`, {
                    limit: 1000,
                    sortBy: { column: 'created_at', order: 'desc' }
                  })

                if (!listError && files && files.length > 0) {
                  // Delete all verification files
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
                // Continue with deletion even if storage cleanup fails
              }
            }

            // 2. Delete verification records from database (after files are deleted or if no files)
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
                // Continue with deletion even if verification records deletion fails
              }
            }

            // 3. Delete user data (cascade will handle most tables)
            // This will cascade delete: profiles, responses, matches, chats, messages, etc.
            const { error: deleteError } = await supabase
              .from('users')
              .delete()
              .eq('id', targetUserId)

            if (deleteError) {
              throw new Error(`Failed to delete user: ${deleteError.message}`)
            }

            // 4. Delete auth user (this must be done with admin client)
            const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetUserId)

            if (authDeleteError) {
              safeLogger.error('[Cron] Failed to delete auth user', { 
                error: authDeleteError, 
                userId: targetUserId,
                requestId: request.id
              })
              throw new Error(`Failed to delete auth user: ${authDeleteError.message}`)
            }

            // 5. Update DSAR request with completion
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

            results.account_deletions.deleted++
            safeLogger.info('[Cron] Account permanently deleted', {
              requestId: request.id,
              userId: targetUserId
            })

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            results.account_deletions.errors.push(`User ${request.user_id} (request ${request.id}): ${errorMessage}`)
            safeLogger.error('[Cron] Failed to delete account', { 
              error, 
              userId: request.user_id,
              requestId: request.id
            })
            // Continue with next account even if this one fails
          }
        }

        safeLogger.info('[Cron] Account deletion processing complete', {
          deleted: results.account_deletions.deleted,
          errors: results.account_deletions.errors.length
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      results.account_deletions.errors.push(`Failed to process deletions: ${errorMessage}`)
      safeLogger.error('[Cron] Failed to process account deletions', { error })
    }

    const successCount = Object.values(results).filter(r => {
      if ('error' in r) return !r.error
      if ('errors' in r) return r.errors.length === 0
      return true
    }).length
    const failureCount = Object.values(results).filter(r => {
      if ('error' in r) return !!r.error
      if ('errors' in r) return r.errors.length > 0
      return false
    }).length

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

