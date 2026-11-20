// Housing Listings API
// GET /api/housing/listings — match-first browse with live fit scoring

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { ListingsResponse, Listing } from '@/types/housing'
import { getSortComparator } from '@/lib/housing/sorting'
import { loadMemberHousingSignals } from '@/lib/housing/applicant-signals'
import { scoreGroupAgainstListing } from '@/lib/housing/group-listing-score'
import { isHostVerified } from '@/lib/host/verification'
import { resolveListingPhotoUrls } from '@/lib/housing/photos'
import type { ListingDealbreakers, ListingLifestylePrefs } from '@/lib/host/types'
import {
  composeStreetLine,
  listingMapCoords,
  normalizeAmenityList,
} from '@/lib/housing/listing-location'
import { resolveListingHostDisplayName } from '@/lib/host/display-name'

export const revalidate = 3600

const ListingsQuerySchema = z.object({
  q: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(),
  campusId: z.string().uuid().optional(),
  maxDistanceKm: z.coerce.number().optional(),
  moveInFrom: z.string().optional(),
  moveInTo: z.string().optional(),
  leaseMonths: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map(Number) : undefined)),
  roomTypes: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined)),
  furnished: z.coerce.boolean().optional(),
  utilitiesIncluded: z.coerce.boolean().optional(),
  petsAllowed: z.coerce.boolean().optional(),
  smokingPolicy: z.enum(['none', 'outdoor', 'allowed']).optional(),
  accessibility: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined)),
  universityVerifiedOnly: z.coerce.boolean().optional(),
  minCompatibility: z.coerce.number().min(0).max(100).optional(),
  quietHours: z.enum(['strict', 'normal', 'flexible']).optional(),
  cleanlinessLevel: z.coerce.number().min(1).max(5).optional(),
  guestPolicy: z.enum(['rare', 'occasional', 'frequent']).optional(),
  lifestyleTags: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined)),
  sort: z.enum(['best', 'priceAsc', 'priceDesc', 'distance', 'newest']).optional(),
  view: z.enum(['split', 'list', 'map']).optional(),
  page: z.coerce.number().min(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = ListingsQuerySchema.parse(Object.fromEntries(searchParams))

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let campusId: string | undefined
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('campus_id')
        .eq('user_id', user.id)
        .single()
      campusId = query.campusId || profile?.campus_id || undefined
    } else {
      campusId = query.campusId
    }

    let campusCoords: { lat: number; lng: number } | undefined
    if (campusId) {
      const { data: campus } = await supabase
        .from('campuses')
        .select('latitude, longitude')
        .eq('id', campusId)
        .single()
      if (campus?.latitude && campus?.longitude) {
        campusCoords = { lat: campus.latitude, lng: campus.longitude }
      }
    }

    const isAuthenticated = !!user
    const selectFields = isAuthenticated
      ? `*,
        host_profiles(
          id, display_name, host_type, email_verified, id_verified, kvk_number, company_name
        )`
      : `id, title, address, city, latitude, longitude, postal_code, property_type,
        rent_monthly, available_from, available_until, min_stay_months, max_stay_months,
        room_type, total_rooms, available_rooms, seeking_people, total_bathrooms, square_meters,
        utilities_cost, deposit_amount, agency_fee, parking_available, parking_cost,
        furnished, utilities_included, pet_friendly, smoking_allowed, amenities,
        lifestyle_prefs, dealbreakers, photos, virtual_tour_url, floor_plan_url, description, status,
        verified_by_university, verification_date, university_id, landlord_name, agency_name,
        host_id, host_type, created_at, updated_at, expires_at,
        host_profiles(
          id, display_name, host_type, email_verified, id_verified, kvk_number, company_name
        )`

    let queryBuilder = supabase
      .from('housing_listings')
      .select(selectFields)
      .eq('status', 'active')
      .eq('moderation_status', 'approved')

    if (query.q) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query.q}%,city.ilike.%${query.q}%,address.ilike.%${query.q}%`
      )
    }
    if (query.priceMin !== undefined) {
      queryBuilder = queryBuilder.gte('rent_monthly', query.priceMin)
    }
    if (query.priceMax !== undefined) {
      queryBuilder = queryBuilder.lte('rent_monthly', query.priceMax)
    }
    if (query.city) queryBuilder = queryBuilder.ilike('city', query.city)
    // Prefer geo radius when an address was resolved to coordinates
    if (
      query.address &&
      (query.lat == null || query.lng == null || query.radiusKm == null)
    ) {
      queryBuilder = queryBuilder.ilike('address', `%${query.address}%`)
    }
    if (query.furnished !== undefined) {
      queryBuilder = queryBuilder.eq('furnished', query.furnished)
    }
    if (query.utilitiesIncluded !== undefined) {
      queryBuilder = queryBuilder.eq('utilities_included', query.utilitiesIncluded)
    }
    if (query.petsAllowed !== undefined) {
      queryBuilder = queryBuilder.eq('pet_friendly', query.petsAllowed)
    }
    if (query.smokingPolicy) {
      queryBuilder = queryBuilder.eq('smoking_allowed', query.smokingPolicy === 'allowed')
    }
    if (query.universityVerifiedOnly) {
      queryBuilder = queryBuilder.eq('verified_by_university', true)
    }
    if (query.roomTypes?.length) {
      const roomTypeValues = expandRoomTypeFilters(query.roomTypes)
      const propertyTypeValues = expandPropertyTypeFilters(query.roomTypes)
      if (roomTypeValues.length && propertyTypeValues.length) {
        queryBuilder = queryBuilder.or(
          `room_type.in.(${roomTypeValues.join(',')}),property_type.in.(${propertyTypeValues.join(',')})`
        )
      } else if (roomTypeValues.length) {
        queryBuilder = queryBuilder.in('room_type', roomTypeValues)
      } else if (propertyTypeValues.length) {
        queryBuilder = queryBuilder.in('property_type', propertyTypeValues)
      }
    }
    if (query.leaseMonths?.length) {
      queryBuilder = queryBuilder.in('min_stay_months', query.leaseMonths)
    }
    if (query.moveInFrom) {
      queryBuilder = queryBuilder.gte('available_from', query.moveInFrom)
    }
    if (query.moveInTo) {
      queryBuilder = queryBuilder.lte('available_from', query.moveInTo)
    }

    const { data: listings, error } = await queryBuilder

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        items: [],
        total: 0,
        page: query.page || 1,
        pageSize: query.pageSize || query.limit || 20,
      })
    }

    // Live fit scoring for authenticated users
    let signals: Awaited<ReturnType<typeof loadMemberHousingSignals>> = []
    if (user) {
      try {
        signals = await loadMemberHousingSignals([user.id])
      } catch (e) {
        console.error('Failed to load housing signals', e)
      }
    }
    const signal = signals[0]
    const userBudget = signal?.maxRentMonthly ?? query.priceMax

    let transformedListings: Listing[] = await Promise.all(
      (listings || []).map(async (item: any) => {
        const hostRaw = item.host_profiles
        const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw
        const hostVerified = isHostVerified(host)
        const lifestylePrefs = (item.lifestyle_prefs || null) as ListingLifestylePrefs | null
        const dealbreakers = (item.dealbreakers || null) as ListingDealbreakers | null
        const photos = await resolveListingPhotoUrls(item.photos)
        const amenities = normalizeAmenityList(item.amenities)
        const mapCoords = listingMapCoords(item) || { lat: 0, lng: 0 }
        const hostDisplayName = resolveListingHostDisplayName({
          landlordName: item.landlord_name,
          hostDisplayName: host?.display_name,
          agencyName: item.agency_name,
          hostCompanyName: host?.company_name,
        })

        let compatibilityScore: number | undefined
        let scoreBreakdown: Listing['scoreBreakdown']
        let scoreInsights: Listing['scoreInsights']
        let watchOuts: string[] = []
        let compatibilityReasons: string[] = []

        if (signal) {
          const scored = scoreGroupAgainstListing([signal], {
            rentMonthly: item.rent_monthly,
            availableRooms: item.available_rooms ?? 1,
            seekingPeople: item.seeking_people ?? item.available_rooms ?? 1,
            petFriendly: Boolean(item.pet_friendly),
            smokingAllowed: Boolean(item.smoking_allowed),
            lifestylePrefs,
            dealbreakers,
            availableFrom: item.available_from,
            minStayMonths: item.min_stay_months,
            maxStayMonths: item.max_stay_months,
            amenities,
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

        const listing: Listing = {
          id: item.id,
          title: item.title,
          address: composeStreetLine({ address: item.address, city: item.city }),
          city: item.city,
          coords: mapCoords,
          coverImageUrl: photos[0],
          priceMonthly: item.rent_monthly,
          moveInISO: item.available_from,
          leaseMonths: item.min_stay_months,
          roomType: item.room_type,
          beds: item.total_rooms,
          baths: item.total_bathrooms,
          furnished: item.furnished,
          utilitiesIncluded: item.utilities_included,
          petsAllowed: item.pet_friendly,
          smokingPolicy: item.smoking_allowed ? 'allowed' : 'none',
          accessibility: {
            elevator: amenities.includes('elevator'),
            stepFree: amenities.includes('step_free'),
            groundFloor: amenities.includes('ground_floor'),
          },
          distanceKmToCampus:
            campusCoords && (mapCoords.lat !== 0 || mapCoords.lng !== 0)
              ? calculateDistance(mapCoords, campusCoords)
              : undefined,
          compatibilityScore,
          compatibilityReasons,
          scoreBreakdown,
          scoreInsights,
          watchOuts,
          hostVerified,
          actionsEnabled: hostVerified,
          seekingPeople: item.seeking_people ?? item.available_rooms,
          roommatesCount: Math.max(
            0,
            (item.total_rooms || 0) - (item.available_rooms || 0)
          ),
          isNew: isNewListing(item.created_at),
          isPopular: (compatibilityScore || 0) >= 80,
          verification: {
            universityVerified: item.verified_by_university ?? false,
            hostIdVerified: Boolean(host?.id_verified),
            agencyKvKVerified: Boolean(host?.kvk_number),
            lastAuditISO: item.verification_date ?? undefined,
          },
          agencyOrHost: {
            name: hostDisplayName,
            // Response time is computed on the listing detail page from real application lag
            rating: 4.5,
          },
          description: item.description,
          postalCode: item.postal_code,
          propertyType: item.property_type,
          totalRooms: item.total_rooms,
          availableRooms: item.available_rooms,
          totalBathrooms: item.total_bathrooms,
          squareMeters: item.square_meters,
          utilitiesCost: item.utilities_cost,
          depositAmount: item.deposit_amount,
          agencyFee: item.agency_fee,
          availableUntil: item.available_until,
          minStayMonths: item.min_stay_months,
          maxStayMonths: item.max_stay_months,
          amenities,
          parkingAvailable: item.parking_available,
          parkingCost: item.parking_cost,
          universityId: item.university_id,
          landlordName: hostDisplayName,
          agencyName: item.agency_name || host?.company_name,
          photos,
          virtualTourUrl: item.virtual_tour_url,
          floorPlanUrl: item.floor_plan_url,
          status: item.status,
          moderationStatus: 'approved',
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          expiresAt: item.expires_at,
        }

        if (isAuthenticated) {
          if (item.landlord_email !== undefined) listing.landlordEmail = item.landlord_email
          if (item.landlord_phone !== undefined) listing.landlordPhone = item.landlord_phone
          if (item.agency_license !== undefined) listing.agencyLicense = item.agency_license
          if (item.moderation_status !== undefined) {
            listing.moderationStatus = item.moderation_status
          }
          if (item.moderation_notes !== undefined) listing.moderationNotes = item.moderation_notes
        }

        return listing
      })
    )

    // Post-score in-memory filters
    if (query.minCompatibility != null) {
      transformedListings = transformedListings.filter(
        (l) => (l.compatibilityScore ?? 0) >= query.minCompatibility!
      )
    }
    if (query.maxDistanceKm != null && campusCoords) {
      transformedListings = transformedListings.filter(
        (l) => (l.distanceKmToCampus ?? Infinity) <= query.maxDistanceKm!
      )
    }
    if (
      query.radiusKm != null &&
      query.lat != null &&
      query.lng != null &&
      Number.isFinite(query.lat) &&
      Number.isFinite(query.lng)
    ) {
      const origin = { lat: query.lat, lng: query.lng }
      transformedListings = transformedListings.filter((l) => {
        if (!l.coords?.lat && !l.coords?.lng) return false
        return calculateDistance(l.coords, origin) <= query.radiusKm!
      })
    }
    if (query.quietHours || query.cleanlinessLevel || query.guestPolicy) {
      transformedListings = transformedListings.filter((l) => {
        const bd = l.scoreBreakdown
        if (!bd) return true
        if (query.quietHours === 'strict' && (bd.lifestyle ?? 100) < 60) return false
        if (query.cleanlinessLevel != null && (bd.lifestyle ?? 100) < query.cleanlinessLevel * 15) {
          return false
        }
        if (query.guestPolicy === 'rare' && (bd.lifestyle ?? 100) < 55) return false
        return true
      })
    }

    const sort = query.sort || 'best'
    const sortedListings = [...transformedListings].sort(
      getSortComparator(sort, campusCoords, userBudget ?? undefined)
    )

    const pageSize = query.pageSize || query.limit || 20
    const page = query.page || 1
    const startIndex =
      query.offset !== undefined ? query.offset : (page - 1) * pageSize
    const paginatedListings = sortedListings.slice(startIndex, startIndex + pageSize)

    const response: ListingsResponse = {
      items: paginatedListings,
      total: sortedListings.length,
      page,
      pageSize,
    }

    const headers = new Headers()
    if (isAuthenticated) {
      headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300')
    } else {
      headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
    }

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

/** Map UI filter chips → DB room_type values */
function expandRoomTypeFilters(types: string[]): string[] {
  const values = new Set<string>()
  for (const type of types) {
    switch (type) {
      case 'room':
        values.add('private')
        values.add('room')
        values.add('private_room')
        break
      case 'studio':
        values.add('studio')
        break
      case 'apartment':
        values.add('apartment')
        values.add('entire_place')
        break
      case 'shared':
        values.add('shared')
        values.add('shared_room')
        break
      default:
        values.add(type)
    }
  }
  return [...values]
}

/** Map UI filter chips → DB property_type values (for shared house etc.) */
function expandPropertyTypeFilters(types: string[]): string[] {
  const values = new Set<string>()
  for (const type of types) {
    switch (type) {
      case 'shared':
        values.add('house')
        values.add('shared_room')
        break
      case 'apartment':
        values.add('apartment')
        break
      case 'studio':
        values.add('studio')
        break
      case 'room':
        values.add('private_room')
        break
      default:
        break
    }
  }
  return [...values]
}

function calculateDistance(
  coords1: { lat: number; lng: number },
  coords2: { lat: number; lng: number }
): number {
  const R = 6371
  const dLat = deg2rad(coords2.lat - coords1.lat)
  const dLon = deg2rad(coords2.lng - coords1.lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coords1.lat)) *
      Math.cos(deg2rad(coords2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180
}

function isNewListing(createdAt: string): boolean {
  const daysSinceCreated =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceCreated <= 7
}
