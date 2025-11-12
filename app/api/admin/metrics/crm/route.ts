import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCRMMetrics, storeCRMMetrics, calculateCRMMetrics } from '@/lib/analytics/crm-metrics'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/admin/metrics/crm
 * Get CRM metrics for dashboard
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

    // Get period from query params (default: 30 days)
    const url = new URL(request.url)
    const periodDays = parseInt(url.searchParams.get('period') || '30')
    const universityId = url.searchParams.get('university_id') || adminData.university_id

    // Get CRM metrics
    const metrics = await getCRMMetrics(universityId, periodDays)

    if (!metrics) {
      return NextResponse.json(
        { error: 'Failed to fetch CRM metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    safeLogger.error('Error fetching CRM metrics', { error })
    return NextResponse.json(
      { error: 'Failed to fetch CRM metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/metrics/crm
 * Calculate and store CRM metrics
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

    // Get period from request body (default: 30 days)
    const body = await request.json().catch(() => ({}))
    const periodDays = body.period || 30
    const universityId = body.university_id || adminData.university_id

    // Calculate and store CRM metrics
    const metrics = await calculateCRMMetrics(universityId, periodDays)
    const stored = await storeCRMMetrics(metrics, universityId)

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
    safeLogger.error('Error calculating CRM metrics', { error })
    return NextResponse.json(
      { error: 'Failed to calculate CRM metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

