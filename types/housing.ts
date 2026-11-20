// Enhanced Housing Types for Modern UI
// Extends existing lib/housing/types.ts with new types for the refactored housing page

export type Verification = {
  universityVerified: boolean
  hostIdVerified: boolean
  agencyKvKVerified: boolean
  lastAuditISO?: string
}

/** WWS (Dutch rent-points) certification shown on listing detail */
export type WwsCertificationStatus =
  | 'under_review'
  | 'certified'
  | 'not_certified'

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
  roomType: 'room' | 'studio' | 'apartment' | 'shared'
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
  /** Section scores 0–100 for lifestyle / budget / timeline */
  scoreBreakdown?: {
    lifestyle: number
    budget: number
    timeline: number
    capacity?: number
    amenities?: number
  }
  /** Per-dimension + overall insight copy explaining the fit score */
  scoreInsights?: {
    lifestyle?: string
    budget?: string
    timeline?: string
    overall?: string
  }
  watchOuts?: string[]
  hostVerified?: boolean
  /** Apply / viewing / pin enabled only when host email is verified */
  actionsEnabled?: boolean
  seekingPeople?: number
  roommatesCount?: number
  isNew?: boolean
  isPopular?: boolean
  /** WWS rent-points badge status (admin-reviewed) */
  wwsStatus?: WwsCertificationStatus
  verification: Verification
  agencyOrHost?: {
    name: string
    responseTimeHrs?: number
    rating?: number
    /** private_landlord | agency */
    hostType?: 'private_landlord' | 'agency'
    companyName?: string | null
    bio?: string | null
    /** Signed URL for host profile photo */
    avatarUrl?: string | null
    /** ISO timestamp when the host joined Domu Match */
    joinedAt?: string | null
    /** Other active + approved listings by this host (excl. current) */
    otherListingsCount?: number
    idVerified?: boolean
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
  landlordEmail?: string // Optional - only included for authenticated users
  landlordPhone?: string
  agencyName?: string
  agencyLicense?: string // Optional - only included for authenticated users
  photos: string[]
  virtualTourUrl?: string
  floorPlanUrl?: string
  status: 'active' | 'pending' | 'suspended' | 'rented' | 'expired'
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'needs_review' // Optional - only included for authenticated users
  moderationNotes?: string // Optional - only included for authenticated users
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export type FiltersState = {
  q?: string
  priceMin?: number
  priceMax?: number
  city?: string
  address?: string
  lat?: number
  lng?: number
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
