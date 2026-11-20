import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications/create'
import { emailViewingInviteStudent, emailViewingRequestedHost } from '@/lib/email/housing'
import { safeLogger } from '@/lib/utils/logger'
import { listingAllowsStudentActions } from '@/lib/host/assert-verified-for-listing'
import {
  normalizeProposedSlots,
  serializeViewingRow,
  viewingSlotSchema,
} from '@/lib/housing/viewing-slots'

const createSchema = z
  .object({
    listing_id: z.string().uuid(),
    application_id: z.string().uuid().optional(),
    tour_type: z.enum(['in_person', 'virtual', 'video_call']).default('in_person'),
    scheduled_for: viewingSlotSchema.optional(),
    proposed_slots: z.array(viewingSlotSchema).min(1).max(5).optional(),
    duration_minutes: z.number().int().min(15).max(180).optional(),
    notes: z.string().max(2000).optional(),
    special_requests: z.string().max(2000).optional(),
    attendees_count: z.number().int().min(1).max(20).optional(),
    proposed_by: z.enum(['student', 'host']).default('student'),
  })
  .superRefine((val, ctx) => {
    if (!val.proposed_slots?.length && !val.scheduled_for) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide at least one proposed time',
        path: ['proposed_slots'],
      })
    }
  })

const HOST_SELECT =
  'id, listing_id, application_id, tour_type, scheduled_for, proposed_slots, duration_minutes, status, anonymous_label, notes, proposed_by, created_at, housing_listings(title)'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const asHost = request.nextUrl.searchParams.get('as') === 'host'
  const admin = await createAdminClient()

  if (asHost) {
    const { data: host } = await admin
      .from('host_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!host) return NextResponse.json({ viewings: [] })

    const { data: listings } = await admin
      .from('housing_listings')
      .select('id')
      .eq('host_id', host.id)
    const ids = (listings || []).map((l) => l.id)
    if (!ids.length) return NextResponse.json({ viewings: [] })

    const { data, error } = await admin
      .from('tour_bookings')
      .select(HOST_SELECT)
      .in('listing_id', ids)
      .order('scheduled_for', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({
      viewings: (data || []).map((v) =>
        serializeViewingRow({
          ...v,
          user_id: undefined,
          contact_name: undefined,
          contact_phone: undefined,
          contact_email: undefined,
        } as Record<string, unknown>)
      ),
    })
  }

  const { data, error } = await admin
    .from('tour_bookings')
    .select('*, housing_listings(title, city, address)')
    .eq('user_id', user.id)
    .order('scheduled_for', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    viewings: (data || []).map((v) => serializeViewingRow(v as Record<string, unknown>)),
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.proposed_by === 'student') {
    const actionGate = await listingAllowsStudentActions(parsed.data.listing_id)
    if (!actionGate.ok) {
      return NextResponse.json(
        { error: 'host_unverified', message: 'Host has not verified their email yet' },
        { status: 403 }
      )
    }
  }

  const slots = normalizeProposedSlots(
    parsed.data.proposed_slots?.length
      ? parsed.data.proposed_slots
      : parsed.data.scheduled_for
        ? [parsed.data.scheduled_for]
        : []
  )
  if (!slots.length) {
    return NextResponse.json({ error: 'Provide at least one valid proposed time' }, { status: 400 })
  }

  const now = Date.now()
  if (slots.some((s) => new Date(s).getTime() < now + 30 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Proposed times must be at least 30 minutes from now' },
      { status: 400 }
    )
  }

  const admin = await createAdminClient()
  const { data: listing } = await admin
    .from('housing_listings')
    .select('id, title, host_id, host_profiles(user_id)')
    .eq('id', parsed.data.listing_id)
    .maybeSingle()
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  let anonymous_label = 'Applicant'
  if (parsed.data.application_id) {
    const { data: app } = await admin
      .from('housing_applications')
      .select('anonymous_label, user_id, group_members')
      .eq('id', parsed.data.application_id)
      .maybeSingle()
    if (app) anonymous_label = app.anonymous_label || anonymous_label
  }

  const { data: booking, error } = await admin
    .from('tour_bookings')
    .insert({
      listing_id: parsed.data.listing_id,
      user_id: user.id,
      application_id: parsed.data.application_id || null,
      tour_type: parsed.data.tour_type,
      scheduled_for: slots[0],
      proposed_slots: slots,
      duration_minutes: parsed.data.duration_minutes || 30,
      status: 'scheduled',
      notes: parsed.data.notes || null,
      special_requests: parsed.data.special_requests || null,
      attendees_count: parsed.data.attendees_count || 1,
      proposed_by: parsed.data.proposed_by,
      anonymous_label,
      contact_email: user.email,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const datetime = slots.map((s) =>
    new Date(s).toLocaleString('en-GB', { timeZone: 'Europe/Amsterdam' })
  ).join('; ')

  try {
    if (parsed.data.proposed_by === 'student') {
      const hostUserId = (listing.host_profiles as { user_id?: string } | null)?.user_id
      if (hostUserId) {
        await createNotification({
          user_id: hostUserId,
          type: 'housing_update',
          title: 'Viewing requested',
          message: `${anonymous_label} proposed ${slots.length} time${slots.length === 1 ? '' : 's'} for ${listing.title}`,
          metadata: {
            audience: 'host',
            listing_id: listing.id,
            viewing_id: booking.id,
            link: '/host/viewings',
          },
        })
        const { data: hostUser } = await admin.auth.admin.getUserById(hostUserId)
        if (hostUser.user?.email) {
          await emailViewingRequestedHost({
            to: hostUser.user.email,
            listingTitle: listing.title,
            datetime,
          })
        }
      }
    } else {
      const studentId = booking.user_id as string
      await createNotification({
        user_id: studentId,
        type: 'housing_update',
        title: 'Viewing invite',
        message: `Host proposed times for ${listing.title}`,
        metadata: {
          audience: 'student',
          listing_id: listing.id,
          viewing_id: booking.id,
          link: '/housing/viewings',
        },
      })
      const { data: student } = await admin.auth.admin.getUserById(studentId)
      if (student.user?.email) {
        await emailViewingInviteStudent({
          to: student.user.email,
          listingTitle: listing.title,
          datetime,
        })
      }
    }
  } catch (e) {
    safeLogger.warn('viewing notify failed', { e })
  }

  return NextResponse.json(
    { viewing: serializeViewingRow(booking as Record<string, unknown>) },
    { status: 201 }
  )
}
