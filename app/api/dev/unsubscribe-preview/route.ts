/**
 * GET /api/dev/unsubscribe-preview
 *
 * Dev/admin helper: mint a real unsubscribe token for a user so you can
 * preview /unsubscribe and test preference toggles end-to-end.
 *
 * Query params:
 *   userId  - optional; defaults to the signed-in user
 *   mock=1  - return demo data without DB (UI-only preview)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/roles'
import { createUnsubscribeToken } from '@/lib/email/unsubscribe-token'
import { buildUnsubscribeUrl } from '@/lib/email/brand'
import { DEV_UNSUBSCRIBE_MOCK_TOKEN } from '@/lib/email/dev-unsubscribe-mock'
import { safeLogger } from '@/lib/utils/logger'

const DEFAULT_PREFERENCES = {
  emailMatches: true,
  emailMessages: true,
  emailUpdates: true,
  pushMatches: true,
  pushMessages: true,
}

function isDevOpen(): boolean {
  return process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mock = searchParams.get('mock') === '1' || searchParams.get('mock') === 'true'
    const requestedUserId = searchParams.get('userId')?.trim() || null

    if (mock) {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
      const url = `${appUrl}/unsubscribe?token=${encodeURIComponent(DEV_UNSUBSCRIBE_MOCK_TOKEN)}`
      return NextResponse.json({
        mock: true,
        userId: '00000000-0000-4000-8000-000000000000',
        email: 'preview.user@example.com',
        firstName: 'Alex',
        preferences: { ...DEFAULT_PREFERENCES },
        token: DEV_UNSUBSCRIBE_MOCK_TOKEN,
        url,
        note: 'Preview mode - toggles work in the UI but are not saved to Supabase. Sign in and use “Preview as signed-in user” for a real test.',
      })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!isDevOpen()) {
      if (authError || !user) {
        return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
      }
      const admin = await isAdmin(user.id)
      if (!admin) {
        return NextResponse.json({ error: 'Admin only in production' }, { status: 403 })
      }
    }

    const targetUserId = requestedUserId || user?.id
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Provide ?userId=... or sign in to preview as yourself' },
        { status: 400 }
      )
    }

    if (!isDevOpen() && requestedUserId && requestedUserId !== user?.id) {
      const admin = user ? await isAdmin(user.id) : false
      if (!admin) {
        return NextResponse.json({ error: 'Only admins can preview other users' }, { status: 403 })
      }
    }

    const adminClient = createAdminClient()

    const [{ data: profile }, { data: userRow }] = await Promise.all([
      adminClient
        .from('profiles')
        .select('notification_preferences,first_name')
        .eq('user_id', targetUserId)
        .maybeSingle(),
      adminClient.from('users').select('email').eq('id', targetUserId).maybeSingle(),
    ])

    if (!userRow?.email) {
      return NextResponse.json({ error: 'User not found or has no email' }, { status: 404 })
    }

    const prefsRaw = (profile as any)?.notification_preferences
    const preferences =
      typeof prefsRaw === 'object' && prefsRaw !== null
        ? { ...DEFAULT_PREFERENCES, ...prefsRaw }
        : { ...DEFAULT_PREFERENCES }

    const token = createUnsubscribeToken(targetUserId)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const url = buildUnsubscribeUrl(token, appUrl)

    return NextResponse.json({
      mock: false,
      userId: targetUserId,
      email: userRow.email,
      firstName: (profile as any)?.first_name ?? null,
      preferences,
      token,
      url,
    })
  } catch (error) {
    safeLogger.error('[DevUnsubscribePreview] Failed', { error })
    return NextResponse.json(
      {
        error: 'Failed to create preview link',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
