import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  UNIVERSITY_EMAIL_IN_USE_MESSAGE,
  evaluateUniversityEmailOccupancy,
  findUniversityEmailOccupantIds,
  normalizeUniversityEmail,
  recordUniversityEmailReuseFlag,
} from '@/lib/university-email/claims'
import { isAcademicEmail } from '@/lib/university-email/academic-email'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    )
  }

  if (!isAcademicEmail(email)) {
    return NextResponse.json(
      {
        error:
          'Please enter a valid university email address (e.g., ending in .nl or .edu).',
      },
      { status: 400 }
    )
  }

  try {
    const service = createServiceClient()
    const emailNormalized = normalizeUniversityEmail(email)
    const { data: currentUser } = await service
      .from('users')
      .select('email, university_email')
      .eq('id', user.id)
      .maybeSingle()
    const occupantIds = await findUniversityEmailOccupantIds(service, emailNormalized)
    const occupancy = evaluateUniversityEmailOccupancy({
      currentUserId: user.id,
      currentUniversityEmail: currentUser?.university_email ?? null,
      currentLoginEmail: currentUser?.email ?? null,
      emailNormalized,
      occupantIds,
    })
    if (!occupancy.allow) {
      await recordUniversityEmailReuseFlag(service, {
        emailNormalized,
        attemptingUserId: user.id,
        holderUserIds: occupancy.holderIds,
      }).catch(() => undefined)
      return NextResponse.json(
        { error: UNIVERSITY_EMAIL_IN_USE_MESSAGE },
        { status: 409 }
      )
    }
  } catch (error) {
    console.error('[verify-academic-email] occupancy check error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }

  // Sends a 6-digit OTP when the project's Email template includes {{ .Token }} (Auth > Email Templates).
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  })

  if (error) {
    console.error('[verify-academic-email] signInWithOtp error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to send verification code' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
