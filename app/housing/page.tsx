import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HousingPageClient } from './HousingPageClient'
import { getDefaultFilters } from '@/lib/housing/url-sync'
import { Listing, Coords } from '@/types/housing'

export default async function HousingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo bypass - create a mock user for demo purposes
  const demoUser = user || {
    id: 'demo-user-id',
    email: 'demo@account.com',
    user_metadata: {
      full_name: 'Demo Student'
    }
  }

  if (!user) {
    // For demo purposes, we'll still show the housing page
    // In a real app, this would redirect to sign-in
    console.log('Demo mode: showing housing page without authentication')
  }

  // Get user's campus information
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('campus_id')
    .eq('user_id', demoUser.id)
    .single()

  // Get campus coordinates if available
  let userCampusCoords: Coords | undefined
  if (userProfile?.campus_id) {
    const { data: campus } = await supabase
      .from('campuses')
      .select('latitude, longitude')
      .eq('id', userProfile.campus_id)
      .single()
    
    if (campus?.latitude && campus?.longitude) {
      userCampusCoords = {
        lat: campus.latitude,
        lng: campus.longitude
      }
    }
  }

  // Get campus options
  const { data: campuses } = await supabase
    .from('campuses')
    .select('id, name')
    .order('name')

  const campusOptions = campuses?.map(campus => ({
    id: campus.id,
    name: campus.name
  })) || []

  // Mock initial listings for demo
  const mockListings: Listing[] = [
    {
      id: 'listing-1',
      title: 'Modern Studio Apartment near UvA',
      address: 'Spuistraat 123',
      city: 'Amsterdam',
      coords: { lat: 52.3676, lng: 4.9041 },
      coverImageUrl: '/housing/studio-1.jpg',
      priceMonthly: 1200,
      moveInISO: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      leaseMonths: 6,
      roomType: 'studio',
      beds: 1,
      baths: 1,
      furnished: true,
      utilitiesIncluded: true,
      petsAllowed: false,
      smokingPolicy: 'none',
      accessibility: { elevator: true, stepFree: false, groundFloor: false },
      distanceKmToCampus: 0.8,
      compatibilityScore: 87,
      compatibilityReasons: [
        'Great value - €300 under budget',
        'Located in your preferred city: Amsterdam',
        'Close to university'
      ],
      roommatesCount: 0,
      isNew: true,
      isPopular: false,
      verification: {
        universityVerified: true,
        hostIdVerified: false,
        agencyKvKVerified: false,
        lastAuditISO: new Date().toISOString()
      },
      agencyOrHost: {
        name: 'Amsterdam Housing Co.',
        responseTimeHrs: 24,
        rating: 4.5
      },
      // Additional required fields
      description: 'Beautiful modern studio apartment perfect for students.',
      postalCode: '1012 VG',
      propertyType: 'studio',
      totalRooms: 1,
      availableRooms: 1,
      totalBathrooms: 1,
      squareMeters: 35,
      utilitiesCost: 0,
      depositAmount: 2400,
      agencyFee: 0,
      availableUntil: undefined,
      minStayMonths: 6,
      maxStayMonths: 12,
      amenities: ['wifi', 'heating', 'washing_machine', 'near_university'],
      parkingAvailable: false,
      parkingCost: 0,
      universityId: 'university-1',
      landlordName: 'Amsterdam Housing Co.',
      landlordEmail: 'contact@amsterdamhousing.nl',
      landlordPhone: '+31 20 123 4567',
      agencyName: 'Amsterdam Housing Co.',
      agencyLicense: 'NL123456789',
      photos: ['/housing/studio-1.jpg', '/housing/studio-2.jpg'],
      virtualTourUrl: 'https://example.com/virtual-tour/1',
      floorPlanUrl: undefined,
      status: 'active',
      moderationStatus: 'approved',
      moderationNotes: undefined,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: undefined
    }
  ]

  return (
    <AppShell user={{
      id: demoUser.id,
      email: demoUser.email || '',
      name: demoUser.user_metadata?.full_name || 'Demo User',
      avatar: demoUser.user_metadata?.avatar_url
    }}>
      <HousingPageClient
        initialListings={mockListings}
        initialFilters={getDefaultFilters()}
        campusOptions={campusOptions}
        userCampusId={userProfile?.campus_id}
        userCampusCoords={userCampusCoords}
      />
    </AppShell>
  )
}
