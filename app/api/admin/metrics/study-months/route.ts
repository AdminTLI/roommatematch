import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkStudyMonthCompleteness, getUsersWithMissingStudyMonths } from '@/lib/monitoring/alerts'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/admin/metrics/study-months
 * Get study month completeness metrics
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

    // Get study month completeness metrics
    const alert = await checkStudyMonthCompleteness(10)

    if (!alert) {
      return NextResponse.json({
        success: true,
        data: {
          totalUsers: 0,
          usersWithMissingMonths: 0,
          percentage: 0,
          shouldAlert: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: alert.totalUsers,
        usersWithMissingMonths: alert.usersWithMissingMonths,
        percentage: alert.percentage,
        shouldAlert: alert.shouldAlert
      }
    })
  } catch (error) {
    safeLogger.error('Error fetching study month metrics', { error })
    return NextResponse.json(
      { error: 'Failed to fetch study month metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

