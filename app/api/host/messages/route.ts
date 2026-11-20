import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireHostProfile } from '@/lib/host/auth'

/**
 * List host↔applicant chats for the current host (housing_application linked only).
 */
export async function GET() {
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })

  const admin = await createAdminClient()
  const { data: listings } = await admin
    .from('housing_listings')
    .select('id, title')
    .eq('host_id', hostReq.host.id)

  const listingIds = (listings || []).map((l) => l.id)
  if (!listingIds.length) return NextResponse.json({ threads: [] })

  const { data: apps } = await admin
    .from('housing_applications')
    .select(
      'id, listing_id, status, anonymous_label, fit_score, host_chat_id, identity_revealed, user_id'
    )
    .in('listing_id', listingIds)
    .not('host_chat_id', 'is', null)

  const appsWithChat = (apps || []).filter((a) => a.host_chat_id)
  if (!appsWithChat.length) return NextResponse.json({ threads: [] })

  const listingTitle = new Map((listings || []).map((l) => [l.id, l.title]))
  const chatIds = appsWithChat.map((a) => a.host_chat_id as string)
  const applicantIds = [...new Set(appsWithChat.map((a) => a.user_id))]

  const [{ data: profiles }, { data: memberships }] = await Promise.all([
    admin
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_url, verification_status')
      .in('user_id', applicantIds),
    admin
      .from('chat_members')
      .select('chat_id, last_read_at')
      .eq('user_id', hostReq.userId)
      .in('chat_id', chatIds),
  ])

  const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]))
  const readMap = new Map(
    (memberships || []).map((m) => [m.chat_id, m.last_read_at as string | null])
  )

  const { data: latestMessages } = await admin
    .from('messages')
    .select('chat_id, content, created_at, user_id')
    .in('chat_id', chatIds)
    .order('created_at', { ascending: false })
    .limit(chatIds.length * 5)

  type LatestMsg = { chat_id: string; content: string; created_at: string; user_id: string }
  const latestByChat = new Map<string, LatestMsg>()
  for (const msg of (latestMessages || []) as LatestMsg[]) {
    if (!latestByChat.has(msg.chat_id)) latestByChat.set(msg.chat_id, msg)
  }

  const threads = await Promise.all(
    appsWithChat.map(async (app) => {
      const chatId = app.host_chat_id as string
      const profile = profileMap.get(app.user_id)
      const lastRead = readMap.get(chatId)
      let unreadQ = admin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('chat_id', chatId)
        .neq('user_id', hostReq.userId)
      if (lastRead) unreadQ = unreadQ.gt('created_at', lastRead)
      const { count } = await unreadQ
      const latest = latestByChat.get(chatId)
      const name = profile
        ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || app.anonymous_label
        : app.anonymous_label || 'Applicant'

      return {
        chat_id: chatId,
        application_id: app.id,
        listing_id: app.listing_id,
        listing_title: listingTitle.get(app.listing_id) || 'Listing',
        status: app.status,
        fit_score: app.fit_score,
        partner_name: name,
        partner_avatar: profile?.avatar_url || null,
        partner_user_id: app.user_id,
        last_message: latest
          ? { content: latest.content, created_at: latest.created_at }
          : null,
        unread_count: count || 0,
      }
    })
  )

  threads.sort((a, b) => {
    const at = a.last_message?.created_at || ''
    const bt = b.last_message?.created_at || ''
    return bt.localeCompare(at)
  })

  return NextResponse.json({ threads })
}
