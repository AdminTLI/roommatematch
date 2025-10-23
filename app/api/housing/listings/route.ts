// Housing Listings API
// GET /api/housing/listings with comprehensive filtering and sorting

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { FiltersState, ListingsResponse, Listing } from '@/types/housing'
import { getSortComparator } from '@/lib/housing/sorting'

// Zod schema for query parameters
const ListingsQuerySchema = z.object({
  // Search
  q: z.string().optional(),
  
  // Price range
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  
  // Location
  city: z.string().optional(),
  radiusKm: z.coerce.number().optional(),
  campusId: z.string().uuid().optional(),
  maxDistanceKm: z.coerce.number().optional(),
  
  // Move-in dates
  moveInFrom: z.string().optional(),
  moveInTo: z.string().optional(),
  
  // Lease
  leaseMonths: z.string().optional().transform(val => 
    val ? val.split(',').map(Number) : undefined
  ),
  
  // Property filters
  roomTypes: z.string().optional().transform(val =>
    val ? val.split(',') : undefined
  ),
  furnished: z.coerce.boolean().optional(),
  utilitiesIncluded: z.coerce.boolean().optional(),
  petsAllowed: z.coerce.boolean().optional(),
  smokingPolicy: z.enum(['none', 'outdoor', 'allowed']).optional(),
  
  // Accessibility
  accessibility: z.string().optional().transform(val =>
    val ? val.split(',') : undefined
  ),
  
  // Verification
  universityVerifiedOnly: z.coerce.boolean().optional(),
  
  // Compatibility
  minCompatibility: z.coerce.number().min(0).max(100).optional(),
  quietHours: z.enum(['strict', 'normal', 'flexible']).optional(),
  cleanlinessLevel: z.coerce.number().min(1).max(5).optional(),
  guestPolicy: z.enum(['rare', 'occasional', 'frequent']).optional(),
  lifestyleTags: z.string().optional().transform(val =>
    val ? val.split(',') : undefined
  ),
  
  // Sorting and pagination
  sort: z.enum(['best', 'priceAsc', 'priceDesc', 'distance', 'newest']).optional(),
  view: z.enum(['split', 'list', 'map']).optional(),
  page: z.coerce.number().min(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = ListingsQuerySchema.parse(Object.fromEntries(searchParams))
    
    const supabase = await createClient()
    
    // Get user for compatibility scoring (optional)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get user's campus for distance calculations (only if authenticated)
    let campusId: string | undefined
    let userProfile: any = null
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('campus_id')
        .eq('user_id', user.id)
        .single()
      
      userProfile = profile
      campusId = query.campusId || profile?.campus_id
    } else {
      campusId = query.campusId
    }
    
    // Get campus coordinates if available
    let campusCoords: { lat: number; lng: number } | undefined
    if (campusId) {
      const { data: campus } = await supabase
        .from('campuses')
        .select('latitude, longitude')
        .eq('id', campusId)
        .single()
      
      if (campus?.latitude && campus?.longitude) {
        campusCoords = {
          lat: campus.latitude,
          lng: campus.longitude
        }
      }
    }
    
    // Build base query
    let queryBuilder = supabase
      .from('housing_listings')
      .select(`
        *,
        housing_compatibility_scores!left(
          overall_compatibility,
          positive_factors,
          negative_factors
        )
      `)
      .eq('status', 'active')
      .eq('moderation_status', 'approved')
    
    // Apply filters
    if (query.q) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query.q}%,city.ilike.%${query.q}%,address.ilike.%${query.q}%`)
    }
    
    if (query.priceMin !== undefined) {
      queryBuilder = queryBuilder.gte('rent_monthly', query.priceMin)
    }
    
    if (query.priceMax !== undefined) {
      queryBuilder = queryBuilder.lte('rent_monthly', query.priceMax)
    }
    
    if (query.city) {
      queryBuilder = queryBuilder.eq('city', query.city)
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
      const smokingAllowed = query.smokingPolicy === 'allowed'
      queryBuilder = queryBuilder.eq('smoking_allowed', smokingAllowed)
    }
    
    if (query.universityVerifiedOnly) {
      queryBuilder = queryBuilder.eq('verified_by_university', true)
    }
    
    if (query.roomTypes && query.roomTypes.length > 0) {
      queryBuilder = queryBuilder.in('room_type', query.roomTypes)
    }
    
    if (query.leaseMonths && query.leaseMonths.length > 0) {
      queryBuilder = queryBuilder.in('min_stay_months', query.leaseMonths)
    }
    
    if (query.moveInFrom) {
      queryBuilder = queryBuilder.gte('available_from', query.moveInFrom)
    }
    
    if (query.moveInTo) {
      queryBuilder = queryBuilder.lte('available_from', query.moveInTo)
    }
    
    // Execute query
    const { data: listings, error } = await queryBuilder
    
    if (error) {
      console.error('Database error:', error)
      // Return empty results instead of error for better UX
      return NextResponse.json({
        items: [],
        total: 0,
        page: query.page || 1,
        pageSize: query.pageSize || 20
      })
    }
    
    // Transform data to our Listing type
    const transformedListings: Listing[] = (listings || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      address: item.address,
      city: item.city,
      coords: {
        lat: item.latitude || 0,
        lng: item.longitude || 0
      },
      coverImageUrl: item.photos?.[0],
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
        elevator: item.amenities?.includes('elevator'),
        stepFree: item.amenities?.includes('step_free'),
        groundFloor: item.amenities?.includes('ground_floor')
      },
      distanceKmToCampus: campusCoords ? calculateDistance(
        { lat: item.latitude || 0, lng: item.longitude || 0 },
        campusCoords
      ) : undefined,
      compatibilityScore: item.housing_compatibility_scores?.[0]?.overall_compatibility 
        ? Math.round(item.housing_compatibility_scores[0].overall_compatibility * 100)
        : undefined,
      compatibilityReasons: item.housing_compatibility_scores?.[0]?.positive_factors || [],
      roommatesCount: item.total_rooms - item.available_rooms,
      isNew: isNewListing(item.created_at),
      isPopular: isPopularListing(item),
      verification: {
        universityVerified: item.verified_by_university,
        hostIdVerified: false, // TODO: implement host verification
        agencyKvKVerified: false, // TODO: implement agency verification
        lastAuditISO: item.verification_date
      },
      agencyOrHost: {
        name: item.landlord_name,
        responseTimeHrs: 24, // TODO: implement actual response time
        rating: 4.5 // TODO: implement actual rating
      },
      // Additional required fields
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
      amenities: item.amenities || [],
      parkingAvailable: item.parking_available,
      parkingCost: item.parking_cost,
      universityId: item.university_id,
      landlordName: item.landlord_name,
      landlordEmail: item.landlord_email,
      landlordPhone: item.landlord_phone,
      agencyName: item.agency_name,
      agencyLicense: item.agency_license,
      photos: item.photos || [],
      virtualTourUrl: item.virtual_tour_url,
      floorPlanUrl: item.floor_plan_url,
      status: item.status,
      moderationStatus: item.moderation_status,
      moderationNotes: item.moderation_notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      expiresAt: item.expires_at
    }))
    
    // Apply sorting
    const sort = query.sort || 'best'
    const sortedListings = transformedListings.sort(
      getSortComparator(sort, campusCoords, query.priceMax)
    )
    
    // Apply pagination
    const page = query.page || 1
    const pageSize = query.pageSize || 20
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedListings = sortedListings.slice(startIndex, endIndex)
    
    const response: ListingsResponse = {
      items: paginatedListings,
      total: sortedListings.length,
      page,
      pageSize
    }
    
    // Add cache headers
    const headers = new Headers()
    headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    headers.set('ETag', `"${Date.now()}"`)
    
    return NextResponse.json(response, { headers })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Helper functions
function calculateDistance(coords1: { lat: number; lng: number }, coords2: { lat: number; lng: number }): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = deg2rad(coords2.lat - coords1.lat)
  const dLon = deg2rad(coords2.lng - coords1.lng)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(coords1.lat)) * Math.cos(deg2rad(coords2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180)
}

function isNewListing(createdAt: string): boolean {
  const daysSinceCreated = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceCreated <= 7
}

function isPopularListing(listing: any): boolean {
  // Simple heuristic: high compatibility score or many views
  return listing.housing_compatibility_scores?.[0]?.overall_compatibility > 0.8
}
