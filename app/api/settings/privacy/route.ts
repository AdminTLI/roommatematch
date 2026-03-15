/**
 * GET/POST /api/settings/privacy
 * Load or save privacy settings (visibility, messages, data sharing) for the current user.
 * profileVisible is stored as profiles.is_visible; others in profiles.privacy_settings JSONB.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_PRIVACY = {
  profileVisible: true,
  showInMatches: true,
  allowMessages: true,
  dataSharing: true,
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_visible, privacy_settings')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to load privacy settings', message: error.message },
      { status: 500 }
    )
  }

  const ps = profile?.privacy_settings
  const privacySettings = typeof ps === 'object' && ps !== null
    ? { ...DEFAULT_PRIVACY, ...ps }
    : DEFAULT_PRIVACY
  privacySettings.profileVisible = profile?.is_visible !== false

  return NextResponse.json(privacySettings)
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

  const profileVisible = typeof body.profileVisible === 'boolean' ? body.profileVisible : true
  const privacy_settings = {
    showInMatches: typeof body.showInMatches === 'boolean' ? body.showInMatches : true,
    allowMessages: typeof body.allowMessages === 'boolean' ? body.allowMessages : true,
    dataSharing: typeof body.dataSharing === 'boolean' ? body.dataSharing : false,
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      is_visible: profileVisible,
      privacy_settings,
    })
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to save privacy settings', message: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    profileVisible,
    privacy_settings,
  })
}
