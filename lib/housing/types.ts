// Housing Feed & Tours System Types
// This module defines TypeScript interfaces for the housing marketplace

export interface HousingListing {
  id: string
  title: string
  description: string
  address: string
  city: string
  postal_code: string
  latitude?: number
  longitude?: number
  
  // Property details
  property_type: 'apartment' | 'house' | 'studio' | 'shared_room' | 'private_room'
  room_type: 'private' | 'shared' | 'studio' | 'entire_place'
  total_rooms: number
  available_rooms: number
  total_bathrooms: number
  square_meters?: number
  
  // Pricing
  rent_monthly: number
  utilities_included: boolean
  utilities_cost: number
  deposit_amount: number
  agency_fee: number
  
  // Availability
  available_from: string
  available_until?: string
  min_stay_months: number
  max_stay_months?: number
  
  // Amenities and features
  amenities: string[]
  pet_friendly: boolean
  smoking_allowed: boolean
  furnished: boolean
  parking_available: boolean
  parking_cost: number
  
  // University integration
  university_id?: string
  verified_by_university: boolean
  verification_date?: string
  
  // Landlord/agency info
  landlord_name: string
  landlord_email: string
  landlord_phone?: string
  agency_name?: string
  agency_license?: string
  
  // Media
  photos: string[]
  virtual_tour_url?: string
  floor_plan_url?: string
  
  // Status
  status: 'active' | 'pending' | 'suspended' | 'rented' | 'expired'
  moderation_status: 'pending' | 'approved' | 'rejected' | 'needs_review'
  moderation_notes?: string
  
  // Metadata
  created_at: string
  updated_at: string
  expires_at?: string
}

export interface TourBooking {
  id: string
  listing_id: string
  user_id: string
  tour_type: 'in_person' | 'virtual' | 'video_call'
  scheduled_for: string
  duration_minutes: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  
  // Contact info
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  
  // Tour details
  notes?: string
  special_requests?: string
  attendees_count: number
  
  // Confirmation tracking
  confirmation_sent_at?: string
  reminder_sent_at?: string
  feedback_requested_at?: string
  
  created_at: string
  updated_at: string
}

export interface UserHousingPreferences {
  id: string
  user_id: string
  
  // Location preferences
  preferred_cities: string[]
  max_commute_minutes?: number
  near_university: boolean
  
  // Property preferences
  preferred_property_types: string[]
  preferred_room_type?: string
  min_square_meters?: number
  max_square_meters?: number
  
  // Budget preferences
  max_rent_monthly: number
  utilities_preference: 'included' | 'separate' | 'either'
  
  // Amenity preferences
  required_amenities: string[]
  preferred_amenities: string[]
  pet_friendly_required: boolean
  smoking_preference: 'no_smoking' | 'smoking_ok' | 'either'
  
  // Stay preferences
  min_stay_months: number
  max_stay_months?: number
  move_in_flexibility_days: number
  
  // Roommate preferences
  prefer_matched_roommates: boolean
  max_roommates: number
  gender_preference?: 'same' | 'opposite' | 'any'
  
  created_at: string
  updated_at: string
}

export interface HousingApplication {
  id: string
  listing_id: string
  user_id: string
  
  // Application details
  application_type: 'individual' | 'group'
  group_members: string[]
  
  // Status
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn'
  
  // Content
  motivation_letter?: string
  references: string[]
  employment_status?: string
  income_proof_url?: string
  
  // Decision tracking
  reviewed_by?: string
  reviewed_at?: string
  decision_notes?: string
  
  created_at: string
  updated_at: string
}

export interface HousingCompatibilityScore {
  id: string
  listing_id: string
  user_id: string
  
  // Compatibility factors
  budget_compatibility: number
  location_compatibility: number
  amenity_compatibility: number
  timeline_compatibility: number
  
  // Overall score
  overall_compatibility: number
  
  // Factors
  positive_factors: string[]
  negative_factors: string[]
  
  created_at: string
}

export interface HousingListingWithCompatibility extends HousingListing {
  compatibility_score?: number
  compatibility_breakdown?: {
    budget: number
    location: number
    amenities: number
    timeline: number
  }
  positive_factors?: string[]
  negative_factors?: string[]
}

export interface HousingSearchFilters {
  city?: string
  max_rent?: number
  property_types?: string[]
  room_types?: string[]
  amenities?: string[]
  available_from?: string
  available_until?: string
  min_compatibility?: number
  verified_only?: boolean
  pet_friendly?: boolean
  furnished?: boolean
  parking_available?: boolean
}

export interface TourBookingRequest {
  listing_id: string
  tour_type: 'in_person' | 'virtual' | 'video_call'
  preferred_date: string
  preferred_time: string
  duration_minutes?: number
  contact_name: string
  contact_phone: string
  contact_email: string
  notes?: string
  special_requests?: string
  attendees_count?: number
}

export interface HousingPreferencesForm {
  // Location
  preferred_cities: string[]
  max_commute_minutes?: number
  near_university: boolean
  
  // Property
  preferred_property_types: string[]
  preferred_room_type?: string
  min_square_meters?: number
  max_square_meters?: number
  
  // Budget
  max_rent_monthly: number
  utilities_preference: 'included' | 'separate' | 'either'
  
  // Amenities
  required_amenities: string[]
  preferred_amenities: string[]
  pet_friendly_required: boolean
  smoking_preference: 'no_smoking' | 'smoking_ok' | 'either'
  
  // Stay
  min_stay_months: number
  max_stay_months?: number
  move_in_flexibility_days: number
  
  // Roommates
  prefer_matched_roommates: boolean
  max_roommates: number
  gender_preference?: 'same' | 'opposite' | 'any'
}

// Constants for housing system
export const PROPERTY_TYPES = [
  'apartment',
  'house', 
  'studio',
  'shared_room',
  'private_room'
] as const

export const ROOM_TYPES = [
  'private',
  'shared',
  'studio',
  'entire_place'
] as const

export const COMMON_AMENITIES = [
  'wifi',
  'heating',
  'air_conditioning',
  'washing_machine',
  'dishwasher',
  'garden',
  'balcony',
  'terrace',
  'elevator',
  'security',
  'storage',
  'bike_storage',
  'gym',
  'common_area',
  'rooftop',
  'near_public_transport',
  'near_supermarket',
  'near_university'
] as const

export const TOUR_TYPES = [
  'in_person',
  'virtual',
  'video_call'
] as const

export const APPLICATION_STATUSES = [
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'withdrawn'
] as const
