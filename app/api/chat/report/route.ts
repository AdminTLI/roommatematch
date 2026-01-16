import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { createNotificationsForUsers } from '@/lib/notifications/create'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 5 reports per hour per user
    const rateLimitKey = getUserRateLimitKey('report', user.id)
    const rateLimitResult = await checkRateLimit('report', rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many reports. Please wait before submitting another.' },
        { status: 429 }
      )
    }

    const { target_user_id, message_id, category, details } = await request.json()

    if (!target_user_id || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validCategories = ['spam', 'harassment', 'inappropriate', 'other']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const admin = await createAdminClient()

    // Check for repeated reports (auto-block if 3+ reports in 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: recentReports } = await admin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('target_user_id', target_user_id)
      .gte('created_at', oneDayAgo)

    const autoBlocked = (recentReports || 0) >= 2 // 3rd report triggers auto-block

    // Create report
    const { data: report, error: reportError } = await admin
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_user_id,
        message_id: message_id || null,
        category,
        reason: category,
        details: details || null,
        status: 'open',
        auto_blocked: autoBlocked
      })
      .select()
      .single()

    if (reportError) {
      safeLogger.error('[Report] Failed to create report', reportError)
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
    }

    // Auto-block if threshold reached
    if (autoBlocked) {
      await admin
        .from('match_blocklist')
        .insert({
          user_id: user.id,
          blocked_user_id: target_user_id
        })
        .catch(() => {
          // Ignore if already blocked
        })

      safeLogger.warn('[Report] Auto-blocked user due to repeated reports', {
        targetUserId: target_user_id,
        reportCount: (recentReports || 0) + 1
      })
    }

    // Notify all admins about the new report
    try {
      const { data: admins } = await admin
        .from('admins')
        .select('user_id')

      if (admins && admins.length > 0) {
        const adminUserIds = admins.map(a => a.user_id)
        
        // Get reporter and target user names for notification
        const { data: reporterProfile } = await admin
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .maybeSingle()

        const { data: targetProfile } = await admin
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', target_user_id)
          .maybeSingle()

        const reporterName = reporterProfile 
          ? [reporterProfile.first_name, reporterProfile.last_name].filter(Boolean).join(' ') || 'User'
          : 'User'
        
        const targetName = targetProfile
          ? [targetProfile.first_name, targetProfile.last_name].filter(Boolean).join(' ') || 'User'
          : 'User'

        const categoryLabels: Record<string, string> = {
          spam: 'Spam',
          harassment: 'Harassment',
          inappropriate: 'Inappropriate Content',
          other: 'Other'
        }

        await createNotificationsForUsers(
          adminUserIds,
          'system_announcement',
          'New User Report',
          `${reporterName} reported ${targetName} for ${categoryLabels[category] || category}.${autoBlocked ? ' User auto-blocked due to repeated reports.' : ''}`,
          {
            report_id: report.id,
            reporter_id: user.id,
            target_user_id: target_user_id,
            category,
            auto_blocked: autoBlocked,
            link: `/admin/reports`,
            type: 'user_report'
          }
        )

        safeLogger.info('[Report] Notified admins', {
          reportId: report.id,
          adminCount: adminUserIds.length
        })
      }
    } catch (notifyError) {
      // Don't fail the report creation if notification fails
      safeLogger.error('[Report] Failed to notify admins', notifyError)
    }

    return NextResponse.json({ 
      success: true, 
      reportId: report.id,
      autoBlocked 
    })
  } catch (error) {
    safeLogger.error('[Report] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

