import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'
import {
  findUniversityEmailOccupantIds,
  normalizeUniversityEmail,
  releaseUniversityEmailFromHolder,
} from '@/lib/university-email/claims'

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireSuperAdmin(request, false)
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Super admin access required' },
        { status: adminCheck.status }
      )
    }

    if (!adminCheck.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: {
      holderUserId?: string
      emailNormalized?: string
      flagId?: string | null
      reason?: string | null
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const holderUserId =
      typeof body.holderUserId === 'string' ? body.holderUserId.trim() : ''
    const emailNormalized =
      typeof body.emailNormalized === 'string'
        ? normalizeUniversityEmail(body.emailNormalized)
        : ''
    const flagId = typeof body.flagId === 'string' ? body.flagId.trim() : null
    const reason = typeof body.reason === 'string' ? body.reason.trim() : null

    if (!holderUserId || !emailNormalized) {
      return NextResponse.json(
        { error: 'holderUserId and emailNormalized are required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const result = await releaseUniversityEmailFromHolder(admin, {
      holderUserId,
      emailNormalized,
      releasedBy: adminCheck.user.id,
      reason,
      flagId,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const remainingHolderIds = (
      await findUniversityEmailOccupantIds(admin, emailNormalized)
    ).filter((id) => id !== holderUserId)

    await logAdminAction(
      adminCheck.user.id,
      'release_university_email',
      'user',
      holderUserId,
      {
        email_normalized: emailNormalized,
        flag_id: flagId,
        reason,
        remaining_holder_ids: remainingHolderIds,
      }
    )

    return NextResponse.json({
      ok: true,
      remainingHolderCount: remainingHolderIds.length,
    })
  } catch (error) {
    safeLogger.error('[Admin] Release university email error', { error })
    return NextResponse.json(
      { error: 'Failed to release university email' },
      { status: 500 }
    )
  }
}
