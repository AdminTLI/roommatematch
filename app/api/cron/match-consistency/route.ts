import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { sendAlert } from '@/lib/monitoring/alerts'

export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/match-consistency
 * Periodic cron job to check and fix match_suggestions data consistency
 * Runs daily to ensure data integrity and prevent issues like the confirmed matches bug
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security - REQUIRED in production
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

    // Require secret in production
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
      safeLogger.warn('[Cron] Unauthorized match-consistency request attempt', {
        hasHeader: !!authHeader,
        hasSecret: !!cronSecret
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If no secret configured in development, warn but allow (for local testing)
    if (!cronSecret && (process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV)) {
      safeLogger.warn('[Cron] No cron secret configured - allowing request in development only')
    }

    safeLogger.info('[Cron] Starting match consistency check')

    const admin = await createAdminClient()

    // 1. Check for inconsistencies
    const { data: issues, error: checkError } = await admin.rpc('check_match_suggestions_consistency')

    if (checkError) {
      safeLogger.error('[Cron] Failed to check match consistency', { error: checkError })
      return NextResponse.json(
        { error: 'Failed to check consistency', details: checkError.message },
        { status: 500 }
      )
    }

    // Process issues
    const issueSummary: Record<string, { count: number; details: any }> = {}
    let totalIssues = 0
    let criticalIssues = 0

    if (issues && issues.length > 0) {
      for (const issue of issues) {
        const count = Number(issue.issue_count || 0)
        issueSummary[issue.issue_type] = {
          count,
          details: issue.issue_details
        }
        totalIssues += count

        // Critical issues that should be fixed immediately
        if (issue.issue_type === 'confirmed_not_all_accepted' || 
            issue.issue_type === 'all_accepted_not_confirmed') {
          criticalIssues += count
        }
      }
    }

    safeLogger.info('[Cron] Consistency check complete', {
      totalIssues,
      criticalIssues,
      issueTypes: Object.keys(issueSummary)
    })

    // 2. Fix issues if any found
    let fixResults: any[] = []
    if (totalIssues > 0) {
      safeLogger.info('[Cron] Fixing consistency issues')

      const { data: fixes, error: fixError } = await admin.rpc('fix_match_suggestions_consistency')

      if (fixError) {
        safeLogger.error('[Cron] Failed to fix consistency issues', { error: fixError })
        // Continue even if fix fails - we'll still report the issues
      } else if (fixes) {
        fixResults = fixes
        const totalFixed = fixes.reduce((sum: number, f: any) => sum + Number(f.fixed_count || 0), 0)
        safeLogger.info('[Cron] Fixed consistency issues', { totalFixed, fixes: fixes.length })
      }
    }

    // 3. Send alerts if critical issues found or if fixes were applied
    if (criticalIssues > 0) {
      const alertMessage = `Found ${criticalIssues} critical match consistency issue(s):\n\n` +
        Object.entries(issueSummary)
          .filter(([type]) => type === 'confirmed_not_all_accepted' || type === 'all_accepted_not_confirmed')
          .map(([type, { count, details }]) => {
            const typeLabel = type === 'confirmed_not_all_accepted' 
              ? 'Confirmed matches where not all members accepted'
              : 'All members accepted but status not confirmed'
            return `- ${typeLabel}: ${count} issue(s)`
          })
          .join('\n') +
        (fixResults.length > 0 
          ? `\n\nAutomatically fixed ${fixResults.reduce((sum, f) => sum + Number(f.fixed_count || 0), 0)} issue(s).`
          : '\n\nAttempted to fix issues automatically.')
      
      await sendAlert(
        'data-integrity',
        'Critical Match Consistency Issues Detected',
        alertMessage,
        criticalIssues > 10 ? 'high' : 'medium',
        {
          totalIssues,
          criticalIssues,
          issueSummary,
          fixResults
        }
      )
    } else if (totalIssues > 0 && fixResults.length > 0) {
      // Non-critical issues were fixed
      const totalFixed = fixResults.reduce((sum: number, f: any) => sum + Number(f.fixed_count || 0), 0)
      safeLogger.info('[Cron] Fixed non-critical consistency issues', { totalFixed })
    }

    // 4. Verify triggers are active
    const { data: triggers, error: triggerError } = await admin
      .from('pg_trigger')
      .select('tgname')
      .in('tgname', [
        'trigger_auto_confirm_match_insert',
        'trigger_auto_confirm_match_update',
        'trigger_validate_accepted_by_members',
        'trigger_validate_confirmed_status',
        'trigger_validate_declined_status',
        'trigger_validate_no_duplicate_members'
      ])

    if (triggerError) {
      safeLogger.warn('[Cron] Could not verify triggers', { error: triggerError })
    } else {
      const triggerNames = (triggers || []).map((t: any) => t.tgname)
      const expectedTriggers = [
        'trigger_auto_confirm_match_insert',
        'trigger_auto_confirm_match_update',
        'trigger_validate_accepted_by_members',
        'trigger_validate_confirmed_status'
      ]
      const missingTriggers = expectedTriggers.filter(name => !triggerNames.includes(name))
      
      if (missingTriggers.length > 0) {
        safeLogger.error('[Cron] Missing critical triggers', { missingTriggers })
        await sendAlert(
          'system-health',
          'Missing Match System Triggers',
          `The following critical triggers are missing: ${missingTriggers.join(', ')}. ` +
          `This may lead to data consistency issues. Please check migrations 119 and 128.`,
          'high',
          { missingTriggers, activeTriggers: triggerNames }
        )
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      issues: {
        total: totalIssues,
        critical: criticalIssues,
        byType: issueSummary
      },
      fixes: fixResults,
      triggers: {
        checked: triggers?.length || 0,
        active: (triggers || []).map((t: any) => t.tgname)
      }
    })
  } catch (error) {
    safeLogger.error('[Cron] Match consistency check failed', { error })
    return NextResponse.json(
      { 
        error: 'Match consistency check failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
