import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { isSuperAdmin } from '@/lib/auth/roles'
import {
  toLabWishAdminRow,
  withLabWishAuthor,
} from '@/lib/lab/admin-serialization'
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
    const focusGroup = searchParams.get('focus_group') === 'true'
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '100', 10) || 100,
      200
    )
    const offset = Math.max(
      parseInt(searchParams.get('offset') || '0', 10) || 0,
      0
    )

    const admin = createAdminClient()
    const universityId = adminCheck.adminRecord?.university_id

    let query = admin
      .from('lab_wishes')
      .select(
        `
 id,
 user_id,
 university_id,
 title,
 body,
 status,
 merged_into_id,
 focus_group_opt_in,
 vote_count,
 use_this_count,
 created_at,
 updated_at
 `
      )
      .is('merged_into_id', null)
      .order('use_this_count', { ascending: false })
      .order('vote_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (universityId) {
      query = query.eq('university_id', universityId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (focusGroup) {
      query = query.eq('focus_group_opt_in', true)
    }

    const { data: wishes, error } = await query
    if (error) {
      safeLogger.error('[Admin DomuLab] List failed', { error })
      return NextResponse.json(
        { error: 'Failed to fetch wishes' },
        { status: 500 }
      )
    }

    const canViewAuthors = adminCheck.user
      ? await isSuperAdmin(adminCheck.user.id)
      : false

    let userMap = new Map<string, { email: string; name: string }>()

    if (canViewAuthors) {
      const userIds = [...new Set((wishes ?? []).map(w => w.user_id))]
      if (userIds.length > 0) {
        const { data: users } = await admin
          .from('users')
          .select('id, email')
          .in('id', userIds)
        const { data: profiles } = await admin
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds)

        for (const u of users ?? []) {
          const profile = profiles?.find(p => p.user_id === u.id)
          const name =
            [profile?.first_name, profile?.last_name]
              .filter(Boolean)
              .join(' ') || 'Student'
          userMap.set(u.id, { email: u.email, name })
        }
      }
    }

    const wishIds = (wishes ?? []).map(w => w.id)
    const reportCountMap = new Map<string, number>()
    if (wishIds.length > 0) {
      const { data: reportRows } = await admin
        .from('lab_wish_reports')
        .select('wish_id')
        .in('wish_id', wishIds)
      for (const row of reportRows ?? []) {
        reportCountMap.set(
          row.wish_id,
          (reportCountMap.get(row.wish_id) ?? 0) + 1
        )
      }
    }

    const rows = (wishes ?? []).map(w => {
      const base = toLabWishAdminRow(w, reportCountMap.get(w.id) ?? 0)
      if (!canViewAuthors) return base
      return withLabWishAuthor(base, w, userMap.get(w.user_id) ?? null)
    })

    return NextResponse.json({
      wishes: rows,
      total: rows.length,
      can_view_authors: canViewAuthors,
    })
  } catch (error) {
    safeLogger.error('[Admin DomuLab] GET error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch wishes' },
      { status: 500 }
    )
  }
}
