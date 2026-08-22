import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { touchUserActivity } from '@/lib/privacy/inactive-accounts'
import { createServiceClient } from '@/lib/supabase/service'

/** Throttle presence pings so we don't write on every navigation. */
const PRESENCE_THROTTLE_MS = 2 * 60 * 1000

/**
 * POST /api/account/presence
 * Lightweight heartbeat for online presence (chat sidebar, etc.).
 * Updates last_activity_at / last_seen_at when the user is on any authenticated page.
 */
export async function POST(_req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('inactivity_processed_at, last_activity_at')
    .eq('id', user.id)
    .maybeSingle()

  if (userRow?.inactivity_processed_at) {
    return NextResponse.json({ error: 'Account inactive', code: 'account_inactive' }, { status: 403 })
  }

  const last = userRow?.last_activity_at ? new Date(userRow.last_activity_at).getTime() : 0
  if (Date.now() - last < PRESENCE_THROTTLE_MS) {
    return NextResponse.json({ ok: true, throttled: true })
  }

  const service = createServiceClient()
  await touchUserActivity(service, user.id)

  return NextResponse.json({ ok: true, throttled: false })
}
