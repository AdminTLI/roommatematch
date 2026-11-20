import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { loadMemberHousingSignals } from '@/lib/housing/applicant-signals'
import {
  anonymousApplicantLabel,
  scoreGroupAgainstListing,
} from '@/lib/housing/group-listing-score'
import { getGroupCohesionScore } from '@/lib/group-compatibility/v2-calculator'
import { createNotification } from '@/lib/notifications/create'
import {
  emailHostNewApplication,
  emailStudentApplicationReceived,
} from '@/lib/email/housing'
import { safeLogger } from '@/lib/utils/logger'
import { listingAllowsStudentActions } from '@/lib/host/assert-verified-for-listing'
import { sendHousingCoApplyDirectMessages } from '@/lib/chat/send-housing-co-apply-dms'
import {
  APPLICATION_STATUSES_NOT_COUNTING_TOWARD_CAP,
  MAX_GROUP_APPLICATIONS_PER_LISTING,
  MAX_INDIVIDUAL_APPLICATIONS_PER_LISTING,
  sameParty,
  sortMemberIds,
} from '@/lib/housing/application-limits'
import { resolveListingPhotoUrls } from '@/lib/housing/photos'

const applySchema = z.object({
  listing_id: z.string().uuid(),
  application_type: z.enum(['individual', 'group']).default('individual'),
  group_members: z.array(z.string().uuid()).optional(),
  chat_id: z.string().uuid().optional().nullable(),
  motivation_letter: z.string().max(5000).optional(),
})

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('housing_applications')
    .select('*, housing_listings(id, title, city, rent_monthly, photos, host_type, status)')
    .or(`user_id.eq.${user.id},group_members.cs.{${user.id}}`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ applications: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = applySchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { listing_id, application_type, chat_id, motivation_letter } = parsed.data

  const actionGate = await listingAllowsStudentActions(listing_id)
  if (!actionGate.ok) {
    return NextResponse.json(
      { error: 'host_unverified', message: 'Host has not verified their email yet' },
      { status: 403 }
    )
  }

  let memberIds =
    application_type === 'group'
      ? [...new Set([user.id, ...(parsed.data.group_members || [])])]
      : [user.id]

  const admin = await createAdminClient()

  const { data: listing, error: listingErr } = await admin
    .from('housing_listings')
    .select('*, host_profiles(id, user_id, display_name)')
    .eq('id', listing_id)
    .maybeSingle()

  if (listingErr || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }
  if (
    listing.status === 'archived' ||
    listing.status === 'suspended' ||
    listing.status === 'expired' ||
    listing.moderation_status === 'rejected'
  ) {
    return NextResponse.json({ error: 'Listing unavailable' }, { status: 400 })
  }
  if (listing.moderation_status !== 'approved' || listing.status !== 'active') {
    return NextResponse.json({ error: 'Listing unavailable' }, { status: 400 })
  }

  const seekingPeople = Math.max(
    1,
    Number(listing.seeking_people || listing.available_rooms || 1)
  )

  // Group apply: require unanimous votes if chat_id provided
  if (application_type === 'group' && chat_id) {
    const { data: members } = await admin
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chat_id)
      .eq('status', 'active')
    const activeIds = (members || []).map((m) => m.user_id as string)
    if (!activeIds.includes(user.id)) {
      return NextResponse.json({ error: 'Not an active group member' }, { status: 403 })
    }
    memberIds = activeIds

    const { data: votes } = await admin
      .from('group_listing_votes')
      .select('user_id, vote')
      .eq('chat_id', chat_id)
      .eq('listing_id', listing_id)

    const approved = new Set(
      (votes || []).filter((v) => v.vote === 'approve').map((v) => v.user_id as string)
    )
    const allApproved = activeIds.every((id) => approved.has(id))
    if (!allApproved) {
      return NextResponse.json(
        { error: 'Group must unanimously approve this listing before applying' },
        { status: 400 }
      )
    }
  }

  if (application_type === 'group') {
    if (seekingPeople < 2) {
      return NextResponse.json(
        { error: 'This listing is only accepting individual applications' },
        { status: 400 }
      )
    }
    if (memberIds.length < 2) {
      return NextResponse.json(
        { error: 'Select at least one other person to apply as a group' },
        { status: 400 }
      )
    }
    if (memberIds.length > seekingPeople) {
      return NextResponse.json(
        {
          error: `This listing is looking for ${seekingPeople} ${seekingPeople === 1 ? 'person' : 'people'}. Your party of ${memberIds.length} is too large.`,
        },
        { status: 400 }
      )
    }
  }

  // Stable order for duplicate-party uniqueness + scoring
  memberIds = sortMemberIds(memberIds)

  const { data: priorApps, error: priorErr } = await admin
    .from('housing_applications')
    .select('id, application_type, group_members, chat_id, status')
    .eq('listing_id', listing_id)
    .eq('user_id', user.id)

  if (priorErr) {
    return NextResponse.json({ error: priorErr.message }, { status: 500 })
  }

  const activePrior = (priorApps || []).filter(
    (app) =>
      !APPLICATION_STATUSES_NOT_COUNTING_TOWARD_CAP.includes(
        app.status as (typeof APPLICATION_STATUSES_NOT_COUNTING_TOWARD_CAP)[number]
      )
  )

  if (application_type === 'individual') {
    const individualCount = activePrior.filter((a) => a.application_type === 'individual').length
    if (individualCount >= MAX_INDIVIDUAL_APPLICATIONS_PER_LISTING) {
      return NextResponse.json(
        {
          error: `You already applied individually to this listing (limit ${MAX_INDIVIDUAL_APPLICATIONS_PER_LISTING}). You can still apply with different groups.`,
        },
        { status: 409 }
      )
    }
  } else {
    const groupApps = activePrior.filter((a) => a.application_type === 'group')
    if (groupApps.length >= MAX_GROUP_APPLICATIONS_PER_LISTING) {
      return NextResponse.json(
        {
          error: `You can apply with up to ${MAX_GROUP_APPLICATIONS_PER_LISTING} different groups on this listing. Withdraw an existing group application to try another party.`,
        },
        { status: 409 }
      )
    }
    const duplicateParty = groupApps.some((app) => {
      if (chat_id && app.chat_id === chat_id) return true
      return sameParty(app.group_members as string[] | null, memberIds)
    })
    if (duplicateParty) {
      return NextResponse.json(
        {
          error:
            'You already applied to this listing with this same group. Choose different people or another group.',
        },
        { status: 409 }
      )
    }
  }

  const signals = await loadMemberHousingSignals(memberIds)
  const cohesion = await getGroupCohesionScore(chat_id, memberIds)
  const scored = scoreGroupAgainstListing(
    signals,
    {
      rentMonthly: Number(listing.rent_monthly),
      availableRooms: Number(listing.available_rooms),
      seekingPeople: Number(listing.seeking_people || listing.available_rooms || 1),
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

  // Anonymous index: count existing apps on listing
  const { count } = await admin
    .from('housing_applications')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listing_id)
  const label = anonymousApplicantLabel(count || 0, scored.groupSize)

  const { data: application, error } = await admin
    .from('housing_applications')
    .insert({
      listing_id,
      user_id: user.id,
      application_type,
      group_members: memberIds,
      chat_id: chat_id || null,
      status: 'submitted',
      motivation_letter: motivation_letter || null,
      anonymous_label: label,
      fit_score: scored.overall,
      cohesion_score: scored.cohesion,
      score_breakdown: scored.breakdown,
      score_insights: scored.insights,
      watch_outs: scored.watchOuts,
      hard_gates_passed: scored.hardGatesPassed,
      verification_badges: scored.verificationBadges,
      group_size: scored.groupSize,
      identity_revealed: false,
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        {
          error:
            application_type === 'individual'
              ? `You already applied individually to this listing (limit ${MAX_INDIVIDUAL_APPLICATIONS_PER_LISTING}).`
              : 'You already applied to this listing with this same group. Choose different people or another group.',
        },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const scorePct = Math.round(scored.overall * 100)
  const listingHref = `/housing/${listing_id}`
  const hostListingHref = `/host/listings/${listing_id}`
  const resolvedPhotos = await resolveListingPhotoUrls(listing.photos)
  const listingPhoto = resolvedPhotos[0] || null

  const { data: applicantProfile } = await admin
    .from('profiles')
    .select('first_name, last_name')
    .eq('user_id', user.id)
    .maybeSingle()
  const applicantName =
    [applicantProfile?.first_name, applicantProfile?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim() || null

  const coApplicantIds = memberIds.filter((id) => id !== user.id)

  // Notify submitter + co-applicants (different copy / deep links)
  for (const memberId of memberIds) {
    const isSubmitter = memberId === user.id
    try {
      if (isSubmitter) {
        await createNotification({
          user_id: memberId,
          type: 'housing_update',
          title: 'Application sent',
          message: `Your application for ${listing.title} was submitted.`,
          metadata: {
            audience: 'student',
            listing_id,
            application_id: application.id,
            link: '/housing/applications',
          },
        })
      } else {
        await createNotification({
          user_id: memberId,
          type: 'housing_update',
          title: 'Included in an application',
          message: `${applicantName || 'A roommate'} applied for ${listing.title} with you.`,
          metadata: {
            audience: 'student',
            listing_id,
            application_id: application.id,
            applied_on_behalf: true,
            link: listingHref,
          },
        })
      }
    } catch (e) {
      safeLogger.warn('notif failed', { e })
    }
  }

  // Interactive chat cards for co-applicants (ad-hoc people selection, or
  // any group apply that named extra members without requiring them to vote first)
  if (application_type === 'group' && coApplicantIds.length > 0 && !chat_id) {
    try {
      await sendHousingCoApplyDirectMessages(admin, {
        listingId: listing_id,
        listingTitle: listing.title || 'Housing listing',
        listingCity: (listing.city as string | null) || null,
        listingRentMonthly:
          listing.rent_monthly != null ? Number(listing.rent_monthly) : null,
        listingPhoto,
        applicationId: application.id,
        applicantId: user.id,
        applicantName,
        groupSize: scored.groupSize,
        coApplicantIds,
      })
    } catch (e) {
      safeLogger.warn('housing co-apply DMs failed', { e })
    }
  }

  // Notify host — deep-link to the listing that received the application
  const hostUserId = (listing.host_profiles as { user_id?: string } | null)?.user_id
  if (hostUserId) {
    try {
      await createNotification({
        user_id: hostUserId,
        type: 'housing_update',
        title: 'New application',
        message: `${label} · ${scorePct}% fit for ${listing.title}`,
        metadata: {
          audience: 'host',
          listing_id,
          application_id: application.id,
          anonymous: true,
          link: hostListingHref,
        },
      })
    } catch (e) {
      safeLogger.warn('host notif failed', { e })
    }
  }

  // Emails
  try {
    const { data: applicant } = await admin.auth.admin.getUserById(user.id)
    if (applicant.user?.email) {
      await emailStudentApplicationReceived({
        to: applicant.user.email,
        listingTitle: listing.title,
      })
    }
    if (hostUserId) {
      const { data: hostUser } = await admin.auth.admin.getUserById(hostUserId)
      if (hostUser.user?.email) {
        await emailHostNewApplication({
          to: hostUser.user.email,
          listingTitle: listing.title,
          scorePct,
          isGroup: application_type === 'group',
          groupSize: scored.groupSize,
        })
      }
    }
  } catch (e) {
    safeLogger.warn('housing email failed', { e })
  }

  return NextResponse.json(
    {
      application: {
        ...application,
        // never return other members' PII beyond ids to applicant's own view
      },
    },
    { status: 201 }
  )
}
