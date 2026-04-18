import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getChatPrivacySnapshot } from '@/lib/privacy/profile-access-server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const chatId = request.nextUrl.searchParams.get('chatId')
  if (!chatId) {
    return NextResponse.json({ error: 'chatId is required' }, { status: 400 })
  }

  const { data: member } = await supabase.from('chat_members').select('chat_id').eq('chat_id', chatId).eq('user_id', user.id).maybeSingle()

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const snapshot = await getChatPrivacySnapshot(admin, chatId, user.id)
  if (!snapshot) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }

  return NextResponse.json(snapshot, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
