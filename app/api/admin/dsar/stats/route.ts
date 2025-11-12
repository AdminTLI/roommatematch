import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdminResponse } from '@/lib/auth/admin'
import { getDSARStatistics } from '@/lib/privacy/dsar-automation'

/**
 * GET /api/admin/dsar/stats
 * 
 * Get DSAR statistics (admin only)
 */
export async function GET(req: NextRequest) {
  const authError = await requireAdminResponse(req, true)
  if (authError) {
    return authError
  }

  try {
    const stats = await getDSARStatistics()

    return NextResponse.json({
      success: true,
      ...stats
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch DSAR statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

