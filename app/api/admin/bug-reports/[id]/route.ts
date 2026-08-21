import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { isValidBugReportStatus } from '@/lib/bugs/categories'
import { safeLogger } from '@/lib/utils/logger'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const adminCheck = await requireAdmin(request, false)
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status },
      )
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: report, error } = await admin
      .from('bug_reports')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      safeLogger.error('[Admin BugReports] Detail fetch failed', error)
      return NextResponse.json({ error: 'Failed to fetch bug report' }, { status: 500 })
    }
    if (!report) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name')
      .eq('user_id', report.user_id)
      .maybeSingle()

    const { data: userRow } = await admin
      .from('users')
      .select('id, email')
      .eq('id', report.user_id)
      .maybeSingle()

    return NextResponse.json({
      report: {
        ...report,
        user: {
          user_id: report.user_id,
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          email: userRow?.email || '',
        },
      },
    })
  } catch (error) {
    safeLogger.error('[Admin BugReports] GET [id] error', { error })
    return NextResponse.json({ error: 'Failed to fetch bug report' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const adminCheck = await requireAdmin(request, false)
    if (!adminCheck.ok || !adminCheck.user) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status || 403 },
      )
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      admin_id: adminCheck.user.id,
    }

    if (body.status !== undefined) {
      if (typeof body.status !== 'string' || !isValidBugReportStatus(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updates.status = body.status
    }

    if (body.admin_notes !== undefined) {
      if (body.admin_notes !== null && typeof body.admin_notes !== 'string') {
        return NextResponse.json({ error: 'admin_notes must be a string' }, { status: 400 })
      }
      updates.admin_notes =
        typeof body.admin_notes === 'string' ? body.admin_notes.trim().slice(0, 5000) : null
    }

    if (updates.status === undefined && updates.admin_notes === undefined) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('bug_reports')
      .update(updates)
      .eq('id', id)
      .select('id, status, admin_notes, admin_id, updated_at')
      .maybeSingle()

    if (error) {
      safeLogger.error('[Admin BugReports] PATCH failed', error)
      return NextResponse.json({ error: 'Failed to update bug report' }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ report: data })
  } catch (error) {
    safeLogger.error('[Admin BugReports] PATCH error', { error })
    return NextResponse.json({ error: 'Failed to update bug report' }, { status: 500 })
  }
}
