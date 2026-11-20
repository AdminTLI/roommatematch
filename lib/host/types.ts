export type HostType = 'private_landlord' | 'agency'

export type ListingSelectionStyle = 'standard' | 'hospiteer_lite'

export interface HostProfile {
  id: string
  user_id: string
  host_type: HostType
  display_name: string
  company_name?: string | null
  kvk_number?: string | null
  agency_license?: string | null
  phone?: string | null
  bio?: string | null
  /** Storage path in listing-photos for the host profile photo */
  avatar_path?: string | null
  email_verified: boolean
  /** Persona/ID verified — reserved; not required for action gates yet */
  id_verified?: boolean
  /** Onboarding + 24h urgency deadline for email verification nudge */
  verification_deadline_at?: string | null
  /**
   * Org/agency name claim review: none | pending | approved | rejected.
   * Pending means the claimed name is held until an admin approves it.
   */
  identity_review_status?: 'none' | 'pending' | 'approved' | 'rejected'
  identity_review_display_name?: string | null
  identity_review_company_name?: string | null
  identity_review_matched_org?: string | null
  identity_review_message?: string | null
  identity_reviewed_at?: string | null
  identity_review_notes?: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface ListingLifestylePrefs {
  /** Preferred cleanliness standard (1 low to 5 high). Mirrors student M4_Q1 */
  cleanliness?: number
  /** Quiet-hours importance (1 flexible to 5 strict). Mirrors student M2_Q13 */
  quiet_hours_importance?: number
  /** Guest frequency comfort (1 rarely to 5 often). Mirrors student M5_Q1 */
  guests_frequency?: number
  /** Overnight / partner-stay comfort (1 rarely to 5 often). Mirrors student M5_Q5 */
  overnight_guests?: number
  /** Parties / gatherings at home (1 never to 5 often). Mirrors student M5_Q1 gathering energy */
  parties_frequency?: number
  /** Social energy in shared spaces (1 quiet … 5 lively). Mirrors student M1_Q13 */
  social_level?: number
  /** Chore / shared-space upkeep expectation (1 loose … 5 structured). Mirrors student M4_Q14 */
  chores_expectation?: number
  /** Daily rhythm. Mirrors student M2_Q1 chronotype → early/flexible/late */
  preferred_schedule?: 'early' | 'flexible' | 'late'
  /** Home is suitable for focused study */
  study_friendly?: boolean
}

export interface ListingDealbreakers {
  no_smoking?: boolean
  no_pets?: boolean
  no_airbnb?: boolean
  brp_required?: boolean
  min_stay_months?: number
  max_group_size?: number
}

export type ApplicationPipelineStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'accepted'
  | 'offer_pending'
  | 'offer_accepted'
  | 'offer_declined'
  | 'approved'
  | 'rejected'
  | 'withdrawn'

export const REJECTION_REASON_CODES = [
  'capacity_filled',
  'dates_mismatch',
  'lifestyle_fit',
  'incomplete_verification',
  'group_size',
  'other',
] as const

export type RejectionReasonCode = (typeof REJECTION_REASON_CODES)[number]

export const HOST_TYPE_LABELS: Record<HostType, string> = {
  private_landlord: 'Private landlord',
  agency: 'Agency',
}
