import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
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
    const source = searchParams.get('source')
    const severity = searchParams.get('severity')
    const service = searchParams.get('service')
    const search = searchParams.get('search')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const admin = createAdminClient()
    let query = admin
      .from('system_ops_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (source) query = query.eq('source', source)
    if (severity) query = query.eq('severity', severity)
    if (service) query = query.eq('service', service)
    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)
    if (search) {
      query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      safeLogger.error('[Admin] Ops log fetch error', error)
      return NextResponse.json({ error: 'Failed to fetch ops log' }, { status: 500 })
    }

    return NextResponse.json({
      events: data ?? [],
      pagination: {
        limit,
        offset,
        total: count ?? 0,
        hasMore: (count ?? 0) > offset + limit,
      },
    })
  } catch (error) {
    safeLogger.error('[Admin] Ops log error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
