export interface GroupCompatibilityScore {
  chat_id: string
  overall_score: number
  personality_score: number
  schedule_score: number
  lifestyle_score: number
  social_score: number
  academic_score: number
  category_weights?: Record<string, number>
  member_deviations: MemberDeviation[]
  calculated_at: string
  explanation?: {
    top_strength: string
    watch_outs: string
    why_works: string
    why_doesnt_work: string
    suggestions: string
  }
}

export interface MemberDeviation {
  user_id: string
  personality_deviation: number
  schedule_deviation: number
  lifestyle_deviation: number
  social_deviation: number
  academic_deviation: number
  is_outlier: boolean
  outlier_categories: string[]
}

export interface GroupCentroid {
  personality: number[]
  schedule: number[]
  lifestyle: number[]
  social: number[]
  academic: number[]
}

export interface CategoryWeights {
  personality: number
  schedule: number
  lifestyle: number
  social: number
  academic: number
}

export interface GroupIntentWeights {
  housing: CategoryWeights
  study: CategoryWeights
  social: CategoryWeights
  general: CategoryWeights
}

export const DEFAULT_INTENT_WEIGHTS: GroupIntentWeights = {
  housing: {
    personality: 0.30,
    schedule: 0.25,
    lifestyle: 0.20,
    social: 0.15,
    academic: 0.10
  },
  study: {
    personality: 0.20,
    schedule: 0.30,
    lifestyle: 0.15,
    social: 0.10,
    academic: 0.25
  },
  social: {
    personality: 0.35,
    schedule: 0.10,
    lifestyle: 0.15,
    social: 0.30,
    academic: 0.10
  },
  general: {
    personality: 0.25,
    schedule: 0.20,
    lifestyle: 0.20,
    social: 0.20,
    academic: 0.15
  }
}

