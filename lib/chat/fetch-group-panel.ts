export type GroupPanelMember = {
  member_key: string
  user_id: string | null
  membership_status: 'active' | 'invited'
  display_name: string
  /** True when this row is the signed-in viewer */
  is_you?: boolean
  identity_revealed: boolean
  avatar_url: string | null
  shares_picture: boolean
  program: string | null
  university: string | null
  bio: string | null
  interests: string[]
  housing_status: string[] | null
  degree_level: string | null
  study_year: number | null
  budget_min: number | null
  budget_max: number | null
  budget_unknown: boolean
  preferred_cities: string[]
  pairwise_score: number | null
}

export type GroupPanelCompatibility = {
  overall_score: number
  personality_score: number
  schedule_score: number
  lifestyle_score: number
  social_score: number
  academic_score: number
  harmony_score: number | null
  context_score: number | null
  module_scores: Record<string, number> | null
  hard_gate_conflicts: string[]
  hard_gate_labels: string[]
  explanation: {
    top_strength?: string
    watch_outs?: string
    why_works?: string
    why_doesnt_work?: string
    suggestions?: string
  } | null
}

export type GroupPanelViewerSettings = {
  muted: boolean
  share_picture: boolean
}

export type GroupPanelPayload = {
  chat: {
    name: string | null
    is_locked: boolean
    group_intent: string | null
    description: string | null
  }
  compatibility: GroupPanelCompatibility | null
  members: GroupPanelMember[]
  joined_count: number
  pending_invite_count: number
  viewer_settings: GroupPanelViewerSettings
}

export async function fetchGroupPanel(chatId: string): Promise<GroupPanelPayload | null> {
  const response = await fetch(
    `/api/chat/groups?chatId=${encodeURIComponent(chatId)}&action=panel`,
    { credentials: 'include', cache: 'no-store' },
  )
  if (!response.ok) return null
  const data = await response.json().catch(() => null)
  if (!data || typeof data !== 'object') return null
  return data as GroupPanelPayload
}

export async function updateGroupChatSettings(
  chatId: string,
  patch: { muted?: boolean; share_picture?: boolean },
): Promise<{ ok: true; viewer_settings: GroupPanelViewerSettings } | { ok: false; error: string }> {
  const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
  const response = await fetchWithCSRF('/api/chat/groups/settings', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, ...patch }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    return { ok: false, error: data?.error || 'Failed to update settings' }
  }
  return {
    ok: true,
    viewer_settings: {
      muted: Boolean(data?.viewer_settings?.muted),
      share_picture: Boolean(data?.viewer_settings?.share_picture),
    },
  }
}
