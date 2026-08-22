import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)
    const action = searchParams.get('action')
    const entityType = searchParams.get('entity_type')
    const adminUserId = searchParams.get('admin_user_id')
    const search = searchParams.get('search')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const admin = createAdminClient()
    let query = admin
      .from('admin_actions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (action) query = query.eq('action', action)
    if (entityType) query = query.eq('entity_type', entityType)
    if (adminUserId) query = query.eq('admin_user_id', adminUserId)
    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)
    if (search) {
      query = query.or(
        `action.ilike.%${search}%,entity_type.ilike.%${search}%,entity_id.ilike.%${search}%`
      )
    }

    const { data, error, count } = await query

    if (error) {
      safeLogger.error('[Admin] Audit log fetch error', error)
      return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 })
    }

    return NextResponse.json({
      actions: data ?? [],
      pagination: {
        limit,
        offset,
        total: count ?? 0,
        hasMore: (count ?? 0) > offset + limit,
      },
    })
  } catch (error) {
    safeLogger.error('[Admin] Audit log error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
