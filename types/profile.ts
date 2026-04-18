/**
 * Profile and user cohort types for dual marketplace (Students vs Young Professionals).
 * Used for strict cohort segregation in matching and onboarding.
 */

export const USER_TYPES = ['student', 'professional'] as const
export type UserType = (typeof USER_TYPES)[number]

export function isUserType(value: unknown): value is UserType {
  return typeof value === 'string' && USER_TYPES.includes(value as UserType)
}

/**
 * Profile shape including dual-marketplace fields.
 * Mirrors profiles table; use for typing selects and form state.
 */
export interface Profile {
  id: string
  user_id: string
  university_id: string
  first_name: string
  last_name?: string | null
  phone?: string | null
  bio?: string | null
  degree_level: string
  program?: string | null
  campus?: string | null
  languages?: string[] | null
  minimal_public?: boolean | null
  verification_status?: string | null
  last_answers_changed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  // Dual marketplace (Phase 1)
  user_type: UserType | null
  is_verified_student: boolean
  university_email: string | null
  // Optional columns that may exist in your schema
  interests?: string[] | null
  housing_status?: string[] | null
  preferred_cities?: string[] | null
  date_of_birth?: string | null
  is_visible?: boolean | null
  /** DiceBear seed shown to matches before mutual reveal */
  avatar_id?: string | null
  /** Object path in private `secure_profile_pics` bucket (not a public URL) */
  profile_picture_url?: string | null
  share_details_by_default?: boolean | null
  [key: string]: unknown
}
