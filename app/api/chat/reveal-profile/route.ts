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

  const hasRevealDetails = typeof body.reveal_details === 'boolean'
  const hasRevealPicture = typeof body.reveal_picture === 'boolean'

  if (!hasRevealDetails && !hasRevealPicture) {
    return NextResponse.json({ error: 'reveal_details or reveal_picture is required' }, { status: 400 })
  }

  const { data: member } = await supabase.from('chat_members').select('chat_id').eq('chat_id', chatId).eq('user_id', user.id).maybeSingle()

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  await ensureProfileAccessRows(admin, chatId)

  const updatePayload: {
    updated_at: string
    details_revealed_by_requestor?: boolean
    picture_revealed_by_requestor?: boolean
  } = { updated_at: new Date().toISOString() }

  if (hasRevealDetails) {
    updatePayload.details_revealed_by_requestor = body.reveal_details!
  }
  if (hasRevealPicture) {
    updatePayload.picture_revealed_by_requestor = body.reveal_picture!
  }

  // Prefer the authenticated client (RLS allows updating your own row).
  const { data: updatedRows, error: userUpdateError } = await supabase
    .from('profile_access_control')
    .update(updatePayload)
    .eq('chat_id', chatId)
    .eq('requesting_user_id', user.id)
    .select('chat_id')

  if (userUpdateError) {
    return NextResponse.json({ error: userUpdateError.message }, { status: 500 })
  }

  if (!updatedRows || updatedRows.length === 0) {
    await ensureProfileAccessRows(admin, chatId)

    const { error: adminUpdateError } = await admin
      .from('profile_access_control')
      .update(updatePayload)
      .eq('chat_id', chatId)
      .eq('requesting_user_id', user.id)

    if (adminUpdateError) {
      return NextResponse.json({ error: adminUpdateError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
