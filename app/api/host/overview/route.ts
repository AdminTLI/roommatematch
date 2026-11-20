import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireHostProfile } from '@/lib/host/auth'

export async function GET(request: NextRequest) {
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })

  const admin = await createAdminClient()
  const hostId = hostReq.host.id
  const hostUserId = hostReq.userId
  const badgesOnly = request.nextUrl.searchParams.get('badges') === '1'

  const { data: listings } = await admin
    .from('housing_listings')
    .select('id, title, status')
    .eq('host_id', hostId)

  const listingRows = listings || []
  const listingIds = listingRows.map((l) => l.id)
  const draftCount = listingRows.filter((l) => l.status === 'draft').length
  const publishedCount = listingRows.filter((l) =>
    ['published', 'active', 'approved'].includes(String(l.status))
  ).length

  let newApplications = 0
  let recentApps: any[] = []
  let unreadMessages = 0
  let recentChats: any[] = []
  let pendingViewings = 0
  let upcomingViewings: any[] = []

  if (listingIds.length) {
    const { data: apps } = await admin
      .from('housing_applications')
      .select(
        'id, listing_id, status, anonymous_label, fit_score, created_at, host_chat_id, identity_revealed'
      )
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })
      .limit(50)

    const allApps = apps || []
    newApplications = allApps.filter((a) =>
      ['submitted', 'under_review'].includes(a.status)
    ).length
    recentApps = allApps.slice(0, 5).map((a) => ({
      ...a,
      listing_title: listingRows.find((l) => l.id === a.listing_id)?.title || 'Listing',
    }))

    const chatIds = allApps.map((a) => a.host_chat_id).filter(Boolean) as string[]
    if (chatIds.length) {
      const { data: memberships } = await admin
        .from('chat_members')
        .select('chat_id, last_read_at')
        .eq('user_id', hostUserId)
        .in('chat_id', chatIds)

      const readMap = new Map(
        (memberships || []).map((m) => [m.chat_id, m.last_read_at as string | null])
      )

      for (const chatId of chatIds) {
        const lastRead = readMap.get(chatId)
        let q = admin
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('chat_id', chatId)
          .neq('user_id', hostUserId)
        if (lastRead) q = q.gt('created_at', lastRead)
        const { count } = await q
        unreadMessages += count || 0
      }

      const { data: chats } = await admin
        .from('chats')
        .select('id, housing_application_id, updated_at, created_at')
        .in('id', chatIds)
        .order('updated_at', { ascending: false })
        .limit(5)

      recentChats = (chats || []).map((c) => {
        const app = allApps.find((a) => a.host_chat_id === c.id || a.id === c.housing_application_id)
        return {
          chat_id: c.id,
          listing_title: app
            ? listingRows.find((l) => l.id === app.listing_id)?.title || 'Listing'
            : 'Listing',
          anonymous_label: app?.anonymous_label || 'Applicant',
          status: app?.status,
        }
      })
    }

    const { data: viewings } = await admin
      .from('tour_bookings')
      .select('id, listing_id, status, scheduled_for, anonymous_label, tour_type')
      .in('listing_id', listingIds)
      .order('scheduled_for', { ascending: true })
      .limit(20)

    const viewingRows = viewings || []
    pendingViewings = viewingRows.filter((v) => v.status === 'scheduled').length
    upcomingViewings = viewingRows.slice(0, 5).map((v) => ({
      ...v,
      listing_title: listingRows.find((l) => l.id === v.listing_id)?.title || 'Listing',
    }))
  }

  const needsAttention = newApplications + pendingViewings + unreadMessages + draftCount

  if (badgesOnly) {
    return NextResponse.json({
      needsAttention,
      unreadMessages,
      newApplications,
      pendingViewings,
    })
  }

  return NextResponse.json({
    host_type: hostReq.host.host_type,
    display_name: hostReq.host.display_name,
    needsAttention,
    counts: {
      newApplications,
      pendingViewings,
      unreadMessages,
      draftListings: draftCount,
      publishedListings: publishedCount,
      totalListings: listingRows.length,
    },
    recentApplications: recentApps,
    upcomingViewings,
    recentChats,
  })
}
