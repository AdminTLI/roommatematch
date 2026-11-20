import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { resolveListingHostDisplayName } from '@/lib/host/display-name'
import { HOST_TYPE_LABELS, type HostType } from '@/lib/host/types'
import { isHostVerified } from '@/lib/host/verification'
import { loadMemberHousingSignals } from '@/lib/housing/applicant-signals'
import { scoreGroupAgainstListing } from '@/lib/housing/group-listing-score'
import { buildHostListingFitInsights } from '@/lib/housing/host-listing-fit-insights'
import { formatNlDate } from '@/lib/housing/format'
import {
  composeStreetLine,
  normalizeAmenityList,
} from '@/lib/housing/listing-location'
import { resolveHostAvatarUrl, resolveListingPhotoUrls } from '@/lib/housing/photos'
import type { ListingDealbreakers, ListingLifestylePrefs } from '@/lib/host/types'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/chat/housing-context?chatId=
 * Student (or host) member of a host↔applicant chat: listing + host + fit context.
 * Hosts get applicant-facing fit copy; applicants get listing/host fit copy.
 */
export async function GET(request: NextRequest) {
  try {
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

    const admin = await createAdminClient()

    const { data: membership } = await admin
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this chat' }, { status: 403 })
    }

    const { data: chat, error: chatError } = await admin
      .from('chats')
      .select('id, housing_application_id')
      .eq('id', chatId)
      .maybeSingle()

    if (chatError || !chat?.housing_application_id) {
      return NextResponse.json(
        { error: 'This chat is not linked to a housing application' },
        { status: 404 },
      )
    }

    const { data: application, error: appError } = await admin
      .from('housing_applications')
      .select(
        `
        id,
        status,
        fit_score,
        cohesion_score,
        watch_outs,
        score_breakdown,
        user_id,
        group_members,
        group_size,
        anonymous_label,
        verification_badges,
        identity_revealed,
        hard_gates_passed,
        motivation_letter,
        application_type,
        listing_id,
        housing_listings (
          id,
          title,
          description,
          city,
          address,
          rent_monthly,
          utilities_included,
          room_type,
          available_from,
          min_stay_months,
          furnished,
          pet_friendly,
          smoking_allowed,
          amenities,
          photos,
          available_rooms,
          seeking_people,
          total_rooms,
          lifestyle_prefs,
          dealbreakers,
          max_stay_months,
          landlord_name,
          agency_name,
          host_id,
          host_profiles (
            id,
            display_name,
            host_type,
            company_name,
            bio,
            avatar_path,
            email_verified,
            id_verified,
            kvk_number
          )
        )
      `,
      )
      .eq('id', chat.housing_application_id)
      .maybeSingle()

    if (appError || !application) {
      safeLogger.warn('[housing-context] application not found', {
        chatId,
        applicationId: chat.housing_application_id,
        error: appError,
      })
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const listingRaw = application.housing_listings as
      | Record<string, unknown>
      | Record<string, unknown>[]
      | null
    const listing = (Array.isArray(listingRaw) ? listingRaw[0] : listingRaw) as
      | Record<string, unknown>
      | null

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const hostRaw = listing.host_profiles as
      | Record<string, unknown>
      | Record<string, unknown>[]
      | null
    const host = (Array.isArray(hostRaw) ? hostRaw[0] : hostRaw) as
      | Record<string, unknown>
      | null

    const hostType =
      typeof host?.host_type === 'string' ? (host.host_type as HostType) : null
    const hostDisplayName = resolveListingHostDisplayName({
      landlordName: typeof listing.landlord_name === 'string' ? listing.landlord_name : null,
      hostDisplayName: typeof host?.display_name === 'string' ? host.display_name : null,
      agencyName: typeof listing.agency_name === 'string' ? listing.agency_name : null,
      hostCompanyName: typeof host?.company_name === 'string' ? host.company_name : null,
    })

    const [photos, hostAvatarUrl] = await Promise.all([
      resolveListingPhotoUrls(listing.photos),
      resolveHostAvatarUrl(
        typeof host?.avatar_path === 'string' ? host.avatar_path : null,
      ),
    ])

    const amenities = normalizeAmenityList(listing.amenities)
    const address = composeStreetLine({
      address: typeof listing.address === 'string' ? listing.address : null,
      city: typeof listing.city === 'string' ? listing.city : null,
    })

    let fitScore =
      typeof application.fit_score === 'number' && Number.isFinite(application.fit_score)
        ? application.fit_score
        : null
    let scoreBreakdown =
      application.score_breakdown &&
      typeof application.score_breakdown === 'object' &&
      !Array.isArray(application.score_breakdown)
        ? (application.score_breakdown as Record<string, number>)
        : null
    let watchOuts = Array.isArray(application.watch_outs)
      ? (application.watch_outs as string[]).filter((s) => typeof s === 'string')
      : []
    let applicantInsights: {
      overall: string | null
      lifestyle: string | null
      budget: string | null
      timeline: string | null
    } | null = null
    let gateConflicts: string[] = []

    const partyIds = [
      application.user_id as string,
      ...((application.group_members as string[] | null) || []),
    ].filter(Boolean)
    const uniqueParty = [...new Set(partyIds)]
    const isApplicantViewer = uniqueParty.includes(user.id)
    const groupSize = Number(application.group_size) || uniqueParty.length || 1

    const { data: viewerHostProfile } = await admin
      .from('host_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    const listingHostId = typeof listing.host_id === 'string' ? listing.host_id : null
    const isHostViewer = Boolean(
      viewerHostProfile?.id && listingHostId && viewerHostProfile.id === listingHostId,
    )
    const viewerRole: 'host' | 'applicant' = isHostViewer
      ? 'host'
      : isApplicantViewer
        ? 'applicant'
        : 'applicant'

    // Always score the applicant party against the listing (never the host viewer)
    try {
      const signals = await loadMemberHousingSignals(uniqueParty)
      if (signals.length > 0) {
        const scored = scoreGroupAgainstListing(signals, {
          rentMonthly: Number(listing.rent_monthly) || 0,
          availableRooms: Number(listing.available_rooms) || 1,
          seekingPeople:
            Number(listing.seeking_people) || Number(listing.available_rooms) || 1,
          petFriendly: Boolean(listing.pet_friendly),
          smokingAllowed: Boolean(listing.smoking_allowed),
          lifestylePrefs: (listing.lifestyle_prefs || null) as ListingLifestylePrefs | null,
          dealbreakers: (listing.dealbreakers || null) as ListingDealbreakers | null,
          availableFrom:
            typeof listing.available_from === 'string' ? listing.available_from : null,
          minStayMonths:
            typeof listing.min_stay_months === 'number' ? listing.min_stay_months : null,
          maxStayMonths:
            typeof listing.max_stay_months === 'number' ? listing.max_stay_months : null,
          amenities,
        })
        // Prefer live score so formula changes (e.g. dealbreaker weights) show immediately
        fitScore = scored.overall
        scoreBreakdown = {
          lifestyle: scored.breakdown.lifestyle,
          budget: scored.breakdown.budget,
          timeline: scored.breakdown.timeline,
          capacity: scored.breakdown.capacity,
          amenities: scored.breakdown.amenities,
          cohesion: scored.cohesion,
        }
        watchOuts = scored.watchOuts || []
        gateConflicts = scored.gateConflicts || []
        applicantInsights = {
          overall: scored.insights.overall || null,
          lifestyle: scored.insights.lifestyle || null,
          budget: scored.insights.budget || null,
          timeline: scored.insights.timeline || null,
        }
      }
    } catch (e) {
      safeLogger.warn('[housing-context] live scoring failed', { e })
    }

    const hostInsights =
      scoreBreakdown || fitScore != null
        ? buildHostListingFitInsights(
            {
              lifestyle: scoreBreakdown?.lifestyle,
              budget: scoreBreakdown?.budget,
              timeline: scoreBreakdown?.timeline,
              capacity: scoreBreakdown?.capacity,
              amenities: scoreBreakdown?.amenities,
              cohesion: scoreBreakdown?.cohesion,
            },
            fitScore,
            { groupSize },
          )
        : null

    const insights =
      viewerRole === 'host'
        ? hostInsights
          ? {
              overall: hostInsights.overall,
              lifestyle: hostInsights.lifestyle,
              budget: hostInsights.budget,
              timeline: hostInsights.timeline,
              capacity: hostInsights.capacity,
              amenities: hostInsights.amenities,
              cohesion: hostInsights.cohesion,
            }
          : null
        : applicantInsights

    let applicantPayload: {
      display_name: string
      avatar_url: string | null
      anonymous_label: string
      group_size: number
      verification_badges: string[]
      identity_revealed: boolean
      hard_gates_passed: boolean
      motivation_letter: string | null
      application_type: string | null
      verified: boolean
      bio: string | null
      interests: string[]
      university: string | null
      program: string | null
      degree_level: string | null
      study_year: number | null
    } | null = null

    if (viewerRole === 'host') {
      const identityRevealed = Boolean(application.identity_revealed)
      const [{ data: applicantProfile }, { data: academic }] = await Promise.all([
        admin
          .from('profiles')
          .select(
            'first_name, last_name, avatar_url, verification_status, bio, interests, program, degree_level, universities!profiles_university_id_fkey(name)',
          )
          .eq('user_id', application.user_id)
          .maybeSingle(),
        admin
          .from('user_academic')
          .select(
            'degree_level, study_start_year, universities!user_academic_university_id_fkey(name), programs!user_academic_program_id_fkey(name, name_en)',
          )
          .eq('user_id', application.user_id)
          .maybeSingle(),
      ])

      const anonymousLabel =
        (typeof application.anonymous_label === 'string' && application.anonymous_label.trim()) ||
        'Applicant'
      const revealedName = applicantProfile
        ? [applicantProfile.first_name, applicantProfile.last_name].filter(Boolean).join(' ')
        : ''
      const badges = Array.isArray(application.verification_badges)
        ? (application.verification_badges as string[]).filter((b) => typeof b === 'string')
        : []
      const motivation =
        typeof application.motivation_letter === 'string' && application.motivation_letter.trim()
          ? application.motivation_letter.trim().slice(0, 1200)
          : null

      const profileUni = Array.isArray(applicantProfile?.universities)
        ? applicantProfile?.universities[0]
        : applicantProfile?.universities
      const academicUni = Array.isArray(academic?.universities)
        ? academic?.universities[0]
        : academic?.universities
      const academicProg = Array.isArray(academic?.programs)
        ? academic?.programs[0]
        : academic?.programs
      const interests = Array.isArray(applicantProfile?.interests)
        ? (applicantProfile.interests as unknown[])
            .filter((i): i is string => typeof i === 'string' && i.trim().length > 0)
            .map((i) => i.trim())
            .slice(0, 12)
        : []
      const studyYear =
        typeof academic?.study_start_year === 'number' && Number.isFinite(academic.study_start_year)
          ? academic.study_start_year
          : null

      applicantPayload = {
        display_name: identityRevealed && revealedName ? revealedName : anonymousLabel,
        avatar_url: identityRevealed ? applicantProfile?.avatar_url || null : null,
        anonymous_label: anonymousLabel,
        group_size: groupSize,
        verification_badges: badges.slice(0, 6),
        identity_revealed: identityRevealed,
        hard_gates_passed: Boolean(application.hard_gates_passed),
        motivation_letter: motivation,
        application_type:
          typeof application.application_type === 'string' ? application.application_type : null,
        verified:
          applicantProfile?.verification_status === 'verified' ||
          badges.some((b) => b === 'id_verified' || b === 'university_email'),
        bio:
          typeof applicantProfile?.bio === 'string' && applicantProfile.bio.trim()
            ? applicantProfile.bio.trim().slice(0, 600)
            : null,
        interests,
        university:
          (typeof academicUni?.name === 'string' && academicUni.name) ||
          (typeof profileUni?.name === 'string' && profileUni.name) ||
          null,
        program:
          (typeof academicProg?.name_en === 'string' && academicProg.name_en) ||
          (typeof academicProg?.name === 'string' && academicProg.name) ||
          (typeof applicantProfile?.program === 'string' && applicantProfile.program.trim()) ||
          null,
        degree_level:
          (typeof academic?.degree_level === 'string' && academic.degree_level) ||
          (typeof applicantProfile?.degree_level === 'string' && applicantProfile.degree_level) ||
          null,
        study_year: studyYear,
      }
    }

    const pct = (v: number | undefined) =>
      v == null || Number.isNaN(v) ? undefined : v <= 1 ? Math.round(v * 100) : Math.round(v)

    const cohesionStored =
      typeof application.cohesion_score === 'number' && Number.isFinite(application.cohesion_score)
        ? application.cohesion_score
        : scoreBreakdown?.cohesion

    return NextResponse.json({
      viewer_role: viewerRole,
      application: {
        id: application.id,
        status: application.status,
        fit_score: fitScore,
        cohesion_score: cohesionStored ?? null,
        watch_outs: watchOuts.slice(0, 6),
        gate_conflicts: gateConflicts.slice(0, 6),
        score_breakdown: scoreBreakdown
          ? {
              lifestyle: pct(scoreBreakdown.lifestyle),
              budget: pct(scoreBreakdown.budget),
              timeline: pct(scoreBreakdown.timeline),
              capacity: pct(scoreBreakdown.capacity),
              amenities: pct(scoreBreakdown.amenities),
              cohesion: pct(scoreBreakdown.cohesion ?? cohesionStored),
            }
          : null,
      },
      listing: {
        id: listing.id,
        title: typeof listing.title === 'string' ? listing.title : 'Listing',
        city: typeof listing.city === 'string' ? listing.city : null,
        address: address || null,
        rent_monthly:
          typeof listing.rent_monthly === 'number' ? listing.rent_monthly : null,
        utilities_included: Boolean(listing.utilities_included),
        room_type: typeof listing.room_type === 'string' ? listing.room_type : null,
        available_from:
          typeof listing.available_from === 'string'
            ? formatNlDate(listing.available_from) || listing.available_from
            : null,
        min_stay_months:
          typeof listing.min_stay_months === 'number' ? listing.min_stay_months : null,
        furnished: Boolean(listing.furnished),
        pet_friendly: Boolean(listing.pet_friendly),
        smoking_allowed: Boolean(listing.smoking_allowed),
        amenities: amenities.slice(0, 12),
        photo_url: photos[0] || null,
        description:
          typeof listing.description === 'string' && listing.description.trim()
            ? listing.description.trim().slice(0, 600)
            : null,
      },
      host: {
        display_name: hostDisplayName,
        host_type: hostType,
        host_type_label: hostType ? HOST_TYPE_LABELS[hostType] : null,
        company_name:
          (typeof host?.company_name === 'string' && host.company_name.trim()) ||
          (typeof listing.agency_name === 'string' && listing.agency_name.trim()) ||
          null,
        bio:
          typeof host?.bio === 'string' && host.bio.trim() ? host.bio.trim().slice(0, 500) : null,
        verified: isHostVerified(
          host ? { email_verified: Boolean(host.email_verified) } : null,
        ),
        avatar_url: hostAvatarUrl,
      },
      applicant: applicantPayload,
      insights,
    })
  } catch (error) {
    safeLogger.error('[housing-context] unexpected error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
