import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications/create'
import { emailViewingInviteStudent, emailViewingRequestedHost } from '@/lib/email/housing'
import { safeLogger } from '@/lib/utils/logger'
import {
  normalizeProposedSlots,
  serializeViewingRow,
  toViewingSlotIso,
  viewingSlotSchema,
} from '@/lib/housing/viewing-slots'

const patchSchema = z.union([
  z.object({
    action: z.literal('confirm'),
    /** Exact slot both parties agree on (must match one of the open proposals when present). */
    scheduled_for: viewingSlotSchema.optional(),
  }),
  z.object({
    action: z.literal('propose'),
    proposed_slots: z.array(viewingSlotSchema).min(1).max(5),
    notes: z.string().max(2000).optional(),
  }),
  z.object({
    action: z.literal('cancel'),
  }),
  // Legacy shape still accepted
  z.object({
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
    scheduled_for: viewingSlotSchema.optional(),
    host_notes: z.string().max(2000).optional(),
  }),
])

function amsterdamList(slots: string[]) {
  return slots
    .map((s) => new Date(s).toLocaleString('en-GB', { timeZone: 'Europe/Amsterdam' }))
    .join('; ')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = patchSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { data: viewing } = await admin
    .from('tour_bookings')
    .select('*, housing_listings(id, title, host_id, host_profiles(user_id))')
    .eq('id', id)
    .maybeSingle()

  if (!viewing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const listing = viewing.housing_listings as {
    id?: string
    title?: string
    host_profiles?: { user_id?: string } | null
  } | null
  const hostUserId = listing?.host_profiles?.user_id
  const isHost = hostUserId === user.id
  const isStudent = viewing.user_id === user.id
  if (!isHost && !isStudent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const title = listing?.title || 'listing'
  const listingId = listing?.id
  const actor: 'host' | 'student' = isHost ? 'host' : 'student'
  const otherUserId = isHost ? (viewing.user_id as string) : hostUserId

  let update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  let notifyKind: 'confirmed' | 'proposed' | 'cancelled' | null = null
  let notifySlots: string[] = []

  const body = parsed.data

  if ('action' in body && body.action === 'confirm') {
    if (viewing.status !== 'scheduled') {
      return NextResponse.json({ error: 'Viewing is not awaiting agreement' }, { status: 400 })
    }
    const existingSlots = normalizeProposedSlots(
      Array.isArray(viewing.proposed_slots) && viewing.proposed_slots.length
        ? (viewing.proposed_slots as unknown[])
        : [viewing.scheduled_for]
    )
    const chosen =
      body.scheduled_for ||
      toViewingSlotIso(viewing.scheduled_for) ||
      existingSlots[0]

    if (!chosen || !existingSlots.some((s) => s === chosen)) {
      return NextResponse.json(
        { error: 'Pick one of the proposed times, or propose new times instead' },
        { status: 400 }
      )
    }

    // The party who last proposed must wait — the other party accepts a slot to lock agreement
    if (viewing.proposed_by === actor) {
      return NextResponse.json(
        { error: 'Wait for the other party to accept a time, or send a new proposal' },
        { status: 400 }
      )
    }

    update = {
      ...update,
      status: 'confirmed',
      scheduled_for: chosen,
      proposed_slots: [chosen],
      proposed_by: actor,
    }
    notifyKind = 'confirmed'
    notifySlots = [chosen]
  } else if ('action' in body && body.action === 'propose') {
    if (viewing.status === 'cancelled' || viewing.status === 'completed') {
      return NextResponse.json({ error: 'Viewing cannot be updated' }, { status: 400 })
    }
    const slots = normalizeProposedSlots(body.proposed_slots)
    if (!slots.length) {
      return NextResponse.json({ error: 'Provide at least one valid time' }, { status: 400 })
    }
    const now = Date.now()
    if (slots.some((s) => new Date(s).getTime() < now + 30 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Proposed times must be at least 30 minutes from now' },
        { status: 400 }
      )
    }
    update = {
      ...update,
      status: 'scheduled',
      scheduled_for: slots[0],
      proposed_slots: slots,
      proposed_by: actor,
      ...(isHost && body.notes != null ? { host_notes: body.notes } : {}),
      ...(!isHost && body.notes != null ? { notes: body.notes } : {}),
    }
    notifyKind = 'proposed'
    notifySlots = slots
  } else if ('action' in body && body.action === 'cancel') {
    update = { ...update, status: 'cancelled' }
    notifyKind = 'cancelled'
    notifySlots = [viewing.scheduled_for as string]
  } else if (!('action' in body)) {
    // Legacy PATCH
    if (body.status) update.status = body.status
    if (body.scheduled_for) {
      update.scheduled_for = body.scheduled_for
      update.proposed_slots = [body.scheduled_for]
    }
    if (body.host_notes != null && isHost) update.host_notes = body.host_notes
    if (body.status === 'confirmed') {
      notifyKind = 'confirmed'
      notifySlots = [(body.scheduled_for || viewing.scheduled_for) as string]
      update.proposed_slots = notifySlots
    }
  }

  const { data, error } = await admin
    .from('tour_bookings')
    .update(update)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (notifyKind && otherUserId) {
    try {
      const datetime = amsterdamList(notifySlots)
      if (notifyKind === 'confirmed') {
        await createNotification({
          user_id: otherUserId,
          type: 'housing_update',
          title: 'Viewing confirmed',
          message: `Viewing confirmed for ${title} on ${datetime}`,
          metadata: {
            audience: isHost ? 'student' : 'host',
            viewing_id: id,
            listing_id: listingId,
            link: isHost ? '/housing/viewings' : '/host/viewings',
          },
        })
        if (isHost) {
          const { data: student } = await admin.auth.admin.getUserById(otherUserId)
          if (student.user?.email) {
            await emailViewingInviteStudent({
              to: student.user.email,
              listingTitle: title,
              datetime,
            })
          }
        }
      } else if (notifyKind === 'proposed') {
        await createNotification({
          user_id: otherUserId,
          type: 'housing_update',
          title: isHost ? 'New viewing times from host' : 'Viewing times updated',
          message: `${isHost ? 'Host' : 'Applicant'} proposed new times for ${title}`,
          metadata: {
            audience: isHost ? 'student' : 'host',
            viewing_id: id,
            listing_id: listingId,
            link: isHost ? '/housing/viewings' : '/host/viewings',
          },
        })
        const { data: other } = await admin.auth.admin.getUserById(otherUserId)
        if (other.user?.email) {
          if (isHost) {
            await emailViewingInviteStudent({
              to: other.user.email,
              listingTitle: title,
              datetime,
            })
          } else {
            await emailViewingRequestedHost({
              to: other.user.email,
              listingTitle: title,
              datetime,
            })
          }
        }
      } else if (notifyKind === 'cancelled') {
        await createNotification({
          user_id: otherUserId,
          type: 'housing_update',
          title: 'Viewing cancelled',
          message: `Viewing for ${title} was cancelled`,
          metadata: {
            audience: isHost ? 'student' : 'host',
            viewing_id: id,
            listing_id: listingId,
            link: isHost ? '/housing/viewings' : '/host/viewings',
          },
        })
      }
    } catch (e) {
      safeLogger.warn('viewing patch notify failed', { e })
    }
  }

  return NextResponse.json({ viewing: serializeViewingRow(data as Record<string, unknown>) })
}
