// Roommate Reputation & References System Types

export interface Endorsement {
  id: string
  endorser_id: string
  endorsee_id: string
  endorsement_type: EndorsementType
  category: EndorsementCategory
  rating: number // 1-5
  comment?: string
  context?: string
  is_anonymous: boolean
  is_verified: boolean
  verified_by?: string
  verified_at?: string
  created_at: string
  updated_at: string
}

export interface Reference {
  id: string
  referrer_id: string
  referee_id: string
  reference_type: ReferenceType
  relationship_duration?: string
  relationship_context?: string
  overall_rating: number // 1-5
  
  // Detailed ratings
  cleanliness_rating?: number
  communication_rating?: number
  responsibility_rating?: number
  respect_rating?: number
  reliability_rating?: number
  financial_trust_rating?: number
  
  // Written testimonial
  testimonial: string
  strengths?: string[]
  areas_for_improvement?: string[]
  
  // Contact verification
  contact_email?: string
  contact_phone?: string
  contact_verified: boolean
  contact_verified_at?: string
  
  // Moderation
  status: ReferenceStatus
  moderated_by?: string
  moderated_at?: string
  moderation_notes?: string
  
  // Visibility
  is_public: boolean
  is_anonymous: boolean
  
  created_at: string
  updated_at: string
}

export interface TrustBadge {
  id: string
  user_id: string
  badge_type: TrustBadgeType
  badge_level: TrustBadgeLevel
  earned_at: string
  expires_at?: string
  awarded_by_system: boolean
  awarded_by?: string
  criteria_met?: Record<string, any>
  is_active: boolean
}

export interface ReputationScore {
  id: string
  user_id: string
  
  // Overall reputation score (0-100)
  overall_score: number
  
  // Category-specific scores
  cleanliness_score: number
  communication_score: number
  responsibility_score: number
  respect_score: number
  reliability_score: number
  financial_trust_score: number
  
  // Metrics
  total_endorsements: number
  total_references: number
  average_rating: number
  response_rate: number
  
  last_calculated_at: string
  created_at: string
  updated_at: string
}

export interface EndorsementRequest {
  id: string
  requester_id: string
  requested_from_id: string
  endorsement_type: EndorsementType
  context?: string
  message?: string
  status: EndorsementRequestStatus
  expires_at: string
  responded_at?: string
  created_at: string
}

export interface UserReputationSummary {
  user_id: string
  overall_score: number
  total_endorsements: number
  total_references: number
  average_rating: number
  trust_badges: TrustBadge[]
  recent_endorsements: Endorsement[]
  top_categories: {
    cleanliness: number
    communication: number
    responsibility: number
    respect: number
    reliability: number
    financial_trust: number
  }
}

// Enums
export type EndorsementType = 'roommate' | 'tenant' | 'student' | 'peer'
export type EndorsementCategory = 
  | 'cleanliness' 
  | 'communication' 
  | 'responsibility' 
  | 'respect' 
  | 'reliability' 
  | 'friendliness' 
  | 'study_habits' 
  | 'financial_trust' 
  | 'general'

export type ReferenceType = 'roommate' | 'landlord' | 'university_staff' | 'peer' | 'employer'
export type ReferenceStatus = 'pending' | 'approved' | 'rejected' | 'needs_review'

export type TrustBadgeType = 
  | 'verified_roommate' 
  | 'reliable_tenant' 
  | 'excellent_communicator' 
  | 'clean_living' 
  | 'financial_trust' 
  | 'study_buddy' 
  | 'social_connector' 
  | 'university_endorsed' 
  | 'landlord_recommended'

export type TrustBadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum'
export type EndorsementRequestStatus = 'pending' | 'accepted' | 'declined' | 'expired'

// Form types for creating endorsements and references
export interface CreateEndorsementData {
  endorsee_id: string
  endorsement_type: EndorsementType
  category: EndorsementCategory
  rating: number
  comment?: string
  context?: string
  is_anonymous?: boolean
}

export interface CreateReferenceData {
  referee_id: string
  reference_type: ReferenceType
  relationship_duration?: string
  relationship_context?: string
  overall_rating: number
  cleanliness_rating?: number
  communication_rating?: number
  responsibility_rating?: number
  respect_rating?: number
  reliability_rating?: number
  financial_trust_rating?: number
  testimonial: string
  strengths?: string[]
  areas_for_improvement?: string[]
  contact_email?: string
  contact_phone?: string
  is_public?: boolean
  is_anonymous?: boolean
}

export interface CreateEndorsementRequestData {
  requested_from_id: string
  endorsement_type: EndorsementType
  context?: string
  message?: string
}

// Badge configuration
export interface BadgeConfig {
  type: TrustBadgeType
  name: string
  description: string
  icon: string
  color: string
  requirements: {
    min_score?: number
    min_endorsements?: number
    min_references?: number
    categories?: EndorsementCategory[]
  }
}

// Trust badge configurations
export const TRUST_BADGE_CONFIGS: Record<TrustBadgeType, BadgeConfig> = {
  verified_roommate: {
    type: 'verified_roommate',
    name: 'Verified Roommate',
    description: 'Has excellent roommate reputation',
    icon: 'Shield',
    color: 'bg-blue-100 text-blue-800',
    requirements: {
      min_score: 80,
      min_endorsements: 3
    }
  },
  reliable_tenant: {
    type: 'reliable_tenant',
    name: 'Reliable Tenant',
    description: 'Trusted by landlords and property managers',
    icon: 'Home',
    color: 'bg-green-100 text-green-800',
    requirements: {
      min_score: 85,
      min_references: 2
    }
  },
  excellent_communicator: {
    type: 'excellent_communicator',
    name: 'Excellent Communicator',
    description: 'Highly rated for communication skills',
    icon: 'MessageCircle',
    color: 'bg-purple-100 text-purple-800',
    requirements: {
      min_score: 90,
      categories: ['communication']
    }
  },
  clean_living: {
    type: 'clean_living',
    name: 'Clean Living',
    description: 'Exceptional cleanliness standards',
    icon: 'Sparkles',
    color: 'bg-cyan-100 text-cyan-800',
    requirements: {
      min_score: 85,
      categories: ['cleanliness']
    }
  },
  financial_trust: {
    type: 'financial_trust',
    name: 'Financial Trust',
    description: 'Trusted with financial responsibilities',
    icon: 'CreditCard',
    color: 'bg-emerald-100 text-emerald-800',
    requirements: {
      min_score: 90,
      categories: ['financial_trust']
    }
  },
  study_buddy: {
    type: 'study_buddy',
    name: 'Study Buddy',
    description: 'Great study habits and academic focus',
    icon: 'BookOpen',
    color: 'bg-indigo-100 text-indigo-800',
    requirements: {
      min_score: 80,
      categories: ['study_habits']
    }
  },
  social_connector: {
    type: 'social_connector',
    name: 'Social Connector',
    description: 'Brings people together and creates community',
    icon: 'Users',
    color: 'bg-pink-100 text-pink-800',
    requirements: {
      min_score: 75,
      categories: ['friendliness', 'communication']
    }
  },
  university_endorsed: {
    type: 'university_endorsed',
    name: 'University Endorsed',
    description: 'Officially endorsed by university staff',
    icon: 'GraduationCap',
    color: 'bg-yellow-100 text-yellow-800',
    requirements: {
      min_references: 1
    }
  },
  landlord_recommended: {
    type: 'landlord_recommended',
    name: 'Landlord Recommended',
    description: 'Highly recommended by property owners',
    icon: 'Building',
    color: 'bg-orange-100 text-orange-800',
    requirements: {
      min_score: 85,
      min_references: 1
    }
  }
}

// Category configurations
export const ENDORSEMENT_CATEGORIES: Record<EndorsementCategory, { name: string; description: string; icon: string }> = {
  cleanliness: {
    name: 'Cleanliness',
    description: 'How well they maintain shared spaces',
    icon: 'Sparkles'
  },
  communication: {
    name: 'Communication',
    description: 'How effectively they communicate',
    icon: 'MessageCircle'
  },
  responsibility: {
    name: 'Responsibility',
    description: 'How reliable and accountable they are',
    icon: 'CheckCircle'
  },
  respect: {
    name: 'Respect',
    description: 'How respectful they are of others',
    icon: 'Heart'
  },
  reliability: {
    name: 'Reliability',
    description: 'How dependable and trustworthy they are',
    icon: 'Shield'
  },
  friendliness: {
    name: 'Friendliness',
    description: 'How warm and approachable they are',
    icon: 'Smile'
  },
  study_habits: {
    name: 'Study Habits',
    description: 'How they balance study time and social life',
    icon: 'BookOpen'
  },
  financial_trust: {
    name: 'Financial Trust',
    description: 'How trustworthy they are with money matters',
    icon: 'CreditCard'
  },
  general: {
    name: 'General',
    description: 'Overall roommate experience',
    icon: 'Star'
  }
}

// Rating descriptions
export const RATING_DESCRIPTIONS = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent'
} as const

// Reputation score tiers
export const REPUTATION_TIERS = {
  excellent: { min: 90, label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' },
  very_good: { min: 80, label: 'Very Good', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  good: { min: 70, label: 'Good', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  fair: { min: 60, label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  poor: { min: 0, label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-50' }
} as const
