import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireSuperAdmin(request, false)
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Super admin access required' },
        { status: adminCheck.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const wishId = searchParams.get('wish_id')
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '100', 10) || 100,
      200
    )
    const offset = Math.max(
      parseInt(searchParams.get('offset') || '0', 10) || 0,
      0
    )

    const admin = createAdminClient()

    let query = admin
      .from('lab_wish_reports')
      .select('id, wish_id, reporter_id, reason, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (wishId) {
      query = query.eq('wish_id', wishId)
    }

    const { data: reports, error, count } = await query
    if (error) {
      safeLogger.error('[Admin DomuLab] Reports list failed', { error })
      return NextResponse.json(
        { error: 'Failed to fetch lab reports' },
        { status: 500 }
      )
    }

    const wishIds = [...new Set((reports ?? []).map(r => r.wish_id))]
    const reporterIds = [...new Set((reports ?? []).map(r => r.reporter_id))]

    const wishMap = new Map<
      string,
      { id: string; title: string; body: string; status: string }
    >()
    if (wishIds.length > 0) {
      const { data: wishes } = await admin
        .from('lab_wishes')
        .select('id, title, body, status')
        .in('id', wishIds)
      for (const w of wishes ?? []) {
        wishMap.set(w.id, w)
      }
    }

    const reporterMap = new Map<string, { email: string; name: string }>()
    if (reporterIds.length > 0) {
      const { data: users } = await admin
        .from('users')
        .select('id, email')
        .in('id', reporterIds)
      const { data: profiles } = await admin
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', reporterIds)

      for (const u of users ?? []) {
        const profile = profiles?.find(p => p.user_id === u.id)
        const name =
          [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
          'Student'
        reporterMap.set(u.id, { email: u.email, name })
      }
    }

    const rows = (reports ?? []).map(r => {
      const wish = wishMap.get(r.wish_id)
      const reporter = reporterMap.get(r.reporter_id)
      return {
        id: r.id,
        wish_id: r.wish_id,
        reason: r.reason,
        created_at: r.created_at,
        wish_title: wish?.title ?? 'Deleted wish',
        wish_body: wish?.body ?? '',
        wish_status: wish?.status ?? null,
        reporter_name: reporter?.name ?? 'Unknown',
        reporter_email: reporter?.email ?? null,
      }
    })

    return NextResponse.json({
      reports: rows,
      total: count ?? rows.length,
    })
  } catch (error) {
    safeLogger.error('[Admin DomuLab] Reports GET error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch lab reports' },
      { status: 500 }
    )
  }
}
