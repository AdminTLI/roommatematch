import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getChatPrivacySnapshot } from '@/lib/privacy/profile-access-server'
import type { ChatPrivacySnapshot } from '@/lib/privacy/profile-access-types'

const MAX_BATCH = 40

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { chat_ids?: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const rawIds = Array.isArray(body.chat_ids) ? body.chat_ids.filter((id): id is string => typeof id === 'string' && id.length > 0) : []
  const chatIds = [...new Set(rawIds)].slice(0, MAX_BATCH)

  if (chatIds.length === 0) {
    return NextResponse.json({ by_chat_id: {} as Record<string, ChatPrivacySnapshot> })
  }

  const { data: memberships, error: memErr } = await supabase
    .from('chat_members')
    .select('chat_id')
    .eq('user_id', user.id)
    .in('chat_id', chatIds)

  if (memErr) {
    return NextResponse.json({ error: 'Failed to verify memberships' }, { status: 500 })
  }

  const allowed = new Set((memberships || []).map((m) => m.chat_id as string))
  const admin = createAdminClient()

  const by_chat_id: Record<string, ChatPrivacySnapshot> = {}

  for (const chatId of chatIds) {
    if (!allowed.has(chatId)) continue
    const snap = await getChatPrivacySnapshot(admin, chatId, user.id)
    if (snap) by_chat_id[chatId] = snap
  }

  return NextResponse.json({ by_chat_id }, { headers: { 'Cache-Control': 'no-store' } })
}
