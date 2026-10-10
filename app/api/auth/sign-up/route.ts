import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { validateDateOfBirth } from '@/lib/auth/age-verification'
import { getPasswordStrength } from '@/lib/auth/password-strength'
import {
  ACCOUNT_BANNED_CODE,
  isEmailBanned,
  normalizeEmail,
} from '@/lib/auth/banned-emails'
import {
  checkRateLimit,
  getClientIp,
  getIPRateLimitKey,
  buildRateLimitHeaders,
} from '@/lib/rate-limit'
import { isAcademicEmail } from '@/lib/university-email/academic-email'
import {
  UNIVERSITY_EMAIL_IN_USE_MESSAGE,
  findUniversityEmailOccupantIds,
  normalizeUniversityEmail,
} from '@/lib/university-email/claims'

const SignUpBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().min(1),
  userType: z.enum(['student', 'professional']).optional().nullable(),
  acceptTerms: z.literal(true),
  confirmAge: z.literal(true),
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateKey = getIPRateLimitKey('auth', ip)
    const rate = await checkRateLimit('auth', rateKey)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.', code: 'RATE_LIMITED' },
        {
          status: 429,
          headers: buildRateLimitHeaders(5, rate),
        }
      )
    }

    let body: z.infer<typeof SignUpBodySchema>
    try {
      const json = await request.json()
      body = SignUpBodySchema.parse(json)
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid signup data',
          code: 'INVALID_INPUT',
          details: parseError instanceof z.ZodError ? parseError.flatten() : undefined,
        },
        { status: 400 }
      )
    }

    const ageValidation = validateDateOfBirth(body.dateOfBirth)
    if (!ageValidation.valid) {
      return NextResponse.json(
        {
          error: ageValidation.error || 'Invalid date of birth',
          code: ageValidation.reason === 'underage' ? 'UNDERAGE' : 'INVALID_DOB',
        },
        { status: 400 }
      )
    }

    const passwordStrength = getPasswordStrength(body.password)
    if (!passwordStrength.isValid) {
      return NextResponse.json(
        {
          error: passwordStrength.missingSummary || 'Password is too weak',
          code: 'WEAK_PASSWORD',
        },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const email = normalizeEmail(body.email)

    if (await isEmailBanned(admin, email)) {
      return NextResponse.json(
        {
          error: 'Unable to create account.',
          code: ACCOUNT_BANNED_CODE,
        },
        { status: 403 }
      )
    }

    // Academic login emails are exclusive — block signup if already held
    if (isAcademicEmail(email)) {
      try {
        const holders = await findUniversityEmailOccupantIds(
          admin,
          normalizeUniversityEmail(email)
        )
        if (holders.length > 0) {
          return NextResponse.json(
            {
              error: UNIVERSITY_EMAIL_IN_USE_MESSAGE,
              code: 'UNIVERSITY_EMAIL_IN_USE',
            },
            { status: 409 }
          )
        }
      } catch (occupancyError) {
        safeLogger.warn('[SignUp] University email occupancy check failed', {
          message:
            occupancyError instanceof Error ? occupancyError.message : String(occupancyError),
        })
      }
    }

    const supabase = await createClient()
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'

    const { data, error } = await supabase.auth.signUp({
      email,
      password: body.password,
      options: {
        data: {
          first_name: body.firstName.trim(),
          last_name: body.lastName.trim(),
          full_name: `${body.firstName.trim()} ${body.lastName.trim()}`.trim(),
          date_of_birth: body.dateOfBirth,
          ...(body.userType === 'student' || body.userType === 'professional'
            ? { user_type: body.userType }
            : {}),
        },
        emailRedirectTo: `${origin}/auth/verify-email`,
      },
    })

    if (error) {
      safeLogger.warn('[SignUp] Auth signup failed', { message: error.message })
      const isEmailSendError =
        error.message?.toLowerCase().includes('confirmation email') ||
        error.message?.toLowerCase().includes('sending email')
      return NextResponse.json(
        {
          error: isEmailSendError
            ? "We couldn't send the confirmation email. Please try again later or contact support."
            : error.message,
          code: 'SIGNUP_FAILED',
        },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.', code: 'SIGNUP_FAILED' },
        { status: 500 }
      )
    }

    try {
      const { recordFunnelMilestone } = await import('@/lib/admin/registration-funnel-track')
      await recordFunnelMilestone(data.user.id, 'signup_submitted', {
        source: 'api/auth/sign-up',
        metadata: {
          user_type: body.userType ?? null,
          academic_login: isAcademicEmail(email),
        },
        client: admin as any,
      })
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
      email: data.user.email,
      needsEmailVerification: !data.user.email_confirmed_at,
    })
  } catch (error) {
    safeLogger.error('[SignUp] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
