import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { checkUserVerificationStatus } from '@/lib/auth/verification-check'
import {
  loadVerificationNudgeState,
  recordNudgeShown,
  recordNudgeSkipped,
  recordNudgeVerified,
  shouldShowVerificationNudge,
} from '@/lib/verification/nudge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const

const PostBodySchema = z.object({
  action: z.enum(['shown', 'skipped', 'verified_uni', 'verified_persona']),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: NO_STORE_HEADERS }
      )
    }

    const admin = createServiceClient()
    const [status, row] = await Promise.all([
      checkUserVerificationStatus(user),
      loadVerificationNudgeState(admin, user.id),
    ])

    const shouldShow = shouldShowVerificationNudge({
      isVerified: status.isVerified,
      row,
    })

    return NextResponse.json(
      {
        shouldShow,
        isVerified: status.isVerified,
        personaVerified: status.personaVerified,
        studentVerified: status.studentVerified,
        nextEligibleAt: row?.next_eligible_at ?? null,
        cadenceStage: row?.cadence_stage ?? 'initial',
        showCount: row?.show_count ?? 0,
      },
      { headers: NO_STORE_HEADERS }
    )
  } catch (error) {
    console.error('[verification/nudge GET]', error)
    return NextResponse.json(
      { error: 'Failed to load nudge state' },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: NO_STORE_HEADERS }
      )
    }

    let body: z.infer<typeof PostBodySchema>
    try {
      body = PostBodySchema.parse(await request.json())
    } catch {
      return NextResponse.json(
        { error: 'Invalid body' },
        { status: 400, headers: NO_STORE_HEADERS }
      )
    }

    const admin = createServiceClient()
    const existing = await loadVerificationNudgeState(admin, user.id)

    let row
    if (body.action === 'shown') {
      row = await recordNudgeShown(admin, user.id, existing)
    } else if (body.action === 'skipped') {
      row = await recordNudgeSkipped(admin, user.id, existing)
      try {
        const { recordFunnelMilestone } = await import(
          '@/lib/admin/registration-funnel-track'
        )
        await recordFunnelMilestone(user.id, 'verification_decision', {
          source: 'api/verification/nudge',
          metadata: { method: 'skipped' },
          client: admin as any,
        })
      } catch {
        // non-fatal
      }
    } else {
      row = await recordNudgeVerified(admin, user.id, body.action, existing)
      try {
        const { recordFunnelMilestone } = await import(
          '@/lib/admin/registration-funnel-track'
        )
        await recordFunnelMilestone(user.id, 'verification_decision', {
          source: 'api/verification/nudge',
          metadata: {
            method: body.action === 'verified_persona' ? 'persona' : 'uni_email',
          },
          client: admin as any,
        })
      } catch {
        // non-fatal
      }
    }

    const status = await checkUserVerificationStatus(user)
    const shouldShow = shouldShowVerificationNudge({
      isVerified: status.isVerified,
      row,
    })

    return NextResponse.json(
      {
        ok: true,
        shouldShow,
        isVerified: status.isVerified,
        nextEligibleAt: row.next_eligible_at,
        cadenceStage: row.cadence_stage,
        showCount: row.show_count,
        lastAction: row.last_action,
      },
      { headers: NO_STORE_HEADERS }
    )
  } catch (error) {
    console.error('[verification/nudge POST]', error)
    return NextResponse.json(
      { error: 'Failed to update nudge state' },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }
}
