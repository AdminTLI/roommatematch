'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { HousingListingCard } from '@/app/(components)/housing-listing-card'
import { TourBookingModal } from '@/app/(components)/tour-booking-modal'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { 
  Search, 
  Filter, 
  MapPin, 
  Euro, 
  Calendar,
  Home,
  TrendingUp,
  Shield,
  Star,
  AlertCircle
} from 'lucide-react'
import { 
  HousingListingWithCompatibility, 
  HousingSearchFilters, 
  TourBookingRequest,
  COMMON_AMENITIES,
  PROPERTY_TYPES,
  ROOM_TYPES
} from '@/lib/housing/types'
import { HousingUtils } from '@/lib/housing/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface HousingFeedProps {
  user: User
}

export function HousingFeed({ user }: HousingFeedProps) {
  const supabase = createClient()
  
  const [listings, setListings] = useState<HousingListingWithCompatibility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<HousingSearchFilters>({
    min_compatibility: 0.5,
    verified_only: false
  })
  const [selectedListing, setSelectedListing] = useState<HousingListingWithCompatibility | null>(null)
  const [showTourModal, setShowTourModal] = useState(false)
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadListings()
  }, [filters])

  const loadListings = async () => {
    setIsLoading(true)
    
    try {
      // For demo mode, use mock data
      if (user.id === 'demo-user-id') {
        const mockListings = await generateMockListings()
        setListings(mockListings)
        setIsLoading(false)
        return
      }

      // Load compatible housing listings using RPC
      const { data: listingData, error } = await supabase.rpc('get_compatible_housing_listings', {
        p_user_id: user.id,
        p_limit: 20,
        p_offset: 0,
        p_min_compatibility: filters.min_compatibility || 0.5
      })

      if (error) throw error

      // Transform the data to match our interface
      const transformedListings: HousingListingWithCompatibility[] = (listingData || []).map((item: any) => ({
        id: item.listing_id,
        title: item.title,
        description: '',
        address: item.address,
        city: item.city,
        postal_code: '',
        property_type: 'apartment',
        room_type: 'private',
        total_rooms: 2,
        available_rooms: 1,
        total_bathrooms: 1,
        rent_monthly: item.rent_monthly,
        utilities_included: false,
        utilities_cost: 0,
        deposit_amount: 0,
        agency_fee: 0,
        available_from: item.available_from,
        min_stay_months: 1,
        amenities: item.amenities || [],
        pet_friendly: false,
        smoking_allowed: false,
        furnished: false,
        parking_available: false,
        parking_cost: 0,
        verified_by_university: false,
        landlord_name: '',
        landlord_email: '',
        photos: item.photos || [],
        status: 'active',
        moderation_status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        compatibility_score: item.compatibility_score,
        compatibility_breakdown: undefined,
        positive_factors: [],
        negative_factors: []
      }))

      setListings(transformedListings)

    } catch (error) {
      console.error('Failed to load listings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockListings = async (): Promise<HousingListingWithCompatibility[]> => {
    return [
      {
        id: 'listing-1',
        title: 'Modern Studio Apartment near UvA',
        description: 'Beautiful modern studio apartment perfect for students. Located just 5 minutes walk from the University of Amsterdam.',
        address: 'Spuistraat 123',
        city: 'Amsterdam',
        postal_code: '1012 VG',
        property_type: 'studio',
        room_type: 'studio',
        total_rooms: 1,
        available_rooms: 1,
        total_bathrooms: 1,
        rent_monthly: 1200,
        utilities_included: true,
        utilities_cost: 0,
        deposit_amount: 2400,
        agency_fee: 0,
        available_from: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        min_stay_months: 6,
        amenities: ['wifi', 'heating', 'washing_machine', 'near_university', 'near_public_transport'],
        pet_friendly: false,
        smoking_allowed: false,
        furnished: true,
        parking_available: false,
        parking_cost: 0,
        verified_by_university: true,
        landlord_name: 'Amsterdam Housing Co.',
        landlord_email: 'contact@amsterdamhousing.nl',
        photos: ['/housing/studio-1.jpg', '/housing/studio-2.jpg'],
        virtual_tour_url: 'https://example.com/virtual-tour/1',
        status: 'active',
        moderation_status: 'approved',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        compatibility_score: 0.87,
        compatibility_breakdown: {
          budget: 0.9,
          location: 0.95,
          amenities: 0.8,
          timeline: 0.85
        },
        positive_factors: [
          'Great value - €300 under budget',
          'Located in your preferred city: Amsterdam',
          'Close to university',
          'University-verified listing',
          'Virtual tour available'
        ],
        negative_factors: []
      },
      {
        id: 'listing-2',
        title: 'Shared Room in Student House',
        description: 'Large shared room in a vibrant student house with 4 other international students.',
        address: 'Oosterpark 45',
        city: 'Amsterdam',
        postal_code: '1092 AC',
        property_type: 'shared_room',
        room_type: 'shared',
        total_rooms: 5,
        available_rooms: 1,
        total_bathrooms: 2,
        rent_monthly: 650,
        utilities_included: true,
        utilities_cost: 0,
        deposit_amount: 1300,
        agency_fee: 0,
        available_from: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        min_stay_months: 3,
        amenities: ['wifi', 'heating', 'washing_machine', 'common_area', 'near_public_transport'],
        pet_friendly: false,
        smoking_allowed: false,
        furnished: true,
        parking_available: true,
        parking_cost: 50,
        verified_by_university: false,
        landlord_name: 'Student Housing Amsterdam',
        landlord_email: 'info@studenthousing.nl',
        photos: ['/housing/shared-1.jpg', '/housing/shared-2.jpg'],
        status: 'active',
        moderation_status: 'approved',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        compatibility_score: 0.72,
        compatibility_breakdown: {
          budget: 0.95,
          location: 0.8,
          amenities: 0.6,
          timeline: 0.75
        },
        positive_factors: [
          'Great value - €850 under budget',
          'Located in your preferred city: Amsterdam',
          'Perfect availability timing'
        ],
        negative_factors: [
          'Missing 1 required amenities'
        ]
      },
      {
        id: 'listing-3',
        title: 'Private Room with Balcony',
        description: 'Spacious private room with private balcony overlooking the canal. Perfect for quiet study.',
        address: 'Keizersgracht 234',
        city: 'Amsterdam',
        postal_code: '1016 CT',
        property_type: 'private_room',
        room_type: 'private',
        total_rooms: 3,
        available_rooms: 1,
        total_bathrooms: 2,
        rent_monthly: 1100,
        utilities_included: false,
        utilities_cost: 150,
        deposit_amount: 2500,
        agency_fee: 110,
        available_from: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        min_stay_months: 12,
        amenities: ['wifi', 'heating', 'balcony', 'storage', 'near_university'],
        pet_friendly: true,
        smoking_allowed: false,
        furnished: true,
        parking_available: false,
        parking_cost: 0,
        verified_by_university: true,
        landlord_name: 'Canal Properties',
        landlord_email: 'rentals@canalproperties.nl',
        photos: ['/housing/private-1.jpg', '/housing/private-2.jpg', '/housing/private-3.jpg'],
        status: 'active',
        moderation_status: 'approved',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        compatibility_score: 0.68,
        compatibility_breakdown: {
          budget: 0.7,
          location: 0.9,
          amenities: 0.5,
          timeline: 0.6
        },
        positive_factors: [
          'Located in your preferred city: Amsterdam',
          'Close to university',
          'University-verified listing'
        ],
        negative_factors: [
          '€150 over your budget',
          'Missing 2 required amenities'
        ]
      }
    ]
  }

  const handleBookTour = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId)
    if (listing) {
      setSelectedListing(listing)
      setShowTourModal(true)
    }
  }

  const handleTourBooking = async (request: TourBookingRequest) => {
    try {
      if (user.id === 'demo-user-id') {
        console.log('Demo: Booking tour', request)
        // Simulate successful booking
        return
      }

      const { error } = await supabase
        .from('tour_bookings')
        .insert({
          listing_id: request.listing_id,
          user_id: user.id,
          tour_type: request.tour_type,
          scheduled_for: request.preferred_date,
          duration_minutes: request.duration_minutes,
          contact_name: request.contact_name,
          contact_phone: request.contact_phone,
          contact_email: request.contact_email,
          notes: request.notes,
          special_requests: request.special_requests,
          attendees_count: request.attendees_count
        })

      if (error) throw error

      console.log('Tour booked successfully!')
    } catch (error) {
      console.error('Failed to book tour:', error)
      throw error
    }
  }

  const handleSaveListing = (listingId: string) => {
    setSavedListings(prev => {
      const newSet = new Set(prev)
      if (newSet.has(listingId)) {
        newSet.delete(listingId)
      } else {
        newSet.add(listingId)
      }
      return newSet
    })
  }

  const handleViewDetails = (listingId: string) => {
    // Navigate to detailed listing view
    console.log('View details for listing:', listingId)
  }

  const handleShareListing = (listingId: string) => {
    // Share listing functionality
    console.log('Share listing:', listingId)
  }

  const handleContactLandlord = (listingId: string) => {
    // Contact landlord functionality
    console.log('Contact landlord for listing:', listingId)
  }

  const filteredListings = listings.filter(listing => {
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !listing.city.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    if (filters.verified_only && !listing.verified_by_university) {
      return false
    }
    
    return true
  })

  const stats = {
    total_listings: listings.length,
    verified_listings: listings.filter(l => l.verified_by_university).length,
    avg_compatibility: listings.length > 0 
      ? Math.round(listings.reduce((sum, l) => sum + (l.compatibility_score || 0), 0) / listings.length * 100) / 100
      : 0,
    saved_count: savedListings.size
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Verified Housing Feed
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          University-vetted listings matched to your preferences and budget
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Home className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.total_listings}</div>
                <div className="text-sm text-gray-500">Available Listings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.verified_listings}</div>
                <div className="text-sm text-gray-500">University Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{Math.round(stats.avg_compatibility * 100)}%</div>
                <div className="text-sm text-gray-500">Avg. Compatibility</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.saved_count}</div>
                <div className="text-sm text-gray-500">Saved Listings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by title, city, or address..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Listings</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified_only"
                    checked={filters.verified_only}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, verified_only: !!checked }))
                    }
                  />
                  <Label htmlFor="verified_only">University verified only</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Minimum Compatibility</Label>
                  <Select
                    value={filters.min_compatibility?.toString() || '0.5'}
                    onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, min_compatibility: parseFloat(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="0.3">30%+</SelectItem>
                      <SelectItem value="0.5">50%+</SelectItem>
                      <SelectItem value="0.7">70%+</SelectItem>
                      <SelectItem value="0.8">80%+</SelectItem>
                      <SelectItem value="0.9">90%+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <HousingListingCard
              key={listing.id}
              listing={listing}
              onBookTour={handleBookTour}
              onViewDetails={handleViewDetails}
              onSaveListing={handleSaveListing}
              onShareListing={handleShareListing}
              onContactLandlord={handleContactLandlord}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No listings found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search criteria or filters to find more options.
            </p>
            <Button onClick={() => {
              setSearchQuery('')
              setFilters({ min_compatibility: 0.5, verified_only: false })
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tour Booking Modal */}
      <TourBookingModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        listing={selectedListing}
        onBookTour={handleTourBooking}
      />
    </div>
  )
}
