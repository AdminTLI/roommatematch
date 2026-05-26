/**
 * Live compatibility snapshots (harmony, context, dimensions) via batch RPC.
 * Scores-only — no Gemini; used by match cards and dashboard.
 */

import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

export type LiveCompatibilitySnapshot = {
  compatibility_score: number
  harmony_score: number
  context_score: number
  dimension_scores_json: Record<string, number> | null
}

function extractScore(value: unknown, defaultValue = 0): number {
  if (value == null || value === '') return defaultValue
  const num = Number(value)
  return Number.isNaN(num) ? defaultValue : num
}

export function parseDimensionScoresJson(
  raw: unknown
): Record<string, number> | null {
  if (!raw) return null
  if (typeof raw === 'object' && raw !== null) {
    const keys = Object.keys(raw as object)
    return keys.length > 0 ? (raw as Record<string, number>) : null
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as Record<string, number>
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed
      }
    } catch {
      return null
    }
  }
  return null
}

export function parseLiveCompatibilityRow(
  row: Record<string, unknown> | null | undefined,
  userBId?: string
): LiveCompatibilitySnapshot | null {
  if (!row) return null
  const peerId = (row.user_b_id as string) || userBId
  if (!peerId && userBId === undefined) return null

  return {
    compatibility_score: extractScore(row.compatibility_score, 0),
    harmony_score: extractScore(row.harmony_score, 0),
    context_score: extractScore(row.context_score, 0),
    dimension_scores_json: parseDimensionScoresJson(row.dimension_scores_json),
  }
}

export async function fetchLiveCompatibilityBatch(
  otherUserIds: string[]
): Promise<Map<string, LiveCompatibilitySnapshot>> {
  const unique = [...new Set(otherUserIds.filter(Boolean))]
  const map = new Map<string, LiveCompatibilitySnapshot>()
  if (unique.length === 0) return map

  const res = await fetchWithCSRF('/api/match/compatibility/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ other_user_ids: unique }),
  })

  const json = res.ok ? await res.json() : null
  if (!res.ok) {
    throw new Error(json?.error || 'Batch compatibility request failed')
  }

  for (const row of json?.results || []) {
    const peerId = row?.user_b_id as string | undefined
    const parsed = parseLiveCompatibilityRow(row as Record<string, unknown>, peerId)
    if (peerId && parsed) {
      map.set(peerId, parsed)
    }
  }

  return map
}
