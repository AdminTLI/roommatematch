export interface ChatCompatibilityPayload {
  compatibility_score?: number
  harmony_score?: number | null
  context_score?: number | null
  dimension_scores_json?: { [key: string]: number } | null
  /** Gemini + cache; tone matches viewer cohort (see /api/chat/compatibility). */
  personalized_explanation?: string | null
}

export type FetchChatCompatibilityOptions = {
  /** Skip Gemini explanation; scores only (faster) */
  scoresOnly?: boolean
}

export async function fetchChatCompatibility(
  chatId: string,
  options?: FetchChatCompatibilityOptions
): Promise<ChatCompatibilityPayload | null> {
  const params = new URLSearchParams({ chatId })
  if (options?.scoresOnly) {
    params.set('scoresOnly', '1')
  }
  const res = await fetch(`/api/chat/compatibility?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) return null
  return res.json()
}
