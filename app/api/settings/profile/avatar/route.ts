import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SEED_RE = /^[a-zA-Z0-9_-]{1,64}$/

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { avatar_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const avatarId = typeof body.avatar_id === 'string' ? body.avatar_id.trim() : ''
  if (!SEED_RE.test(avatarId)) {
    return NextResponse.json(
      { error: 'avatar_id must be 1–64 characters: letters, numbers, underscore, or hyphen.' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('profiles').update({ avatar_id: avatarId, updated_at: new Date().toISOString() }).eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, avatar_id: avatarId })
}
