import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { createNotificationsForUsers } from '@/lib/notifications/create'
import { CHAT_REPORT_CATEGORY_LABELS, isValidChatReportCategory } from '@/lib/chat/report-categories'

type ChatContextRow = {
  id: string
  user_id: string
  content: string
  created_at: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimitKey = getUserRateLimitKey('report', user.id)
    const rateLimitResult = await checkRateLimit('report', rateLimitKey)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many reports. Please wait before submitting another.' },
        { status: 429 },
      )
    }

    const body = await request.json()
    const {
      target_user_id,
      message_id,
      chat_id,
      category,
      details,
      consent_read_recent_messages,
    } = body as {
      target_user_id?: string
      message_id?: string
      chat_id?: string
      category?: string
      details?: string
      consent_read_recent_messages?: boolean
    }

    if (!target_user_id || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isValidChatReportCategory(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    if (consent_read_recent_messages !== true) {
      return NextResponse.json(
        { error: 'You must agree to let moderators review recent messages to submit a report.' },
        { status: 400 },
      )
    }

    if (!chat_id || typeof chat_id !== 'string') {
      return NextResponse.json({ error: 'Chat context is required for this report.' }, { status: 400 })
    }

    const admin = await createAdminClient()

    const { data: membership, error: memError } = await admin
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chat_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (memError || !membership) {
      return NextResponse.json({ error: 'You are not a member of this chat.' }, { status: 403 })
    }

    let resolvedChatId = chat_id

    if (message_id) {
      const { data: msg, error: msgErr } = await admin
        .from('messages')
        .select('id, chat_id, user_id')
        .eq('id', message_id)
        .maybeSingle()

      if (msgErr || !msg) {
        return NextResponse.json({ error: 'Message not found.' }, { status: 404 })
      }

      if (msg.chat_id !== chat_id) {
        return NextResponse.json({ error: 'Message does not belong to this chat.' }, { status: 400 })
      }

      if (msg.user_id !== target_user_id) {
        return NextResponse.json(
          { error: 'Reported user must be the sender of the selected message.' },
          { status: 400 },
        )
      }

      resolvedChatId = msg.chat_id
    }

    const { data: recentRaw, error: recentErr } = await admin
      .from('messages')
      .select('id, user_id, content, created_at')
      .eq('chat_id', resolvedChatId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentErr) {
      safeLogger.error('[Report] Failed to load chat context', recentErr)
      return NextResponse.json({ error: 'Failed to load chat context' }, { status: 500 })
    }

    const rows = (recentRaw || []) as ChatContextRow[]
    const chat_context_snapshot = [...rows].reverse().map((m) => ({
      id: m.id,
      user_id: m.user_id,
      content: m.content,
      created_at: m.created_at,
      is_reporter: m.user_id === user.id,
    }))

    const consentAt = new Date().toISOString()

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: recentReports } = await admin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('target_user_id', target_user_id)
      .gte('created_at', oneDayAgo)

    const autoBlocked = (recentReports || 0) >= 2

    const { data: report, error: reportError } = await admin
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_user_id,
        message_id: message_id || null,
        category,
        reason: category,
        details: typeof details === 'string' && details.trim() ? details.trim() : null,
        status: 'open',
        auto_blocked: autoBlocked,
        consent_read_recent_messages: true,
        consent_read_recent_messages_at: consentAt,
        chat_context_snapshot,
      })
      .select()
      .single()

    if (reportError) {
      safeLogger.error('[Report] Failed to create report', reportError)
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
    }

    if (autoBlocked) {
      await admin
        .from('match_blocklist')
        .insert({
          user_id: user.id,
          blocked_user_id: target_user_id,
        })
        .catch(() => {})

      safeLogger.warn('[Report] Auto-blocked user due to repeated reports', {
        targetUserId: target_user_id,
        reportCount: (recentReports || 0) + 1,
      })
    }

    try {
      const { data: admins } = await admin.from('admins').select('user_id')

      if (admins && admins.length > 0) {
        const adminUserIds = admins.map((a) => a.user_id)

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

        const categoryLabel = CHAT_REPORT_CATEGORY_LABELS[category] || category

        await createNotificationsForUsers(
          adminUserIds,
          'system_announcement',
          'New User Report',
          `${reporterName} reported ${targetName} for ${categoryLabel}.${autoBlocked ? ' User auto-blocked due to repeated reports.' : ''}`,
          {
            report_id: report.id,
            reporter_id: user.id,
            target_user_id,
            category,
            auto_blocked: autoBlocked,
            link: `/admin/reports`,
            type: 'user_report',
          },
        )

        safeLogger.info('[Report] Notified admins', {
          reportId: report.id,
          adminCount: adminUserIds.length,
        })
      }
    } catch (notifyError) {
      safeLogger.error('[Report] Failed to notify admins', notifyError)
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      autoBlocked,
    })
  } catch (error) {
    safeLogger.error('[Report] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
