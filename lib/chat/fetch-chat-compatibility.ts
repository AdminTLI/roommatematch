export interface ChatCompatibilityPayload {
  compatibility_score?: number
  harmony_score?: number | null
  context_score?: number | null
  dimension_scores_json?: { [key: string]: number } | null
  /** Gemini + cache; tone matches viewer cohort (see /api/chat/compatibility). */
  personalized_explanation?: string | null
}

export async function fetchChatCompatibility(chatId: string): Promise<ChatCompatibilityPayload | null> {
  const res = await fetch(`/api/chat/compatibility?chatId=${encodeURIComponent(chatId)}&_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
    credentials: 'include',
  })
  if (!res.ok) return null
  return res.json()
}
