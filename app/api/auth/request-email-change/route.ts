import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { safeLogger } from '@/lib/utils/logger'

const EMAIL_CHANGE_COOLDOWN_DAYS = 30

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function toLowerTrim(s: unknown): string {
  return typeof s === 'string' ? s.trim().toLowerCase() : ''
}

function addDays(from: Date, days: number): Date {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return d
}

function formatCooldownRemaining(nextAllowedAt: Date, now: Date) {
  const ms = nextAllowedAt.getTime() - now.getTime()
  const seconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  return { seconds, days, hours }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const newEmailRaw = body?.newEmail
    const newEmail = toLowerTrim(newEmailRaw)

    if (!newEmail || !EMAIL_REGEX.test(newEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentEmail = typeof user.email === 'string' ? user.email.trim().toLowerCase() : ''
    if (currentEmail && newEmail === currentEmail) {
      return NextResponse.json({ error: 'New email must be different from your current email' }, { status: 400 })
    }

    const service = createServiceClient()
    const { data: userRow, error: userRowError } = await service
      .from('users')
      .select('last_email_change_at')
      .eq('id', user.id)
      .maybeSingle()

    if (userRowError) {
      safeLogger.error('[EmailChange][Request] Failed to read cooldown', userRowError, { userId: user.id })
      return NextResponse.json({ error: 'Failed to check cooldown' }, { status: 500 })
    }

    const now = new Date()
    if (userRow?.last_email_change_at) {
      const lastChange = new Date(userRow.last_email_change_at)
      const nextAllowedAt = addDays(lastChange, EMAIL_CHANGE_COOLDOWN_DAYS)
      if (nextAllowedAt > now) {
        const remaining = formatCooldownRemaining(nextAllowedAt, now)
        return NextResponse.json(
          {
            error: 'Email can only be changed once every 30 days.',
            next_allowed_at: nextAllowedAt.toISOString(),
            cooldown_remaining: remaining,
          },
          { status: 429 }
        )
      }
    }

    // Ensure the target email is not already used by another user.
    // (This avoids the user getting OTP success and failing later on confirm.)
    try {
      const { data: existing } = await service.auth.admin.getUserByEmail(newEmail)
      const existingUserId = existing?.user?.id
      if (existingUserId && existingUserId !== user.id) {
        return NextResponse.json({ error: 'That email is already in use' }, { status: 409 })
      }
    } catch (err) {
      // If the admin lookup fails for some reason, don't fail the OTP flow entirely.
      safeLogger.warn('[EmailChange][Request] Email availability check failed; continuing', {
        userId: user.id,
      })
    }

    // Send a 6-digit OTP to the new email address.
    // We use the "email" OTP type (verifyOtp type='email').
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: newEmail,
      options: {
        shouldCreateUser: false,
      },
    })

    if (otpError) {
      const message = otpError.message || 'Failed to send verification code'
      const lower = message.toLowerCase()
      if (lower.includes('too many') || lower.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a few minutes and try again.' },
          { status: 429 }
        )
      }

      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      email: newEmail,
      message: 'Verification code sent. Enter the 6-digit code to confirm the change.',
    })
  } catch (error) {
    safeLogger.error('[EmailChange][Request] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

