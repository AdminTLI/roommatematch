import { NextRequest, NextResponse } from 'next/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import { requireAdminResponse } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminResponse(request, true)
  if (authError) {
    return authError
  }

  try {
    const repo = await getMatchRepo()
    
    // Use set-based SQL UPDATE to expire all suggestions that are pending/accepted and past expiry
    // This is much more efficient than fetching and updating individually
    const changed = await repo.expireAllOldSuggestions()
    
    safeLogger.info(`[Suggestions Expire] Expired ${changed} suggestions`)
    
    return NextResponse.json({ ok: true, changed })
    
  } catch (error) {
    safeLogger.error('Error expiring suggestions', error)
    return NextResponse.json(
      { error: 'Failed to expire suggestions' },
      { status: 500 }
    )
  }
}
