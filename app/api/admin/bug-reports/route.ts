import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { isValidBugReportCategory, isValidBugReportStatus } from '@/lib/bugs/categories'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status },
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 200)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)

    const admin = createAdminClient()

    let query = admin
      .from('bug_reports')
      .select(
        `
        id,
        user_id,
        category,
        description,
        status,
        admin_notes,
        admin_id,
        consent_at,
        created_at,
        updated_at
      `,
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && isValidBugReportStatus(status)) {
      query = query.eq('status', status)
    }
    if (category && isValidBugReportCategory(category)) {
      query = query.eq('category', category)
    }

    const { data: reports, error } = await query
    if (error) {
      safeLogger.error('[Admin BugReports] Failed to fetch', error)
      return NextResponse.json({ error: 'Failed to fetch bug reports' }, { status: 500 })
    }

    let countQuery = admin.from('bug_reports').select('id', { count: 'exact', head: true })
    if (status && isValidBugReportStatus(status)) countQuery = countQuery.eq('status', status)
    if (category && isValidBugReportCategory(category)) countQuery = countQuery.eq('category', category)
    const { count } = await countQuery

    const userIds = Array.from(new Set((reports || []).map((r) => r.user_id).filter(Boolean)))
    const profilesMap = new Map<string, { user_id: string; first_name: string; last_name: string }>()
    const emailsMap = new Map<string, string>()

    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds)

      profiles?.forEach((p) => profilesMap.set(p.user_id, p))

      const { data: users } = await admin.from('users').select('id, email').in('id', userIds)
      users?.forEach((u: { id: string; email: string }) => emailsMap.set(u.id, u.email))
    }

    const enriched = (reports || []).map((report) => {
      const profile = profilesMap.get(report.user_id)
      return {
        ...report,
        user: profile
          ? {
              user_id: report.user_id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: emailsMap.get(report.user_id) || '',
            }
          : {
              user_id: report.user_id,
              first_name: '',
              last_name: '',
              email: emailsMap.get(report.user_id) || '',
            },
      }
    })

    return NextResponse.json({
      reports: enriched,
      total: count ?? enriched.length,
      limit,
      offset,
    })
  } catch (error) {
    safeLogger.error('[Admin BugReports] GET error', { error })
    return NextResponse.json({ error: 'Failed to fetch bug reports' }, { status: 500 })
  }
}
