/**
 * GET/POST /api/settings/notifications
 * Load or save notification preferences (email/push toggles) for the current user.
 * Stored in profiles.notification_preferences JSONB.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_PREFERENCES = {
  emailMatches: true,
  emailMessages: true,
  emailUpdates: true,
  pushMatches: true,
  pushMessages: true,
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to load preferences', message: error.message },
      { status: 500 }
    )
  }

  const prefs = profile?.notification_preferences
  const merged = typeof prefs === 'object' && prefs !== null
    ? { ...DEFAULT_PREFERENCES, ...prefs }
    : DEFAULT_PREFERENCES

  return NextResponse.json(merged)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, boolean>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const notification_preferences = {
    emailMatches: typeof body.emailMatches === 'boolean' ? body.emailMatches : true,
    emailMessages: typeof body.emailMessages === 'boolean' ? body.emailMessages : true,
    emailUpdates: typeof body.emailUpdates === 'boolean' ? body.emailUpdates : true,
    pushMatches: typeof body.pushMatches === 'boolean' ? body.pushMatches : true,
    pushMessages: typeof body.pushMessages === 'boolean' ? body.pushMessages : true,
  }

  const { error } = await supabase
    .from('profiles')
    .update({ notification_preferences })
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to save preferences', message: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, notification_preferences })
}
