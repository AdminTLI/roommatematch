import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { detectAllAnomalies, detectVerificationAnomalies, detectMatchingAnomalies, detectJobProcessingAnomalies } from '@/lib/analytics/anomaly-detection'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/admin/metrics/anomalies
 * Get detected anomalies for dashboard
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
    const type = url.searchParams.get('type') // 'verification', 'matching', 'job_processing', or 'all'

    let anomalies = []

    if (type === 'verification') {
      anomalies = await detectVerificationAnomalies(periodHours)
    } else if (type === 'matching') {
      anomalies = await detectMatchingAnomalies(periodHours)
    } else if (type === 'job_processing') {
      anomalies = await detectJobProcessingAnomalies(periodHours)
    } else {
      // Detect all anomalies
      const results = await detectAllAnomalies(periodHours)
      anomalies = results
    }

    return NextResponse.json({
      success: true,
      data: anomalies
    })
  } catch (error) {
    safeLogger.error('Error fetching anomalies', { error })
    return NextResponse.json(
      { error: 'Failed to fetch anomalies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/metrics/anomalies
 * Trigger anomaly detection manually
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

    // Get period from request body (default: 24 hours)
    const body = await request.json().catch(() => ({}))
    const periodHours = body.period || 24

    // Detect all anomalies
    const anomalies = await detectAllAnomalies(periodHours)

    return NextResponse.json({
      success: true,
      data: {
        total: anomalies.length,
        critical: anomalies.filter(a => a.severity === 'critical').length,
        high: anomalies.filter(a => a.severity === 'high').length,
        medium: anomalies.filter(a => a.severity === 'medium').length,
        low: anomalies.filter(a => a.severity === 'low').length,
        anomalies
      }
    })
  } catch (error) {
    safeLogger.error('Error detecting anomalies', { error })
    return NextResponse.json(
      { error: 'Failed to detect anomalies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

