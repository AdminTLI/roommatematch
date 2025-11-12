import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserDSARRequests } from '@/lib/privacy/dsar-tracker'

/**
 * GET /api/privacy/requests
 * 
 * Get all DSAR requests for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requests = await getUserDSARRequests(user.id)

    return NextResponse.json({
      success: true,
      requests: requests.map(r => ({
        id: r.id,
        request_type: r.request_type,
        status: r.status,
        requested_at: r.requested_at,
        sla_deadline: r.sla_deadline,
        completed_at: r.completed_at,
        processing_metadata: r.processing_metadata
      }))
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch DSAR requests',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

