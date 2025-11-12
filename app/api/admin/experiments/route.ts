import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getExperimentMetrics, getActiveExperiments } from '@/lib/matching/experiments'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/admin/experiments
 * Get active experiments and their metrics
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

    // Get university ID from query params or admin data
    const url = new URL(request.url)
    const universityId = url.searchParams.get('university_id') || adminData.university_id
    const experimentId = url.searchParams.get('experiment_id')

    if (experimentId) {
      // Get metrics for specific experiment
      const metrics = await getExperimentMetrics(experimentId)

      return NextResponse.json({
        success: true,
        data: metrics
      })
    } else {
      // Get all active experiments
      const experiments = await getActiveExperiments(user.id, universityId)

      // Get metrics for each experiment
      const experimentsWithMetrics = await Promise.all(
        experiments.map(async (experiment) => {
          const metrics = await getExperimentMetrics(experiment.id)
          return {
            ...experiment,
            metrics
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: experimentsWithMetrics
      })
    }
  } catch (error) {
    safeLogger.error('Error fetching experiments', { error })
    return NextResponse.json(
      { error: 'Failed to fetch experiments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/experiments
 * Create a new experiment (admin only)
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

    // Parse request body
    const body = await request.json()
    const {
      experiment_name,
      experiment_description,
      variants,
      traffic_split,
      assignment_method,
      university_id,
      user_segments,
      filter_criteria,
      start_date,
      end_date,
      status
    } = body

    // Validate required fields
    if (!experiment_name || !variants || !traffic_split) {
      return NextResponse.json(
        { error: 'Missing required fields: experiment_name, variants, traffic_split' },
        { status: 400 }
      )
    }

    // Validate traffic split sums to 100
    const totalSplit = Object.values(traffic_split).reduce((sum: number, val: any) => sum + (val || 0), 0)
    if (Math.abs(totalSplit - 100) > 0.01) {
      return NextResponse.json(
        { error: 'Traffic split must sum to 100' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const adminSupabase = createClient(supabaseUrl, supabaseKey)

    // Create experiment
    const { data: experiment, error: experimentError } = await adminSupabase
      .from('matching_experiments')
      .insert({
        experiment_name,
        experiment_description,
        variants,
        traffic_split,
        assignment_method: assignment_method || 'random',
        university_id: university_id || adminData.university_id,
        user_segments,
        filter_criteria,
        start_date,
        end_date,
        status: status || 'draft',
        total_users: 0,
        users_by_variant: {}
      })
      .select()
      .single()

    if (experimentError) {
      safeLogger.error('Failed to create experiment', { error: experimentError })
      return NextResponse.json(
        { error: 'Failed to create experiment', details: experimentError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: experiment
    }, { status: 201 })
  } catch (error) {
    safeLogger.error('Error creating experiment', { error })
    return NextResponse.json(
      { error: 'Failed to create experiment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

