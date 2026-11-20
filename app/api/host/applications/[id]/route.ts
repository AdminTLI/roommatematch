import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { requireHostProfile } from '@/lib/host/auth'
import { REJECTION_REASON_CODES } from '@/lib/host/types'
import { createNotification, createNotificationsForUsers } from '@/lib/notifications/create'
import {
  emailOfferReceived,
  emailStudentNotSelected,
  emailStudentShortlisted,
} from '@/lib/email/housing'
import { ensureHostApplicantChat } from '@/lib/host/ensure-host-applicant-chat'
import { safeLogger } from '@/lib/utils/logger'

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('shortlist') }),
  z.object({
    action: z.literal('reject'),
    rejection_reason_code: z.enum(REJECTION_REASON_CODES),
    rejection_note: z.string().max(1000).optional(),
  }),
  z.object({ action: z.literal('accept') }),
  z.object({ action: z.literal('send_offer') }),
  /** @deprecated Use accept — kept for older clients during rollout */
  z.object({ action: z.literal('offer') }),
])

async function loadOwnedApplication(applicationId: string, hostId: string) {
  const admin = await createAdminClient()
  const { data } = await admin
    .from('housing_applications')
    .select('*, housing_listings!inner(id, title, host_id)')
    .eq('id', applicationId)
    .eq('housing_listings.host_id', hostId)
    .maybeSingle()
  return { admin, application: data }
}

async function loadRevealedProfiles(admin: Awaited<ReturnType<typeof createAdminClient>>, memberIds: string[]) {
  const { data: profiles } = await admin
    .from('profiles')
    .select('user_id, first_name, last_name, avatar_url, university_email, verification_status')
    .in('user_id', memberIds)
  return profiles || []
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })

  const parsed = actionSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { admin, application } = await loadOwnedApplication(id, hostReq.host.id)
  if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const listing = application.housing_listings as { id: string; title: string; host_id: string }
  const memberIds = [
    ...new Set([application.user_id, ...((application.group_members as string[]) || [])]),
  ] as string[]

  if (parsed.data.action === 'shortlist') {
    const { data, error } = await admin
      .from('housing_applications')
      .update({
        status: 'shortlisted',
        shortlisted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      await createNotificationsForUsers(
        memberIds,
        'housing_update',
        'Shortlisted',
        `You’ve been shortlisted for ${listing.title}`,
        {
          audience: 'student',
          listing_id: listing.id,
          application_id: id,
          link: '/housing/applications',
        }
      )
      for (const uid of memberIds) {
        const { data: u } = await admin.auth.admin.getUserById(uid)
        if (u.user?.email) {
          await emailStudentShortlisted({ to: u.user.email, listingTitle: listing.title })
        }
      }
    } catch (e) {
      safeLogger.warn('shortlist notify failed', { e })
    }

    return NextResponse.json({ application: data })
  }

  if (parsed.data.action === 'reject') {
    const { data, error } = await admin
      .from('housing_applications')
      .update({
        status: 'rejected',
        rejection_reason_code: parsed.data.rejection_reason_code,
        rejection_note: parsed.data.rejection_note || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: hostReq.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      await createNotificationsForUsers(
        memberIds,
        'housing_update',
        'Application update',
        `Update on ${listing.title}`,
        {
          audience: 'student',
          listing_id: listing.id,
          application_id: id,
          link: '/housing/applications',
        }
      )
      for (const uid of memberIds) {
        const { data: u } = await admin.auth.admin.getUserById(uid)
        if (u.user?.email) {
          await emailStudentNotSelected({ to: u.user.email, listingTitle: listing.title })
        }
      }
    } catch (e) {
      safeLogger.warn('reject notify failed', { e })
    }

    return NextResponse.json({ application: data })
  }

  // accept (and legacy `offer` mapped to accept) → reveal + unlock chat
  if (parsed.data.action === 'accept' || parsed.data.action === 'offer') {
    if (['rejected', 'withdrawn', 'offer_declined'].includes(application.status)) {
      return NextResponse.json({ error: 'Application cannot be accepted' }, { status: 400 })
    }

    let chatId = application.host_chat_id as string | null
    try {
      const chat = await ensureHostApplicantChat(admin, {
        hostUserId: hostReq.userId,
        applicantUserId: application.user_id,
        applicationId: id,
        listingTitle: listing.title,
      })
      chatId = chat.chatId
    } catch (e) {
      safeLogger.error('accept chat unlock failed', { e, applicationId: id })
      return NextResponse.json({ error: 'Failed to open chat' }, { status: 500 })
    }

    const { data, error } = await admin
      .from('housing_applications')
      .update({
        status: 'accepted',
        identity_revealed: true,
        accepted_at: new Date().toISOString(),
        host_chat_id: chatId,
        reviewed_at: new Date().toISOString(),
        reviewed_by: hostReq.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      await createNotificationsForUsers(
        memberIds,
        'housing_update',
        'Host wants to chat',
        `The host for ${listing.title} accepted your application — open chat to discuss details`,
        {
          audience: 'student',
          listing_id: listing.id,
          application_id: id,
          chat_id: chatId,
          link: `/chat?chatId=${chatId}`,
        }
      )
    } catch (e) {
      safeLogger.warn('accept notify failed', { e })
    }

    const profiles = await loadRevealedProfiles(admin, memberIds)
    return NextResponse.json({
      application: data,
      revealed_members: profiles,
      chat_id: chatId,
    })
  }

  // send_offer → formal lease offer (after chat)
  if (parsed.data.action === 'send_offer') {
    if (!['accepted', 'shortlisted', 'under_review', 'submitted'].includes(application.status) &&
        application.status !== 'offer_pending') {
      // Allow from accepted primarily; also tolerate early statuses if identity already revealed
      if (!application.identity_revealed && application.status !== 'accepted') {
        return NextResponse.json(
          { error: 'Accept the applicant and chat first, then send an offer' },
          { status: 400 }
        )
      }
    }
    if (application.status === 'accepted' || application.identity_revealed) {
      // ok
    } else {
      return NextResponse.json(
        { error: 'Accept the applicant and chat first, then send an offer' },
        { status: 400 }
      )
    }

    const { data, error } = await admin
      .from('housing_applications')
      .update({
        status: 'offer_pending',
        offer_made_at: new Date().toISOString(),
        identity_revealed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      await createNotificationsForUsers(
        memberIds,
        'housing_update',
        'Offer received',
        `You received an offer for ${listing.title}`,
        {
          audience: 'student',
          listing_id: listing.id,
          application_id: id,
          link: '/housing/applications',
        }
      )
      for (const uid of memberIds) {
        const { data: u } = await admin.auth.admin.getUserById(uid)
        if (u.user?.email) {
          await emailOfferReceived({ to: u.user.email, listingTitle: listing.title })
        }
      }
    } catch (e) {
      safeLogger.warn('send_offer notify failed', { e })
    }

    const profiles = await loadRevealedProfiles(admin, memberIds)
    return NextResponse.json({ application: data, revealed_members: profiles })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Student accept/decline offer
  const { id } = await params
  const body = z
    .object({ action: z.enum(['accept_offer', 'decline_offer']) })
    .safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { data: application } = await admin
    .from('housing_applications')
    .select('*, housing_listings(id, title, host_id, host_profiles(user_id))')
    .eq('id', id)
    .maybeSingle()

  if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const members = [application.user_id, ...((application.group_members as string[]) || [])]
  if (!members.includes(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (application.status !== 'offer_pending') {
    return NextResponse.json({ error: 'No pending offer' }, { status: 400 })
  }

  const accept = body.data.action === 'accept_offer'
  const { data, error } = await admin
    .from('housing_applications')
    .update({
      status: accept ? 'offer_accepted' : 'offer_declined',
      offer_accepted_at: accept ? new Date().toISOString() : null,
      offer_declined_at: accept ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (accept) {
    const hostUserId = (application.housing_listings as any)?.host_profiles?.user_id
    const title = (application.housing_listings as any)?.title || 'your listing'
    if (hostUserId) {
      try {
        await createNotification({
          user_id: hostUserId,
          type: 'housing_update',
          title: 'Offer accepted',
          message: `Your offer for ${title} was accepted`,
          metadata: {
            audience: 'host',
            application_id: id,
            listing_id: (application.housing_listings as { id?: string } | null)?.id,
            link: '/host/applications',
          },
        })
        const { emailOfferAcceptedHost } = await import('@/lib/email/housing')
        const { data: hostUser } = await admin.auth.admin.getUserById(hostUserId)
        if (hostUser.user?.email) {
          await emailOfferAcceptedHost({ to: hostUser.user.email, listingTitle: title })
        }
      } catch (e) {
        safeLogger.warn('accept notify failed', { e })
      }
    }
  }

  return NextResponse.json({ application: data })
}
