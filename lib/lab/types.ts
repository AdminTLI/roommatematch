export const LAB_WISH_STATUSES = [
  'open',
  'looking',
  'shipped',
  'wont_do',
] as const

export const LAB_VOTE_INTENSITIES = ['use_this', 'nice_to_have'] as const
export type LabVoteIntensity = (typeof LAB_VOTE_INTENSITIES)[number]

export const LAB_PROMPT_KEYS = [
  'onboarding_complete',
  'first_match',
  'empty_matches',
] as const
export type LabPromptKey = (typeof LAB_PROMPT_KEYS)[number]

export type LabWishStatus = (typeof LAB_WISH_STATUSES)[number]

export interface LabWishPublic {
  id: string
  title: string
  body: string
  status: LabWishStatus
  vote_count: number
  use_this_count: number
  focus_group_opt_in: boolean
  created_at: string
  updated_at: string
  user_vote_intensity: LabVoteIntensity | null
}

export interface LabWishAdmin extends LabWishPublic {
  user_id: string
  university_id: string
  merged_into_id: string | null
  author_email: string | null
  author_name: string | null
}

export interface LabCoCreatorBadge {
  user_id: string
  wish_id: string | null
  wish_title: string
  awarded_at: string
}
