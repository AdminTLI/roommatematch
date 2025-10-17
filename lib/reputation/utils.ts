// Roommate Reputation & References System Utilities

import { createClient } from '@/lib/supabase/client'
import type {
  Endorsement,
  Reference,
  TrustBadge,
  ReputationScore,
  EndorsementRequest,
  UserReputationSummary,
  CreateEndorsementData,
  CreateReferenceData,
  CreateEndorsementRequestData,
  TrustBadgeType,
  EndorsementCategory,
  ReferenceType,
  TrustBadgeLevel
} from './types'
import { TRUST_BADGE_CONFIGS, REPUTATION_TIERS, RATING_DESCRIPTIONS } from './types'

const supabase = createClient()

// Endorsement functions
export async function createEndorsement(data: CreateEndorsementData): Promise<Endorsement | null> {
  try {
    const { data: endorsement, error } = await supabase
      .from('endorsements')
      .insert({
        endorsee_id: data.endorsee_id,
        endorsement_type: data.endorsement_type,
        category: data.category,
        rating: data.rating,
        comment: data.comment,
        context: data.context,
        is_anonymous: data.is_anonymous || false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating endorsement:', error)
      return null
    }

    return endorsement
  } catch (error) {
    console.error('Error creating endorsement:', error)
    return null
  }
}

export async function getEndorsementsForUser(userId: string): Promise<Endorsement[]> {
  try {
    const { data: endorsements, error } = await supabase
      .from('endorsements')
      .select('*')
      .eq('endorsee_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching endorsements:', error)
      return []
    }

    return endorsements || []
  } catch (error) {
    console.error('Error fetching endorsements:', error)
    return []
  }
}

export async function getEndorsementsByUser(userId: string): Promise<Endorsement[]> {
  try {
    const { data: endorsements, error } = await supabase
      .from('endorsements')
      .select('*')
      .eq('endorser_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching endorsements:', error)
      return []
    }

    return endorsements || []
  } catch (error) {
    console.error('Error fetching endorsements:', error)
    return []
  }
}

// Reference functions
export async function createReference(data: CreateReferenceData): Promise<Reference | null> {
  try {
    const { data: reference, error } = await supabase
      .from('references')
      .insert({
        referee_id: data.referee_id,
        reference_type: data.reference_type,
        relationship_duration: data.relationship_duration,
        relationship_context: data.relationship_context,
        overall_rating: data.overall_rating,
        cleanliness_rating: data.cleanliness_rating,
        communication_rating: data.communication_rating,
        responsibility_rating: data.responsibility_rating,
        respect_rating: data.respect_rating,
        reliability_rating: data.reliability_rating,
        financial_trust_rating: data.financial_trust_rating,
        testimonial: data.testimonial,
        strengths: data.strengths,
        areas_for_improvement: data.areas_for_improvement,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        is_public: data.is_public || true,
        is_anonymous: data.is_anonymous || false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reference:', error)
      return null
    }

    return reference
  } catch (error) {
    console.error('Error creating reference:', error)
    return null
  }
}

export async function getReferencesForUser(userId: string): Promise<Reference[]> {
  try {
    const { data: references, error } = await supabase
      .from('references')
      .select('*')
      .eq('referee_id', userId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching references:', error)
      return []
    }

    return references || []
  } catch (error) {
    console.error('Error fetching references:', error)
    return []
  }
}

// Trust badge functions
export async function getTrustBadgesForUser(userId: string): Promise<TrustBadge[]> {
  try {
    const { data: badges, error } = await supabase
      .from('trust_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Error fetching trust badges:', error)
      return []
    }

    return badges || []
  } catch (error) {
    console.error('Error fetching trust badges:', error)
    return []
  }
}

// Reputation score functions
export async function getReputationScore(userId: string): Promise<ReputationScore | null> {
  try {
    const { data: score, error } = await supabase
      .from('reputation_scores')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching reputation score:', error)
      return null
    }

    return score
  } catch (error) {
    console.error('Error fetching reputation score:', error)
    return null
  }
}

export async function recalculateReputationScore(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('calculate_reputation_score', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error recalculating reputation score:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error recalculating reputation score:', error)
    return false
  }
}

// Endorsement request functions
export async function createEndorsementRequest(data: CreateEndorsementRequestData): Promise<EndorsementRequest | null> {
  try {
    const { data: request, error } = await supabase
      .from('endorsement_requests')
      .insert({
        requested_from_id: data.requested_from_id,
        endorsement_type: data.endorsement_type,
        context: data.context,
        message: data.message
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating endorsement request:', error)
      return null
    }

    return request
  } catch (error) {
    console.error('Error creating endorsement request:', error)
    return null
  }
}

export async function getEndorsementRequests(userId: string): Promise<EndorsementRequest[]> {
  try {
    const { data: requests, error } = await supabase
      .from('endorsement_requests')
      .select('*')
      .or(`requester_id.eq.${userId},requested_from_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching endorsement requests:', error)
      return []
    }

    return requests || []
  } catch (error) {
    console.error('Error fetching endorsement requests:', error)
    return []
  }
}

export async function respondToEndorsementRequest(
  requestId: string, 
  status: 'accepted' | 'declined'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('endorsement_requests')
      .update({
        status,
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (error) {
      console.error('Error responding to endorsement request:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error responding to endorsement request:', error)
    return false
  }
}

// User reputation summary
export async function getUserReputationSummary(userId: string): Promise<UserReputationSummary | null> {
  try {
    const { data: summary, error } = await supabase.rpc('get_user_reputation_summary', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error fetching user reputation summary:', error)
      return null
    }

    return summary?.[0] || null
  } catch (error) {
    console.error('Error fetching user reputation summary:', error)
    return null
  }
}

// Utility functions
export function getReputationTier(score: number): typeof REPUTATION_TIERS[keyof typeof REPUTATION_TIERS] {
  if (score >= 90) return REPUTATION_TIERS.excellent
  if (score >= 80) return REPUTATION_TIERS.very_good
  if (score >= 70) return REPUTATION_TIERS.good
  if (score >= 60) return REPUTATION_TIERS.fair
  return REPUTATION_TIERS.poor
}

export function getBadgeConfig(badgeType: TrustBadgeType) {
  return TRUST_BADGE_CONFIGS[badgeType]
}

export function getBadgeLevelColor(level: TrustBadgeLevel): string {
  switch (level) {
    case 'bronze':
      return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'silver':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'gold':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'platinum':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function formatReputationScore(score: number): string {
  return `${Math.round(score)}%`
}

export function getRatingDescription(rating: number): string {
  return RATING_DESCRIPTIONS[rating as keyof typeof RATING_DESCRIPTIONS] || 'Unknown'
}

export function canCreateEndorsement(endorserId: string, endorseeId: string): boolean {
  return endorserId !== endorseeId
}

export function canCreateReference(referrerId: string, refereeId: string): boolean {
  return referrerId !== refereeId
}

export function isEndorsementRequestExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

export function getEndorsementRequestStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'accepted':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'declined':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'expired':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

// Demo data functions for testing
export function getDemoReputationSummary(): UserReputationSummary {
  return {
    user_id: 'demo-user-id',
    overall_score: 87.5,
    total_endorsements: 12,
    total_references: 3,
    average_rating: 4.3,
    trust_badges: [
      {
        id: '1',
        user_id: 'demo-user-id',
        badge_type: 'verified_roommate',
        badge_level: 'gold',
        earned_at: '2024-01-15T10:00:00Z',
        awarded_by_system: true,
        is_active: true
      },
      {
        id: '2',
        user_id: 'demo-user-id',
        badge_type: 'excellent_communicator',
        badge_level: 'platinum',
        earned_at: '2024-01-20T14:30:00Z',
        awarded_by_system: true,
        is_active: true
      },
      {
        id: '3',
        user_id: 'demo-user-id',
        badge_type: 'clean_living',
        badge_level: 'gold',
        earned_at: '2024-02-01T09:15:00Z',
        awarded_by_system: true,
        is_active: true
      }
    ],
    recent_endorsements: [
      {
        id: '1',
        endorser_id: 'user-1',
        endorsee_id: 'demo-user-id',
        endorsement_type: 'roommate',
        category: 'communication',
        rating: 5,
        comment: 'Sarah is an amazing communicator! She always keeps everyone in the loop and handles conflicts really well.',
        context: 'Spring 2024',
        is_anonymous: false,
        is_verified: true,
        created_at: '2024-03-01T16:45:00Z',
        updated_at: '2024-03-01T16:45:00Z'
      },
      {
        id: '2',
        endorser_id: 'user-2',
        endorsee_id: 'demo-user-id',
        endorsement_type: 'roommate',
        category: 'cleanliness',
        rating: 5,
        comment: 'Incredibly clean and organized. The shared spaces are always spotless!',
        context: 'Fall 2023',
        is_anonymous: false,
        is_verified: false,
        created_at: '2024-02-15T11:20:00Z',
        updated_at: '2024-02-15T11:20:00Z'
      },
      {
        id: '3',
        endorser_id: 'user-3',
        endorsee_id: 'demo-user-id',
        endorsement_type: 'roommate',
        category: 'reliability',
        rating: 4,
        comment: 'Very reliable and trustworthy. Always pays bills on time and follows through on commitments.',
        context: 'Spring 2024',
        is_anonymous: true,
        is_verified: false,
        created_at: '2024-02-28T13:10:00Z',
        updated_at: '2024-02-28T13:10:00Z'
      }
    ],
    top_categories: {
      cleanliness: 92.0,
      communication: 95.0,
      responsibility: 88.0,
      respect: 90.0,
      reliability: 85.0,
      financial_trust: 82.0
    }
  }
}

export function getDemoEndorsements(): Endorsement[] {
  return [
    {
      id: '1',
      endorser_id: 'user-1',
      endorsee_id: 'demo-user-id',
      endorsement_type: 'roommate',
      category: 'communication',
      rating: 5,
      comment: 'Sarah is an amazing communicator! She always keeps everyone in the loop and handles conflicts really well.',
      context: 'Spring 2024',
      is_anonymous: false,
      is_verified: true,
      created_at: '2024-03-01T16:45:00Z',
      updated_at: '2024-03-01T16:45:00Z'
    },
    {
      id: '2',
      endorser_id: 'user-2',
      endorsee_id: 'demo-user-id',
      endorsement_type: 'roommate',
      category: 'cleanliness',
      rating: 5,
      comment: 'Incredibly clean and organized. The shared spaces are always spotless!',
      context: 'Fall 2023',
      is_anonymous: false,
      is_verified: false,
      created_at: '2024-02-15T11:20:00Z',
      updated_at: '2024-02-15T11:20:00Z'
    },
    {
      id: '3',
      endorser_id: 'user-3',
      endorsee_id: 'demo-user-id',
      endorsement_type: 'roommate',
      category: 'reliability',
      rating: 4,
      comment: 'Very reliable and trustworthy. Always pays bills on time and follows through on commitments.',
      context: 'Spring 2024',
      is_anonymous: true,
      is_verified: false,
      created_at: '2024-02-28T13:10:00Z',
      updated_at: '2024-02-28T13:10:00Z'
    },
    {
      id: '4',
      endorser_id: 'user-4',
      endorsee_id: 'demo-user-id',
      endorsement_type: 'roommate',
      category: 'respect',
      rating: 5,
      comment: 'Extremely respectful of boundaries and personal space. Great listener too!',
      context: 'Winter 2024',
      is_anonymous: false,
      is_verified: true,
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '5',
      endorser_id: 'user-5',
      endorsee_id: 'demo-user-id',
      endorsement_type: 'roommate',
      category: 'study_habits',
      rating: 4,
      comment: 'Great study habits and respects quiet hours. Very considerate during exam periods.',
      context: 'Fall 2023',
      is_anonymous: false,
      is_verified: false,
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-10T09:15:00Z'
    }
  ]
}

export function getDemoReferences(): Reference[] {
  return [
    {
      id: '1',
      referrer_id: 'user-1',
      referee_id: 'demo-user-id',
      reference_type: 'roommate',
      relationship_duration: '8 months',
      relationship_context: 'We lived together in a shared apartment near campus during the 2023-2024 academic year.',
      overall_rating: 5,
      cleanliness_rating: 5,
      communication_rating: 5,
      responsibility_rating: 4,
      respect_rating: 5,
      reliability_rating: 4,
      financial_trust_rating: 5,
      testimonial: 'Sarah was an exceptional roommate and I would highly recommend her to anyone looking for a living situation. She was incredibly clean, communicative, and respectful of shared spaces. Her organizational skills were impressive, and she always paid her share of bills on time. She handled conflicts maturely and was always willing to compromise when needed. I truly enjoyed living with her and would do so again in a heartbeat.',
      strengths: ['Excellent communication', 'Very clean and organized', 'Reliable with bills', 'Great conflict resolution', 'Respectful of boundaries'],
      areas_for_improvement: ['Could be more social at times'],
      contact_verified: true,
      status: 'approved',
      is_public: true,
      is_anonymous: false,
      created_at: '2024-03-01T16:45:00Z',
      updated_at: '2024-03-01T16:45:00Z'
    },
    {
      id: '2',
      referrer_id: 'user-6',
      referee_id: 'demo-user-id',
      reference_type: 'university_staff',
      relationship_duration: '2 years',
      relationship_context: 'I worked with Sarah as her academic advisor and supervised her in a student leadership role.',
      overall_rating: 5,
      cleanliness_rating: 4,
      communication_rating: 5,
      responsibility_rating: 5,
      respect_rating: 5,
      reliability_rating: 5,
      financial_trust_rating: 4,
      testimonial: 'Sarah is an outstanding student and leader. She demonstrates exceptional responsibility, communication skills, and integrity in all her endeavors. As her academic advisor, I\'ve seen her consistently meet deadlines, collaborate effectively with peers, and take initiative in group projects. Her leadership in student organizations has been exemplary, and she\'s known for her ability to bring people together and resolve conflicts. I have no hesitation in recommending Sarah for any living situation or leadership role.',
      strengths: ['Strong leadership skills', 'Excellent academic performance', 'Great team player', 'Proactive problem solver', 'High integrity'],
      areas_for_improvement: ['Could take more risks in decision-making'],
      contact_verified: true,
      status: 'approved',
      is_public: true,
      is_anonymous: false,
      created_at: '2024-02-15T11:20:00Z',
      updated_at: '2024-02-15T11:20:00Z'
    }
  ]
}
