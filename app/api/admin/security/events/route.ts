import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecentSecurityEvents } from '@/lib/security/monitoring'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/admin/security/events
 * Get recent security events
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

    // Get limit from query params (default: 50)
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // Get recent security events
    const events = await getRecentSecurityEvents(limit)

    return NextResponse.json({
      success: true,
      data: events
    })
  } catch (error) {
    safeLogger.error('Error fetching security events', { error })
    return NextResponse.json(
      { error: 'Failed to fetch security events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

