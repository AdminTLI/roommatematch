import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { createNotificationsForUsers } from '@/lib/notifications/create'
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const admin = createAdminClient()

    // Build query - simplified to avoid foreign key issues
    let query = admin
      .from('reports')
      .select(`
        id,
        reporter_id,
        target_user_id,
        message_id,
        category,
        reason,
        details,
        attachments,
        status,
        auto_blocked,
        admin_id,
        action_taken,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: reports, error } = await query

    if (error) {
      safeLogger.error('[Admin] Failed to fetch reports', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      )
    }

    // Get total count
    let countQuery = admin.from('reports').select('id', { count: 'exact', head: true })
    if (status) countQuery = countQuery.eq('status', status)
    if (category) countQuery = countQuery.eq('category', category)

    const { count } = await countQuery

    // Fetch profile data for reporter and target users separately
    const userIds = new Set<string>()
    const reportIds = new Set<string>()
    reports?.forEach((report: any) => {
      if (report.reporter_id) userIds.add(report.reporter_id)
      if (report.target_user_id) userIds.add(report.target_user_id)
      if (report.id) reportIds.add(report.id)
    })

    const userIdsArray = Array.from(userIds)
    const reportIdsArray = Array.from(reportIds)
    
    // Fetch profiles
    const profilesMap = new Map()
    if (userIdsArray.length > 0) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIdsArray)
      
      profiles?.forEach((profile: any) => {
        profilesMap.set(profile.user_id, profile)
      })
    }

    // Fetch users for emails
    const usersMap = new Map()
    if (userIdsArray.length > 0) {
      const { data: users } = await admin
        .from('users')
        .select('id, email')
        .in('id', userIdsArray)
      
      users?.forEach((user: any) => {
        usersMap.set(user.id, user)
      })
    }

    // Fetch safety alert notifications for these reports so we can attach acknowledgement status
    const warningMap = new Map<string, any>()
    if (userIdsArray.length > 0 && reportIdsArray.length > 0) {
      const { data: safetyNotifications } = await admin
        .from('notifications')
        .select('id, user_id, type, metadata')
        .eq('type', 'safety_alert')
        .in('user_id', userIdsArray)

      safetyNotifications?.forEach((notif: any) => {
        const metadata = notif.metadata || {}
        if (!metadata) return
        if (metadata.action !== 'warn') return
        if (!metadata.report_id) return
        if (!reportIds.has(metadata.report_id)) return

        // For each report, track the latest warning notification (by created_at if available)
        const existing = warningMap.get(metadata.report_id)
        if (!existing) {
          warningMap.set(metadata.report_id, notif)
        } else if (notif.created_at && existing.created_at && new Date(notif.created_at) > new Date(existing.created_at)) {
          warningMap.set(metadata.report_id, notif)
        }
      })
    }

    // Enrich reports with profile data, emails, and warning acknowledgement info
    const enrichedReports = reports?.map((report: any) => {
      const reporterProfile = profilesMap.get(report.reporter_id)
      const targetProfile = profilesMap.get(report.target_user_id)
      const reporterUser = usersMap.get(report.reporter_id)
      const targetUser = usersMap.get(report.target_user_id)

      const warningNotification = warningMap.get(report.id)
      const warningMetadata = warningNotification?.metadata || {}
      
      return {
        ...report,
        reporter: reporterProfile ? {
          user_id: report.reporter_id,
          first_name: reporterProfile.first_name,
          last_name: reporterProfile.last_name,
          email: reporterUser?.email || ''
        } : {
          user_id: report.reporter_id,
          first_name: '',
          last_name: '',
          email: reporterUser?.email || ''
        },
        target: targetProfile ? {
          user_id: report.target_user_id,
          first_name: targetProfile.first_name,
          last_name: targetProfile.last_name,
          email: targetUser?.email || ''
        } : {
          user_id: report.target_user_id,
          first_name: '',
          last_name: '',
          email: targetUser?.email || ''
        },
        warning_notification: warningNotification
          ? {
              id: warningNotification.id,
              acknowledged_checkbox: Boolean(warningMetadata.acknowledged_checkbox),
              acknowledged_continue: Boolean(warningMetadata.acknowledged_continue),
              acknowledged_at: warningMetadata.acknowledged_at || null,
            }
          : null,
      }
    }) || []

    return NextResponse.json({
      reports: enrichedReports,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    safeLogger.error('[Admin] Reports list error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const body = await request.json()
    const { reportId, status, actionTaken } = body

    if (!reportId || !status) {
      return NextResponse.json(
        { error: 'reportId and status are required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Update report status
    const { data: report, error: updateError } = await admin
      .from('reports')
      .update({
        status,
        admin_id: user!.id,
        action_taken: actionTaken || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single()

    if (updateError) {
      safeLogger.error('[Admin] Failed to update report', updateError)
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 }
      )
    }

    await logAdminAction(user!.id, 'update_report', 'report', reportId, {
      action: `Updated report status to ${status}`,
      report_id: reportId,
      status,
      action_taken: actionTaken,
      role: adminRecord!.role
    })

    return NextResponse.json({
      success: true,
      report
    })
  } catch (error) {
    safeLogger.error('[Admin] Report update error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const body = await request.json()
    const { action, reportId, userId, message } = body

    if (!action || !reportId) {
      return NextResponse.json(
        { error: 'action and reportId are required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Get report details
    const { data: report } = await admin
      .from('reports')
      .select('target_user_id, reporter_id')
      .eq('id', reportId)
      .single()

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const targetUserId = userId || report.target_user_id

    if (action === 'warn') {
      // Send warning notification to user
      await createNotificationsForUsers(
        [targetUserId],
        'safety_alert',
        'Warning from Admin',
        message || 'You have received a warning for violating community guidelines. Please review our safety policy.',
        {
          report_id: reportId,
          action: 'warn'
        }
      )

      // Update report
      await admin
        .from('reports')
        .update({
          status: 'actioned',
          admin_id: user!.id,
          action_taken: `Warning sent: ${message || 'No message provided'}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)

      await logAdminAction(user!.id, 'warn_user', 'user', targetUserId, {
        action: 'Admin warned user',
        report_id: reportId,
        message,
        role: adminRecord!.role
      })

      return NextResponse.json({
        success: true,
        message: 'Warning sent to user'
      })
    }

    if (action === 'ban') {
      // Suspend user account
      await admin
        .from('users')
        .update({ is_active: false })
        .eq('id', targetUserId)

      // Send notification
      await createNotificationsForUsers(
        [targetUserId],
        'safety_alert',
        'Account Suspended',
        message || 'Your account has been suspended for violating community guidelines.',
        {
          report_id: reportId,
          action: 'ban'
        }
      )

      // Update report
      await admin
        .from('reports')
        .update({
          status: 'actioned',
          admin_id: user!.id,
          action_taken: `User banned: ${message || 'No message provided'}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)

      await logAdminAction(user!.id, 'ban_user', 'user', targetUserId, {
        action: 'Admin banned user',
        report_id: reportId,
        message,
        role: adminRecord!.role
      })

      return NextResponse.json({
        success: true,
        message: 'User account suspended'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    safeLogger.error('[Admin] Report action error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

