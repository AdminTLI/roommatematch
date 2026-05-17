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

    const admin = createAdminClient()
    const { data, error } = await admin.rpc('get_maintenance_job_runs', {
      p_limit: limit,
      p_offset: offset,
    })

    if (error) {
      safeLogger.error('[Admin] Maintenance runs fetch error', error)
      return NextResponse.json(
        { error: 'Failed to fetch maintenance runs', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ runs: data ?? [] })
  } catch (error) {
    safeLogger.error('[Admin] Maintenance runs error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
