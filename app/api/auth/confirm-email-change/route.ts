import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { safeLogger } from '@/lib/utils/logger'
import { createClient as createVerifyClient } from '@supabase/supabase-js'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const newEmail = toLowerTrim(body?.newEmail)
    const token = typeof body?.token === 'string' ? body.token.trim() : ''

    if (!newEmail || !EMAIL_REGEX.test(newEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!token || !/^\d{6}$/.test(token)) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()

    // Enforce 30-day cooldown on confirmed changes.
    const { data: userRow, error: userRowError } = await service
      .from('users')
      .select('last_email_change_at')
      .eq('id', user.id)
      .maybeSingle()

    if (userRowError) {
      safeLogger.error('[EmailChange][Confirm] Failed to read cooldown', userRowError, { userId: user.id })
      return NextResponse.json({ error: 'Failed to check cooldown' }, { status: 500 })
    }

    const now = new Date()
    if (userRow?.last_email_change_at) {
      const lastChange = new Date(userRow.last_email_change_at)
      const nextAllowedAt = addDays(lastChange, EMAIL_CHANGE_COOLDOWN_DAYS)
      if (nextAllowedAt > now) {
        return NextResponse.json(
          {
            error: 'Email can only be changed once every 30 days.',
            next_allowed_at: nextAllowedAt.toISOString(),
          },
          { status: 429 }
        )
      }
    }

    // Verify OTP ownership of the new email.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const verifyClient = createVerifyClient(supabaseUrl, supabaseAnon, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error: verifyError } = await verifyClient.auth.verifyOtp({
      email: newEmail,
      token,
      type: 'email',
    })

    if (verifyError) {
      const msg = verifyError.message || 'Invalid or expired verification code'
      const lower = msg.toLowerCase()
      const friendly =
        lower.includes('expired') || lower.includes('invalid') ? 'Invalid or expired code. Please request a new one.' : msg
      return NextResponse.json({ error: friendly }, { status: 400 })
    }

    // Ensure the target email isn't already used by another user.
    try {
      const { data: existing } = await service.auth.admin.getUserByEmail(newEmail)
      const existingUserId = existing?.user?.id
      if (existingUserId && existingUserId !== user.id) {
        return NextResponse.json({ error: 'That email is already in use' }, { status: 409 })
      }
    } catch {
      // If lookup fails, continue; updateUserById will fail if it conflicts.
    }

    const nowIso = new Date().toISOString()

    // Update auth email + mark it confirmed.
    // email_confirmed_at is required so the app can immediately treat the email as verified.
    let updateError: any = null
    try {
      const { error } = await service.auth.admin.updateUserById(user.id, {
        email: newEmail,
        email_confirmed_at: nowIso,
      } as any)
      updateError = error
    } catch (err) {
      updateError = err
    }

    if (updateError) {
      // Fallback for environments where the admin API doesn't accept email_confirmed_at.
      const msg = String(updateError?.message || updateError).toLowerCase()
      if (msg.includes('email_confirmed_at') || msg.includes('confirmed_at') || msg.includes('invalid field')) {
        safeLogger.warn('[EmailChange][Confirm] email_confirmed_at not accepted; falling back to email-only update', {
          userId: user.id,
        })
        const { error: fallbackError } = await service.auth.admin.updateUserById(user.id, { email: newEmail } as any)
        updateError = fallbackError
      }
    }

    if (updateError) {
      safeLogger.error('[EmailChange][Confirm] Failed to update auth user email', updateError, { userId: user.id })
      return NextResponse.json({ error: updateError.message || 'Failed to update email' }, { status: 500 })
    }

    // Keep our public users table in sync (used across the app).
    const { error: userUpdateError } = await service
      .from('users')
      .update({
        email: newEmail,
        last_email_change_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', user.id)

    if (userUpdateError) {
      safeLogger.error('[EmailChange][Confirm] Failed to update users table', userUpdateError, { userId: user.id })
      return NextResponse.json({ error: 'Failed to update user record' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      email: newEmail,
      message: 'Email updated successfully.',
    })
  } catch (error) {
    safeLogger.error('[EmailChange][Confirm] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

