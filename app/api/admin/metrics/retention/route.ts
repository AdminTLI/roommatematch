import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateCohortRetentionMetrics, storeCohortRetentionMetrics } from '@/lib/analytics/supply-demand'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/admin/metrics/retention
 * Get cohort retention metrics for dashboard
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

    // Get cohort date from query params
    const url = new URL(request.url)
    const cohortDate = url.searchParams.get('cohort_date')
    const universityId = url.searchParams.get('university_id') || adminData.university_id

    if (!cohortDate) {
      return NextResponse.json(
        { error: 'cohort_date parameter is required' },
        { status: 400 }
      )
    }

    // Calculate cohort retention metrics
    const metrics = await calculateCohortRetentionMetrics(cohortDate, universityId)

    return NextResponse.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    safeLogger.error('Error fetching cohort retention metrics', { error })
    return NextResponse.json(
      { error: 'Failed to fetch cohort retention metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/metrics/retention
 * Calculate and store cohort retention metrics
 */
export async function POST(request: Request) {
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

    // Get cohort date from request body
    const body = await request.json().catch(() => ({}))
    const cohortDate = body.cohort_date
    const universityId = body.university_id || adminData.university_id

    if (!cohortDate) {
      return NextResponse.json(
        { error: 'cohort_date is required' },
        { status: 400 }
      )
    }

    // Calculate and store cohort retention metrics
    const metrics = await calculateCohortRetentionMetrics(cohortDate, universityId)
    const stored = await storeCohortRetentionMetrics(metrics, universityId)

    if (!stored) {
      return NextResponse.json(
        { error: 'Failed to store metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    safeLogger.error('Error calculating cohort retention metrics', { error })
    return NextResponse.json(
      { error: 'Failed to calculate cohort retention metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

