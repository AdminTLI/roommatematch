// Listing Detail Page (Standalone)
// Server component that fetches listing data and renders detail view

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ListingDetail } from '@/components/housing/ListingDetail'
import { Listing } from '@/types/housing'

interface ListingDetailPageProps {
  params: {
    id: string
  }
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const supabase = await createClient()
  
  // Fetch listing data
  const { data: listingData, error } = await supabase
    .from('housing_listings')
    .select(`
      *,
      housing_compatibility_scores!left(
        overall_compatibility,
        positive_factors,
        negative_factors
      )
    `)
    .eq('id', params.id)
    .eq('status', 'active')
    .eq('moderation_status', 'approved')
    .single()

  if (error || !listingData) {
    notFound()
  }

  // Transform to our Listing type
  const listing: Listing = {
    id: listingData.id,
    title: listingData.title,
    address: listingData.address,
    city: listingData.city,
    coords: {
      lat: listingData.latitude || 0,
      lng: listingData.longitude || 0
    },
    coverImageUrl: listingData.photos?.[0],
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
      elevator: listingData.amenities?.includes('elevator'),
      stepFree: listingData.amenities?.includes('step_free'),
      groundFloor: listingData.amenities?.includes('ground_floor')
    },
    distanceKmToCampus: undefined, // Would be calculated based on user's campus
    compatibilityScore: listingData.housing_compatibility_scores?.[0]?.overall_compatibility 
      ? Math.round(listingData.housing_compatibility_scores[0].overall_compatibility * 100)
      : undefined,
    compatibilityReasons: listingData.housing_compatibility_scores?.[0]?.positive_factors || [],
    roommatesCount: listingData.total_rooms - listingData.available_rooms,
    isNew: false, // Would be calculated based on created_at
    isPopular: false, // Would be calculated based on views/compatibility
    verification: {
      universityVerified: listingData?.verified_by_university ?? false,
      hostIdVerified: false, // TODO: implement host verification
      agencyKvKVerified: false, // TODO: implement agency verification
      lastAuditISO: listingData.verification_date
    },
    agencyOrHost: {
      name: listingData.landlord_name,
      responseTimeHrs: 24, // TODO: implement actual response time
      rating: 4.5 // TODO: implement actual rating
    },
    // Additional required fields
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
    amenities: listingData.amenities || [],
    parkingAvailable: listingData.parking_available,
    parkingCost: listingData.parking_cost,
    universityId: listingData.university_id,
    landlordName: listingData.landlord_name,
    landlordEmail: listingData.landlord_email,
    landlordPhone: listingData.landlord_phone,
    agencyName: listingData.agency_name,
    agencyLicense: listingData.agency_license,
    photos: listingData.photos || [],
    virtualTourUrl: listingData.virtual_tour_url,
    floorPlanUrl: listingData.floor_plan_url,
    status: listingData.status,
    moderationStatus: listingData.moderation_status,
    moderationNotes: listingData.moderation_notes,
    createdAt: listingData.created_at,
    updatedAt: listingData.updated_at,
    expiresAt: listingData.expires_at
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ListingDetail
          listing={listing}
          onSave={(id) => console.log('Save listing:', id)}
          onShare={(id) => console.log('Share listing:', id)}
          onReport={(id) => console.log('Report listing:', id)}
          showBackButton={true}
        />
      </div>
    </div>
  )
}
