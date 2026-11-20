import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/app/shell'
import { ListingDetailClient } from '@/components/housing/ListingDetailClient'
import { Listing } from '@/types/housing'
import { loadMemberHousingSignals } from '@/lib/housing/applicant-signals'
import { scoreGroupAgainstListing } from '@/lib/housing/group-listing-score'
import { isHostVerified } from '@/lib/host/verification'
import { estimateHostResponseHours } from '@/lib/host/response-time'
import type { ListingDealbreakers, ListingLifestylePrefs } from '@/lib/host/types'
import { resolveHostAvatarUrl, resolveListingPhotoUrls } from '@/lib/housing/photos'
import {
  composeStreetLine,
  listingMapCoords,
  normalizeAmenityList,
} from '@/lib/housing/listing-location'
import { resolveListingHostDisplayName } from '@/lib/host/display-name'

interface ListingDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { data: listingData, error } = await supabase
    .from('housing_listings')
    .select(
      `*,
      host_profiles(
        id, display_name, host_type, email_verified, id_verified, kvk_number, company_name, bio, avatar_path, created_at
      )`
    )
    .eq('id', id)
    .eq('status', 'active')
    .eq('moderation_status', 'approved')
    .single()

  if (error || !listingData) {
    notFound()
  }

  const hostRaw = listingData.host_profiles
  const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw
  const hostVerified = isHostVerified(host)

  let otherListingsCount = 0
  let responseTimeHrs: number | undefined
  if (host?.id) {
    const [{ count }, estimatedHours] = await Promise.all([
      supabase
        .from('housing_listings')
        .select('id', { count: 'exact', head: true })
        .eq('host_id', host.id)
        .eq('status', 'active')
        .eq('moderation_status', 'approved')
        .neq('id', id),
      estimateHostResponseHours(supabase, host.id),
    ])
    otherListingsCount = count ?? 0
    if (estimatedHours != null) responseTimeHrs = estimatedHours
  }

  const { data: academic } = await supabase
    .from('user_academic')
    .select('university_id, universities(name)')
    .eq('user_id', user.id)
    .maybeSingle()

  const plannedUniversityId = academic?.university_id ?? null
  const plannedUniversityRaw = academic?.universities
  const plannedUniversityName = plannedUniversityRaw
    ? Array.isArray(plannedUniversityRaw)
      ? plannedUniversityRaw[0]?.name ?? null
      : (plannedUniversityRaw as { name?: string | null }).name ?? null
    : null

  let compatibilityScore: number | undefined
  let scoreBreakdown: Listing['scoreBreakdown']
  let scoreInsights: Listing['scoreInsights']
  let watchOuts: string[] = []
  let compatibilityReasons: string[] = []

  try {
    const signals = await loadMemberHousingSignals([user.id])
    const signal = signals[0]
    if (signal) {
      const scored = scoreGroupAgainstListing([signal], {
        rentMonthly: listingData.rent_monthly,
        availableRooms: listingData.available_rooms ?? 1,
        seekingPeople: listingData.seeking_people ?? listingData.available_rooms ?? 1,
        petFriendly: Boolean(listingData.pet_friendly),
        smokingAllowed: Boolean(listingData.smoking_allowed),
        lifestylePrefs: (listingData.lifestyle_prefs || null) as ListingLifestylePrefs | null,
        dealbreakers: (listingData.dealbreakers || null) as ListingDealbreakers | null,
        availableFrom: listingData.available_from,
        minStayMonths: listingData.min_stay_months,
        maxStayMonths: listingData.max_stay_months,
        amenities: normalizeAmenityList(listingData.amenities),
      })
      compatibilityScore = Math.round(scored.overall * 100)
      scoreBreakdown = {
        lifestyle: Math.round(scored.breakdown.lifestyle * 100),
        budget: Math.round(scored.breakdown.budget * 100),
        timeline: Math.round(scored.breakdown.timeline * 100),
        capacity: Math.round(scored.breakdown.capacity * 100),
        amenities: Math.round(scored.breakdown.amenities * 100),
      }
      scoreInsights = scored.insights
      watchOuts = scored.watchOuts || []
      compatibilityReasons = [
        scored.insights.lifestyle,
        scored.insights.budget,
        scored.insights.timeline,
      ]
    }
  } catch {
    /* scoring optional */
  }

  const [photos, hostAvatarUrl] = await Promise.all([
    resolveListingPhotoUrls(listingData.photos),
    resolveHostAvatarUrl(host?.avatar_path),
  ])
  const amenities = normalizeAmenityList(listingData.amenities)
  const mapCoords = listingMapCoords(listingData) || { lat: 0, lng: 0 }
  const hostDisplayName = resolveListingHostDisplayName({
    landlordName: listingData.landlord_name,
    hostDisplayName: host?.display_name,
    agencyName: listingData.agency_name,
    hostCompanyName: host?.company_name,
  })

  const listing: Listing = {
    id: listingData.id,
    title: listingData.title,
    address: composeStreetLine({
      address: listingData.address,
      city: listingData.city,
    }),
    city: listingData.city,
    coords: mapCoords,
    coverImageUrl: photos[0],
    priceMonthly: listingData.rent_monthly,
    moveInISO: listingData.available_from,
    leaseMonths: listingData.min_stay_months,
    roomType: listingData.room_type,
    beds: listingData.total_rooms,
    baths: listingData.total_bathrooms,
    furnished: listingData.furnished,
    utilitiesIncluded: listingData.utilities_included,
    petsAllowed: listingData.pet_friendly,
    smokingPolicy: listingData.smoking_allowed ? 'allowed' : 'none',
    accessibility: {
      elevator: amenities.includes('elevator'),
      stepFree: amenities.includes('step_free'),
      groundFloor: amenities.includes('ground_floor'),
    },
    compatibilityScore,
    compatibilityReasons,
    scoreBreakdown,
    scoreInsights,
    watchOuts,
    hostVerified,
    actionsEnabled: hostVerified,
    wwsStatus:
      listingData.wws_status === 'certified' ||
      listingData.wws_status === 'not_certified' ||
      listingData.wws_status === 'under_review'
        ? listingData.wws_status
        : 'under_review',
    seekingPeople: listingData.seeking_people,
    roommatesCount: Math.max(
      0,
      (listingData.total_rooms || 0) - (listingData.available_rooms || 0)
    ),
    isNew: false,
    isPopular: (compatibilityScore || 0) >= 80,
    verification: {
      universityVerified: listingData?.verified_by_university ?? false,
      hostIdVerified: Boolean(host?.id_verified),
      agencyKvKVerified: Boolean(host?.kvk_number),
      lastAuditISO: listingData.verification_date,
    },
    agencyOrHost: {
      name: hostDisplayName,
      hostType: host?.host_type ?? undefined,
      companyName: host?.company_name ?? listingData.agency_name ?? null,
      bio: host?.bio ?? null,
      avatarUrl: hostAvatarUrl,
      joinedAt: host?.created_at ?? null,
      otherListingsCount,
      idVerified: Boolean(host?.id_verified),
      responseTimeHrs,
    },
    description: listingData.description,
    postalCode: listingData.postal_code,
    propertyType: listingData.property_type,
    totalRooms: listingData.total_rooms,
    availableRooms: listingData.available_rooms,
    totalBathrooms: listingData.total_bathrooms,
    squareMeters: listingData.square_meters,
    utilitiesCost: listingData.utilities_cost,
    depositAmount: listingData.deposit_amount,
    agencyFee: listingData.agency_fee,
    availableUntil: listingData.available_until,
    minStayMonths: listingData.min_stay_months,
    maxStayMonths: listingData.max_stay_months,
    amenities,
    parkingAvailable: listingData.parking_available,
    parkingCost: listingData.parking_cost,
    universityId: listingData.university_id,
    landlordName: hostDisplayName,
    landlordEmail: listingData.landlord_email,
    landlordPhone: listingData.landlord_phone,
    agencyName: listingData.agency_name || host?.company_name,
    agencyLicense: listingData.agency_license,
    photos,
    virtualTourUrl: listingData.virtual_tour_url,
    floorPlanUrl: listingData.floor_plan_url,
    status: listingData.status,
    moderationStatus: listingData.moderation_status,
    moderationNotes: listingData.moderation_notes,
    createdAt: listingData.created_at,
    updatedAt: listingData.updated_at,
    expiresAt: listingData.expires_at,
  }

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || 'User',
        avatar: user.user_metadata?.avatar_url,
      }}
    >
      <div className="w-full">
        <ListingDetailClient
          listing={listing}
          showBackButton
          plannedUniversityId={plannedUniversityId}
          plannedUniversityName={plannedUniversityName}
        />
      </div>
    </AppShell>
  )
}
