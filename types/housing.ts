// Enhanced Housing Types for Modern UI
// Extends existing lib/housing/types.ts with new types for the refactored housing page

export type Verification = {
  universityVerified: boolean
  hostIdVerified: boolean
  agencyKvKVerified: boolean
  lastAuditISO?: string
}

export type Coords = {
  lat: number
  lng: number
}

export type Bounds = {
  north: number
  south: number
  east: number
  west: number
}

export type Listing = {
  id: string
  title: string
  address: string
  city: string
  coords: Coords
  coverImageUrl?: string
  priceMonthly: number
  moveInISO?: string
  leaseMonths?: number
  roomType: 'room' | 'studio' | 'apartment'
  beds?: number
  baths?: number
  furnished?: boolean
  utilitiesIncluded?: boolean
  petsAllowed?: boolean
  smokingPolicy?: 'none' | 'outdoor' | 'allowed'
  accessibility?: {
    elevator?: boolean
    stepFree?: boolean
    groundFloor?: boolean
  }
  distanceKmToCampus?: number // computed on fetch if campus chosen
  compatibilityScore?: number // 0-100
  compatibilityReasons?: string[] // top 3
  roommatesCount?: number
  isNew?: boolean
  isPopular?: boolean
  verification: Verification
  agencyOrHost?: {
    name: string
    responseTimeHrs?: number
    rating?: number
  }
  // Additional fields from existing schema
  description: string
  postalCode: string
  propertyType: 'apartment' | 'house' | 'studio' | 'shared_room' | 'private_room'
  totalRooms: number
  availableRooms: number
  totalBathrooms: number
  squareMeters?: number
  utilitiesCost: number
  depositAmount: number
  agencyFee: number
  availableUntil?: string
  minStayMonths: number
  maxStayMonths?: number
  amenities: string[]
  parkingAvailable: boolean
  parkingCost: number
  universityId?: string
  landlordName: string
  landlordEmail: string
  landlordPhone?: string
  agencyName?: string
  agencyLicense?: string
  photos: string[]
  virtualTourUrl?: string
  floorPlanUrl?: string
  status: 'active' | 'pending' | 'suspended' | 'rented' | 'expired'
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'needs_review'
  moderationNotes?: string
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export type FiltersState = {
  q?: string
  priceMin?: number
  priceMax?: number
  city?: string
  radiusKm?: number
  moveInFrom?: string
  moveInTo?: string
  leaseMonths?: number[]
  roomTypes?: Listing['roomType'][]
  furnished?: boolean
  utilitiesIncluded?: boolean
  petsAllowed?: boolean
  smokingPolicy?: Listing['smokingPolicy']
  accessibility?: ('elevator' | 'stepFree' | 'groundFloor')[]
  campusId?: string
  maxDistanceKm?: number
  universityVerifiedOnly?: boolean

  // Compatibility
  minCompatibility?: number // default 70
  quietHours?: 'strict' | 'normal' | 'flexible'
  cleanlinessLevel?: 1 | 2 | 3 | 4 | 5
  guestPolicy?: 'rare' | 'occasional' | 'frequent'
  lifestyleTags?: string[]
  
  // View/sort
  sort?: SortOption
  view?: ViewMode
  page?: number
}

export type SortOption = 'best' | 'priceAsc' | 'priceDesc' | 'distance' | 'newest'

export type ViewMode = 'split' | 'list' | 'map'

export type SavedSearch = {
  id: string
  userId: string
  name: string
  filtersJson: FiltersState
  filtersHash: string
  notifyEmail: boolean
  notifyPush: boolean
  frequency: 'instant' | 'daily' | 'weekly'
  createdAt: string
  updatedAt: string
}

export type ReportListingRequest = {
  reason: string
  details: string
}

export type SaveSearchRequest = {
  name: string
  filters: FiltersState
  notifyEmail: boolean
  notifyPush: boolean
  frequency: 'instant' | 'daily' | 'weekly'
}

// Campus/University types
export type Campus = {
  id: string
  name: string
  universityId: string
  coords: Coords
  address: string
}

export type University = {
  id: string
  name: string
  slug: string
  campuses: Campus[]
}

// API Response types
export type ListingsResponse = {
  items: Listing[]
  total: number
  page: number
  pageSize: number
}

export type SavedSearchesResponse = {
  items: SavedSearch[]
  total: number
}

// Map types
export type MapMarker = {
  id: string
  coords: Coords
  price: number
  isHighlighted?: boolean
}

export type MapViewport = {
  center: Coords
  zoom: number
  bounds: Bounds
}
