import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSecurityMetrics } from '@/lib/security/monitoring'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/admin/security/metrics
 * Get security metrics for dashboard
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, role, university_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get period from query params (default: 24 hours)
    const url = new URL(request.url)
    const periodHours = parseInt(url.searchParams.get('period') || '24')

    // Get security metrics
    const metrics = await getSecurityMetrics(periodHours)

    return NextResponse.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    safeLogger.error('Error fetching security metrics', { error })
    return NextResponse.json(
      { error: 'Failed to fetch security metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

