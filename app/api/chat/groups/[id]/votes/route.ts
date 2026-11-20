import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { createNotificationsForUsers } from '@/lib/notifications/create'
import { emailGroupUnanimousReady } from '@/lib/email/housing'
import { safeLogger } from '@/lib/utils/logger'
import { getGroupCohesionScore } from '@/lib/group-compatibility/v2-calculator'
import { loadMemberHousingSignals } from '@/lib/housing/applicant-signals'
import { scoreGroupAgainstListing } from '@/lib/housing/group-listing-score'

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chatId } = await params
  const listingId = request.nextUrl.searchParams.get('listing_id')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { admin, ok } = await requireActiveMember(chatId, user.id)
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let query = admin.from('group_listing_votes').select('*').eq('chat_id', chatId)
  if (listingId) query = query.eq('listing_id', listingId)
  const { data: votes, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: members } = await admin
    .from('chat_members')
    .select('user_id')
    .eq('chat_id', chatId)
    .eq('status', 'active')
  const activeIds = (members || []).map((m) => m.user_id as string)

  let unanimous = false
  let preview = null
  if (listingId) {
    const approved = new Set(
      (votes || []).filter((v) => v.vote === 'approve' && v.listing_id === listingId).map((v) => v.user_id)
    )
    unanimous = activeIds.length > 0 && activeIds.every((id) => approved.has(id))

    const { data: listing } = await admin
      .from('housing_listings')
      .select('*')
      .eq('id', listingId)
      .maybeSingle()
    if (listing) {
      const cohesion = await getGroupCohesionScore(chatId, activeIds)
      const signals = await loadMemberHousingSignals(activeIds)
      preview = scoreGroupAgainstListing(
        signals,
        {
          rentMonthly: Number(listing.rent_monthly),
          availableRooms: Number(listing.available_rooms),
          seekingPeople: Number(listing.seeking_people || 1),
          petFriendly: Boolean(listing.pet_friendly),
          smokingAllowed: Boolean(listing.smoking_allowed),
          lifestylePrefs: listing.lifestyle_prefs || {},
          dealbreakers: listing.dealbreakers || {},
          availableFrom: listing.available_from,
          minStayMonths: listing.min_stay_months,
          maxStayMonths: listing.max_stay_months,
          amenities: Array.isArray(listing.amenities) ? listing.amenities : [],
        },
        cohesion
      )
    }
  }

  return NextResponse.json({
    votes: votes || [],
    active_member_count: activeIds.length,
    unanimous,
    can_apply_as_group: unanimous,
    preview,
  })
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

  const body = z
    .object({
      listing_id: z.string().uuid(),
      vote: z.enum(['approve', 'reject', 'abstain']),
    })
    .safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const { admin, ok } = await requireActiveMember(chatId, user.id)
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { listingAllowsStudentActions } = await import(
    '@/lib/host/assert-verified-for-listing'
  )
  const actionGate = await listingAllowsStudentActions(body.data.listing_id)
  if (!actionGate.ok) {
    return NextResponse.json(
      { error: 'host_unverified', message: 'Host has not verified their email yet' },
      { status: 403 }
    )
  }

  const { data: vote, error } = await admin
    .from('group_listing_votes')
    .upsert(
      {
        chat_id: chatId,
        listing_id: body.data.listing_id,
        user_id: user.id,
        vote: body.data.vote,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'chat_id,listing_id,user_id' }
    )
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Check unanimous
  const { data: members } = await admin
    .from('chat_members')
    .select('user_id')
    .eq('chat_id', chatId)
    .eq('status', 'active')
  const activeIds = (members || []).map((m) => m.user_id as string)
  const { data: allVotes } = await admin
    .from('group_listing_votes')
    .select('user_id, vote')
    .eq('chat_id', chatId)
    .eq('listing_id', body.data.listing_id)
  const approved = new Set(
    (allVotes || []).filter((v) => v.vote === 'approve').map((v) => v.user_id as string)
  )
  const unanimous = activeIds.length > 0 && activeIds.every((id) => approved.has(id))

  if (unanimous) {
    try {
      const { data: listing } = await admin
        .from('housing_listings')
        .select('title')
        .eq('id', body.data.listing_id)
        .maybeSingle()
      const title = listing?.title || 'the listing'
      await createNotificationsForUsers(
        activeIds,
        'housing_update',
        'Ready to apply',
        `Your group agreed on ${title}`,
        {
          audience: 'student',
          chat_id: chatId,
          listing_id: body.data.listing_id,
          link: `/housing/${body.data.listing_id}`,
        }
      )
      for (const uid of activeIds) {
        const { data: u } = await admin.auth.admin.getUserById(uid)
        if (u.user?.email) {
          await emailGroupUnanimousReady({ to: u.user.email, listingTitle: title })
        }
      }
    } catch (e) {
      safeLogger.warn('unanimous notify failed', { e })
    }
  }

  return NextResponse.json({ vote, unanimous, can_apply_as_group: unanimous })
}
