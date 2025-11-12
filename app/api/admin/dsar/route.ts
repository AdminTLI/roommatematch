import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdminResponse } from '@/lib/auth/admin'

/**
 * GET /api/admin/dsar
 * 
 * Get all DSAR requests (admin only)
 */
export async function GET(req: NextRequest) {
  const authError = await requireAdminResponse(req, true)
  if (authError) {
    return authError
  }

  try {
    const supabase = await createClient()
    
    const { data: requests, error } = await supabase
      .from('dsar_requests')
      .select('*')
      .order('requested_at', { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      requests: requests || []
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch DSAR requests',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

