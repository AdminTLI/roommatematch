/**
 * /api/unsubscribe — resolve and update email preferences via a signed token.
 *
 * GET  ?token=...           — returns { email, preferences } for the user.
 * POST ?token=... body={preferences} — saves preferences and logs the change.
 *
 * The token is HMAC-signed (see lib/email/unsubscribe-token.ts) so the user
 * does not need to be signed in for this endpoint to work — the link in the
 * email is the proof of identity. We use the service role to bypass RLS.
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe-token'
import { truncateClientIp } from '@/lib/privacy/truncate-client-ip'
import {
  getDevMockUnsubscribeState,
  isDevUnsubscribeMockToken,
  setDevMockUnsubscribePreferences,
} from '@/lib/email/dev-unsubscribe-mock'
import { safeLogger } from '@/lib/utils/logger'

const PREFERENCE_KEYS = [
  'emailMatches',
  'emailMessages',
  'emailUpdates',
  'pushMatches',
  'pushMessages',
] as const

type PreferenceKey = (typeof PREFERENCE_KEYS)[number]

const DEFAULT_PREFERENCES: Record<PreferenceKey, boolean> = {
  emailMatches: true,
  emailMessages: true,
  emailUpdates: true,
  pushMatches: true,
  pushMessages: true,
}

function sanitizePreferences(raw: any): Record<PreferenceKey, boolean> {
  const merged = { ...DEFAULT_PREFERENCES }
  if (raw && typeof raw === 'object') {
    for (const key of PREFERENCE_KEYS) {
      if (typeof raw[key] === 'boolean') merged[key] = raw[key]
    }
  }
  return merged
}

function getAnonymizedIp(req: Request): string | null {
  const fwd = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const raw = (fwd || '').split(',')[0]?.trim() || realIp || null
  return truncateClientIp(raw)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  if (isDevUnsubscribeMockToken(token)) {
    return NextResponse.json({ ...getDevMockUnsubscribeState(), preview: true })
  }

  const verified = verifyUnsubscribeToken(token)
  if (!verified) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    const [{ data: profile }, { data: userRow }] = await Promise.all([
      supabase
        .from('profiles')
        .select('notification_preferences,first_name')
        .eq('user_id', verified.userId)
        .maybeSingle(),
      supabase.from('users').select('email').eq('id', verified.userId).maybeSingle(),
    ])

    const preferences = sanitizePreferences(profile?.notification_preferences)
    const email = (userRow as any)?.email || null
    const firstName = (profile as any)?.first_name || null

    return NextResponse.json({ email, firstName, preferences })
  } catch (error) {
    safeLogger.error('[Unsubscribe] GET failed', { error })
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const next = sanitizePreferences(body?.preferences)

  if (isDevUnsubscribeMockToken(token)) {
    setDevMockUnsubscribePreferences(next)
    return NextResponse.json({ success: true, preferences: next, preview: true })
  }

  const verified = verifyUnsubscribeToken(token)
  if (!verified) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('user_id', verified.userId)
      .maybeSingle()

    const previous = sanitizePreferences((existing as any)?.notification_preferences)

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ notification_preferences: next })
      .eq('user_id', verified.userId)

    if (updateErr) {
      safeLogger.error('[Unsubscribe] update failed', { error: updateErr, userId: verified.userId })
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
    }

    // Compute diff for the audit row
    const diff: Record<string, { from: boolean; to: boolean }> = {}
    for (const key of PREFERENCE_KEYS) {
      if (previous[key] !== next[key]) diff[key] = { from: previous[key], to: next[key] }
    }

    if (Object.keys(diff).length > 0) {
      const ipHash = getAnonymizedIp(request)
      const userAgent = (request.headers.get('user-agent') || '').slice(0, 256)
      const { error: auditErr } = await supabase.from('email_unsubscribe_events').insert({
        user_id: verified.userId,
        changes: diff,
        source: 'email_link',
        ip_hash: ipHash,
        user_agent: userAgent || null,
      })
      if (auditErr) {
        // Don't block the user — audit row is best effort.
        safeLogger.warn('[Unsubscribe] audit insert failed', { error: auditErr })
      }
    }

    return NextResponse.json({ success: true, preferences: next })
  } catch (error) {
    safeLogger.error('[Unsubscribe] POST failed', { error })
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}
