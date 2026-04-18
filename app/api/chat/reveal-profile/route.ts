import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { ensureProfileAccessRows } from '@/lib/privacy/profile-access-server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { chat_id?: string; reveal_details?: boolean; reveal_picture?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const chatId = body.chat_id
  if (!chatId || typeof chatId !== 'string') {
    return NextResponse.json({ error: 'chat_id is required' }, { status: 400 })
  }

  const revealDetails = Boolean(body.reveal_details)
  const revealPicture = Boolean(body.reveal_picture) && revealDetails

  const { data: member } = await supabase.from('chat_members').select('chat_id').eq('chat_id', chatId).eq('user_id', user.id).maybeSingle()

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  await ensureProfileAccessRows(admin, chatId)

  const { error: updateError } = await admin
    .from('profile_access_control')
    .update({
      details_revealed_by_requestor: revealDetails,
      picture_revealed_by_requestor: revealPicture,
      updated_at: new Date().toISOString(),
    })
    .eq('chat_id', chatId)
    .eq('requesting_user_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
