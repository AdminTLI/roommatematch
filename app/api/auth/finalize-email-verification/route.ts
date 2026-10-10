import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAcademicEmail } from '@/lib/university-email/academic-email'
import { attachVerifiedUniversityEmail } from '@/lib/university-email/claims'
import { clearVerificationCache } from '@/lib/auth/verification-check'

/**
 * After login email OTP succeeds, auto-verify academic signup emails
 * so the user gets the verified student badge without a second OTP.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = user.email?.trim()
  const { recordFunnelMilestone } = await import('@/lib/admin/registration-funnel-track')

  // Always mark confirmation email verified when this finalize endpoint is hit
  // (client calls it only after successful OTP).
  await recordFunnelMilestone(user.id, 'email_verified', {
    source: 'api/auth/finalize-email-verification',
  })

  if (!email) {
    return NextResponse.json({ ok: true, studentVerified: false })
  }

  if (!isAcademicEmail(email)) {
    return NextResponse.json({ ok: true, studentVerified: false })
  }

  const service = createServiceClient()
  const { data: existing } = await service
    .from('users')
    .select('is_verified_student, university_email')
    .eq('id', user.id)
    .maybeSingle()

  if (existing?.is_verified_student) {
    clearVerificationCache(user.id)
    await recordFunnelMilestone(user.id, 'verification_decision', {
      source: 'api/auth/finalize-email-verification',
      metadata: { method: 'auto_academic' },
      client: service as any,
    })
    return NextResponse.json({ ok: true, studentVerified: true })
  }

  const result = await attachVerifiedUniversityEmail(service, {
    userId: user.id,
    email,
  })

  if (!result.ok) {
    // Occupancy conflict or transient error — do not block onboarding.
    // User can still verify later via AcademicVerificationGate if appropriate.
    return NextResponse.json(
      {
        ok: false,
        studentVerified: false,
        error: result.error,
      },
      { status: result.status === 409 ? 409 : 200 }
    )
  }

  await recordFunnelMilestone(user.id, 'verification_decision', {
    source: 'api/auth/finalize-email-verification',
    metadata: { method: 'auto_academic' },
    client: service as any,
  })

  return NextResponse.json({ ok: true, studentVerified: true })
}
