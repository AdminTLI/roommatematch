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
  /** v2: IDs of hard gates that conflicted (empty array = none) */
  gate_conflicts?: string[]
  /** v2: true when exactly 1 gate conflicted but overall score is >= 0.70 */
  soft_gate_override?: boolean
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
  let obj: Record<string, unknown> | null = null
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    obj = raw as Record<string, unknown>
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        obj = parsed as Record<string, unknown>
      }
    } catch {
      return null
    }
  }
  if (!obj) return null
  const numeric: Record<string, number> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      numeric[key] = value
    }
  }
  return Object.keys(numeric).length > 0 ? numeric : null
}

export function parseLiveCompatibilityRow(
  row: Record<string, unknown> | null | undefined,
  userBId?: string
): LiveCompatibilitySnapshot | null {
  if (!row) return null
  const peerId = (row.user_b_id as string) || userBId
  if (!peerId && userBId === undefined) return null

  const dimJson = parseDimensionScoresJson(row.dimension_scores_json)
  const rawDim =
    row.dimension_scores_json &&
    typeof row.dimension_scores_json === 'object' &&
    !Array.isArray(row.dimension_scores_json)
      ? (row.dimension_scores_json as Record<string, unknown>)
      : null
  const gateConflicts =
    Array.isArray(row.gate_conflicts)
      ? (row.gate_conflicts as string[])
      : Array.isArray(rawDim?.gate_conflicts)
        ? (rawDim.gate_conflicts as string[])
        : []

  const softGateOverride =
    typeof row.soft_gate_override === 'boolean'
      ? row.soft_gate_override
      : typeof rawDim?.soft_gate_override === 'boolean'
        ? rawDim.soft_gate_override
        : false

  return {
    compatibility_score: extractScore(row.compatibility_score, 0),
    harmony_score: extractScore(row.harmony_score, 0),
    context_score: extractScore(row.context_score, 0),
    dimension_scores_json: dimJson,
    gate_conflicts: gateConflicts,
    soft_gate_override: softGateOverride,
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
