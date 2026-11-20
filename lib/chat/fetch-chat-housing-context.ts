/** Stable React Query key — keep in this leaf module (avoids Turbopack HMR gaps on queryKeys). */
export function chatHousingContextKey(chatId?: string | null) {
  return chatId
    ? (['chat', 'housing-context', chatId] as const)
    : (['chat', 'housing-context'] as const)
}

export type ChatHousingContextPayload = {
  viewer_role?: 'host' | 'applicant'
  application: {
    id: string
    status: string
    fit_score: number | null
    cohesion_score?: number | null
    watch_outs: string[]
    gate_conflicts?: string[]
    score_breakdown: {
      lifestyle?: number
      budget?: number
      timeline?: number
      capacity?: number
      amenities?: number
      cohesion?: number
    } | null
  }
  listing: {
    id: string
    title: string
    city: string | null
    address: string | null
    rent_monthly: number | null
    utilities_included: boolean
    room_type: string | null
    available_from: string | null
    min_stay_months: number | null
    furnished: boolean
    pet_friendly: boolean
    smoking_allowed: boolean
    amenities: string[]
    photo_url: string | null
    description: string | null
  }
  host: {
    display_name: string
    host_type: string | null
    host_type_label: string | null
    company_name: string | null
    bio: string | null
    verified: boolean
    avatar_url: string | null
  }
  applicant?: {
    display_name: string
    avatar_url: string | null
    anonymous_label: string
    group_size: number
    verification_badges: string[]
    identity_revealed: boolean
    hard_gates_passed: boolean
    motivation_letter: string | null
    application_type: string | null
    verified: boolean
    bio: string | null
    interests: string[]
    university: string | null
    program: string | null
    degree_level: string | null
    study_year: number | null
  } | null
  insights: {
    overall: string | null
    lifestyle: string | null
    budget: string | null
    timeline: string | null
    capacity?: string | null
    amenities?: string | null
    cohesion?: string | null
  } | null
}

export async function fetchChatHousingContext(
  chatId: string,
): Promise<ChatHousingContextPayload | null> {
  const res = await fetch(
    `/api/chat/housing-context?chatId=${encodeURIComponent(chatId)}`,
    { credentials: 'include', cache: 'no-store' },
  )
  if (!res.ok) return null
  return res.json()
}
