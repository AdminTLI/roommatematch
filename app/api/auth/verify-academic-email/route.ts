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

/** Allowed academic TLDs and known Dutch university email domains */
const ACADEMIC_TLDS = [
  '.nl',
  '.edu',
  '.ac.uk',
  '.be',
  '.de',
]
const ACADEMIC_DOMAIN_PATTERNS = [
  /@student\.avans\.nl$/i,
  /@avans\.nl$/i,
  /@buas\.nl$/i,
  /@([a-z0-9-]+\.)?(edu|ac\.uk|ac\.nl)(\.[a-z]{2})?$/i,
]

function isAcademicEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !normalized.includes('@')) return false
  const domain = normalized.slice(normalized.indexOf('@') + 1)
  if (ACADEMIC_DOMAIN_PATTERNS.some((re) => re.test(normalized))) return true
  return ACADEMIC_TLDS.some((tld) => domain.endsWith(tld))
}

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
      .select('university_email')
      .eq('id', user.id)
      .maybeSingle()
    const occupantIds = await findUniversityEmailOccupantIds(service, emailNormalized)
    const occupancy = evaluateUniversityEmailOccupancy({
      currentUserId: user.id,
      currentUniversityEmail: currentUser?.university_email ?? null,
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
