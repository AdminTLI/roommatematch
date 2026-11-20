import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { createNotificationsForUsers } from '@/lib/notifications/create'
import { emailGroupListingPinned, emailGroupVoteNeeded } from '@/lib/email/housing'
import { safeLogger } from '@/lib/utils/logger'
import { listingAllowsStudentActions } from '@/lib/host/assert-verified-for-listing'

async function requireActiveMember(chatId: string, userId: string) {
  const admin = await createAdminClient()
  const { data } = await admin
    .from('chat_members')
    .select('user_id')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  return { admin, ok: Boolean(data) }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chatId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { admin, ok } = await requireActiveMember(chatId, user.id)
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await admin
    .from('group_listing_pins')
    .select('*, housing_listings(id, title, city, rent_monthly, photos, host_type)')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ pins: data || [] })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chatId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = z.object({ listing_id: z.string().uuid() }).safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Invalid listing_id' }, { status: 400 })

  const { admin, ok } = await requireActiveMember(chatId, user.id)
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const actionGate = await listingAllowsStudentActions(body.data.listing_id)
  if (!actionGate.ok) {
    return NextResponse.json(
      { error: 'host_unverified', message: 'Host has not verified their email yet' },
      { status: 403 }
    )
  }

  const { data: pin, error } = await admin
    .from('group_listing_pins')
    .upsert(
      {
        chat_id: chatId,
        listing_id: body.data.listing_id,
        pinned_by: user.id,
      },
      { onConflict: 'chat_id,listing_id' }
    )
    .select('*, housing_listings(title)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: members } = await admin
    .from('chat_members')
    .select('user_id')
    .eq('chat_id', chatId)
    .eq('status', 'active')

  const others = (members || []).map((m) => m.user_id).filter((id) => id !== user.id)
  const title = (pin.housing_listings as { title?: string } | null)?.title || 'a listing'
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name')
    .eq('user_id', user.id)
    .maybeSingle()
  const memberName = profile?.first_name || 'A housemate'

  try {
    await createNotificationsForUsers(
      others,
      'housing_update',
      'Listing pinned',
      `${memberName} pinned ${title}`,
      {
        audience: 'student',
        chat_id: chatId,
        listing_id: body.data.listing_id,
        link: `/chat?chatId=${chatId}`,
      }
    )
    for (const uid of others) {
      const { data: u } = await admin.auth.admin.getUserById(uid)
      if (u.user?.email) {
        await emailGroupListingPinned({
          to: u.user.email,
          memberName,
          listingTitle: title,
        })
        await emailGroupVoteNeeded({ to: u.user.email, listingTitle: title })
      }
    }
  } catch (e) {
    safeLogger.warn('pin notify failed', { e })
  }

  return NextResponse.json({ pin }, { status: 201 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chatId } = await params
  const listingId = request.nextUrl.searchParams.get('listing_id')
  if (!listingId) return NextResponse.json({ error: 'listing_id required' }, { status: 400 })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { admin, ok } = await requireActiveMember(chatId, user.id)
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await admin
    .from('group_listing_pins')
    .delete()
    .eq('chat_id', chatId)
    .eq('listing_id', listingId)

  return NextResponse.json({ ok: true })
}
