/**
 * v2 group compatibility: pairwise matrix + risk dampener + type-aware notes.
 * Replaces legacy centroid scoring for housing and group chat insights.
 */

import { createAdminClient } from '@/lib/supabase/server'
import { GATE_LABELS, HARD_GATE_IDS, MODULE_WEIGHTS } from '@/lib/matching/item-weights.v2'
import { evaluateGateResult } from '@/lib/matching/dealbreakers'
import { safeLogger } from '@/lib/utils/logger'
import type { GroupCompatibilityScore, MemberDeviation } from './types'

type PairRow = {
  user_a: string
  user_b: string
  score: number
  harmony: number
  context: number
  dimensions: Record<string, number>
  gate_conflicts: string[]
  soft_gate_override: boolean
}

function riskDampened(scores: number[]): number {
  if (!scores.length) return 0
  const sorted = [...scores].sort((a, b) => a - b)
  const worst = sorted[0]
  const second = sorted[1] ?? worst
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return 0.7 * avg + 0.3 * ((worst + second) / 2)
}

function extractDims(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'number' && !Number.isNaN(v)) out[k] = v
  }
  return out
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function roundScore(value: number): number {
  // group_compatibility_scores uses DECIMAL(4,3)
  return Math.round(Math.max(0, Math.min(1, value)) * 1000) / 1000
}

function dimensionsFromV2Row(row: Record<string, unknown>): Record<string, number> {
  const fromJson = extractDims(row.dimension_scores_json)
  if (Object.keys(fromJson).length > 0) {
    return {
      'environment-rhythms': fromJson.environment ?? fromJson['environment-rhythms'] ?? 0,
      'cleanliness-operations': fromJson.cleanliness ?? fromJson['cleanliness-operations'] ?? 0,
      'communication-resolution':
        fromJson.communication ?? fromJson['communication-resolution'] ?? 0,
      'social-spaces': fromJson.social ?? fromJson['social-spaces'] ?? 0,
      ...fromJson,
    }
  }

  return {
    'environment-rhythms': num(row.dimension_environment),
    'cleanliness-operations': num(row.dimension_cleanliness),
    'communication-resolution': num(row.dimension_communication),
    'social-spaces': num(row.dimension_social),
  }
}

function pairFromRow(
  userA: string,
  userB: string,
  row: Record<string, unknown> | null | undefined
): PairRow | null {
  if (!row) return null

  const score = num(row.compatibility_score ?? row.overall_score, NaN)
  if (!Number.isFinite(score)) return null

  const dims = dimensionsFromV2Row(row)
  const gateFromDims = Array.isArray((row.dimension_scores_json as { gate_conflicts?: unknown })?.gate_conflicts)
    ? ((row.dimension_scores_json as { gate_conflicts: string[] }).gate_conflicts)
    : []

  return {
    user_a: userA,
    user_b: userB,
    score,
    harmony: num(row.harmony_score),
    context: num(row.context_score),
    dimensions: dims,
    gate_conflicts: Array.isArray(row.gate_conflicts)
      ? (row.gate_conflicts as string[])
      : gateFromDims,
    soft_gate_override: Boolean(
      row.soft_gate_override ??
        (row.dimension_scores_json as { soft_gate_override?: boolean } | null)?.soft_gate_override
    ),
  }
}

async function fetchPairScore(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  userA: string,
  userB: string
): Promise<PairRow | null> {
  // Prefer batch RPC (stable param names + JSON dimension payload used elsewhere)
  const batch = await admin.rpc('compute_compatibility_scores_batch', {
    user_a_id: userA,
    user_b_ids: [userB],
  })

  if (!batch.error && Array.isArray(batch.data) && batch.data[0]) {
    const pair = pairFromRow(userA, userB, batch.data[0] as Record<string, unknown>)
    if (pair) return pair
  }

  // Fallback: single-pair composite RPC (params are p_a / p_b)
  const { data, error } = await admin.rpc('compute_compatibility_score_v2', {
    p_a: userA,
    p_b: userB,
  })

  if (error) {
    safeLogger.warn('Pair score RPC failed', {
      error: error.message,
      batch: batch.error?.message,
      userA,
      userB,
    })
    return null
  }

  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null
  return pairFromRow(userA, userB, row)
}

/**
 * Calculate group internal fit using pairwise v2 scores.
 */
export async function calculateGroupCompatibilityV2(
  chatId: string,
  memberIds: string[],
  _groupIntent: string = 'housing'
): Promise<GroupCompatibilityScore | null> {
  const unique = [...new Set(memberIds.filter(Boolean))]
  if (unique.length < 1) return null

  const admin = await createAdminClient()

  if (unique.length === 1) {
    const single: GroupCompatibilityScore = {
      chat_id: chatId,
      overall_score: 1,
      personality_score: 1,
      schedule_score: 1,
      lifestyle_score: 1,
      social_score: 1,
      academic_score: 1,
      member_deviations: [],
      calculated_at: new Date().toISOString(),
      explanation: {
        top_strength: 'Solo applicant: cohesion is perfect by definition.',
        watch_outs: '',
        why_works: 'Individual application.',
        why_doesnt_work: '',
        suggestions: '',
      },
    }
    if (!chatId.startsWith('ephemeral-')) {
      await upsertGroupScore(admin, chatId, single, [], {}, [])
    }
    return single
  }

  const pairs: PairRow[] = []
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      const pair = await fetchPairScore(admin, unique[i], unique[j])
      if (pair) pairs.push(pair)
    }
  }

  if (!pairs.length) {
    safeLogger.warn('No pairwise scores for group', { chatId, memberIds: unique })
    return null
  }

  const overallScores = pairs.map((p) => p.score)
  const overall = riskDampened(overallScores)

  const dimKeys = [
    'cleanliness-operations',
    'environment-rhythms',
    'communication-resolution',
    'social-spaces',
  ] as const
  const moduleScores: Record<string, number> = {}
  for (const key of dimKeys) {
    const short = key.split('-')[0]
    const vals = pairs.map((p) => {
      const d = p.dimensions
      return (
        d[key] ??
        d[short] ??
        d[`harmony_${short}`] ??
        d[`${short}_score`] ??
        p.harmony
      )
    })
    moduleScores[key] = riskDampened(vals)
  }
  moduleScores['logistics-context'] = riskDampened(pairs.map((p) => p.context))

  const weights = MODULE_WEIGHTS
  const weighted =
    (moduleScores['cleanliness-operations'] ?? 0) * (weights['cleanliness-operations'] ?? 0.28) +
    (moduleScores['environment-rhythms'] ?? 0) * (weights['environment-rhythms'] ?? 0.24) +
    (moduleScores['communication-resolution'] ?? 0) *
      (weights['communication-resolution'] ?? 0.24) +
    (moduleScores['social-spaces'] ?? 0) * (weights['social-spaces'] ?? 0.24)

  const finalOverall = overallScores.length ? 0.5 * overall + 0.5 * weighted : overall

  const allGates = [...new Set(pairs.flatMap((p) => p.gate_conflicts))]
  const soft = pairs.some((p) => p.soft_gate_override)
  const gateEval = evaluateGateResult(allGates, soft && allGates.length === 1, finalOverall)

  // Member deviations: average distance from other members
  const memberScores = new Map<string, number[]>()
  for (const p of pairs) {
    if (!memberScores.has(p.user_a)) memberScores.set(p.user_a, [])
    if (!memberScores.has(p.user_b)) memberScores.set(p.user_b, [])
    memberScores.get(p.user_a)!.push(p.score)
    memberScores.get(p.user_b)!.push(p.score)
  }

  const avgs = [...memberScores.entries()].map(([id, scores]) => ({
    id,
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
  }))
  const meanAvg = avgs.reduce((a, b) => a + b.avg, 0) / Math.max(avgs.length, 1)
  const variance =
    avgs.reduce((a, b) => a + (b.avg - meanAvg) ** 2, 0) / Math.max(avgs.length, 1)
  const std = Math.sqrt(variance)

  const member_deviations: MemberDeviation[] = avgs.map(({ id, avg }) => {
    const deviation = Math.abs(avg - meanAvg)
    const is_outlier = std > 0 && deviation > std
    return {
      user_id: id,
      personality_deviation: deviation,
      schedule_deviation: deviation,
      lifestyle_deviation: deviation,
      social_deviation: deviation,
      academic_deviation: 0,
      is_outlier,
      outlier_categories: is_outlier ? ['overall'] : [],
    }
  })

  const moduleLabel = (key: string) =>
    ({
      'cleanliness-operations': 'Cleanliness',
      'environment-rhythms': 'Environment',
      'communication-resolution': 'Communication',
      'social-spaces': 'Social Life',
    })[key] || key.replace(/-/g, ' ')

  const topModule = [...dimKeys].sort(
    (a, b) => (moduleScores[b] ?? 0) - (moduleScores[a] ?? 0)
  )[0]
  const weakModule = [...dimKeys].sort(
    (a, b) => (moduleScores[a] ?? 0) - (moduleScores[b] ?? 0)
  )[0]
  const gateWatch = gateEval.conflicts
    .map((id) => GATE_LABELS[id as (typeof HARD_GATE_IDS)[number]] ?? id)
    .filter(Boolean)

  const result: GroupCompatibilityScore = {
    chat_id: chatId,
    overall_score: roundScore(finalOverall),
    personality_score: roundScore(moduleScores['communication-resolution'] ?? finalOverall),
    schedule_score: roundScore(moduleScores['environment-rhythms'] ?? finalOverall),
    lifestyle_score: roundScore(moduleScores['cleanliness-operations'] ?? finalOverall),
    social_score: roundScore(moduleScores['social-spaces'] ?? finalOverall),
    academic_score: roundScore(riskDampened(pairs.map((p) => p.context))),
    category_weights: {
      personality: weights['communication-resolution'] ?? 0.24,
      schedule: weights['environment-rhythms'] ?? 0.24,
      lifestyle: weights['cleanliness-operations'] ?? 0.28,
      social: weights['social-spaces'] ?? 0.24,
      academic: 0.1,
    },
    member_deviations,
    calculated_at: new Date().toISOString(),
    explanation: {
      top_strength: `${moduleLabel(topModule)} lines up strongly across the group`,
      watch_outs: gateWatch.length
        ? `People differ on ${gateWatch.join(', ')}. Align house rules early.`
        : `${moduleLabel(weakModule)} is the weakest shared link across pairs.`,
      why_works: `Pairwise fit stays around ${(finalOverall * 100).toFixed(0)}% across ${pairs.length} member pairs.`,
      why_doesnt_work: gateEval.canMatch
        ? ''
        : 'Hard lifestyle gates conflict within the group.',
      suggestions:
        'Discuss quiet hours, guests, cleaning norms, and dealbreakers before applying together.',
    },
  }

  if (!chatId.startsWith('ephemeral-')) {
    await upsertGroupScore(admin, chatId, result, pairs, moduleScores, allGates)
  }

  return result
}

async function upsertGroupScore(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  chatId: string,
  score: GroupCompatibilityScore,
  pairs: PairRow[],
  moduleScores: Record<string, number>,
  hardGates: string[]
) {
  if (chatId.startsWith('ephemeral-')) return

  // explanation is not a column — nest it under member_deviations like the legacy path
  const payload = {
    chat_id: chatId,
    overall_score: roundScore(score.overall_score),
    personality_score: roundScore(score.personality_score),
    schedule_score: roundScore(score.schedule_score),
    lifestyle_score: roundScore(score.lifestyle_score),
    social_score: roundScore(score.social_score),
    academic_score: roundScore(score.academic_score),
    category_weights: score.category_weights ?? {},
    member_deviations: {
      deviations: score.member_deviations,
      explanation: score.explanation ?? {},
    },
    pair_scores: pairs.map((p) => ({
      user_a: p.user_a,
      user_b: p.user_b,
      score: roundScore(p.score),
      harmony: roundScore(p.harmony),
      context: roundScore(p.context),
      gate_conflicts: p.gate_conflicts,
    })),
    module_scores: Object.fromEntries(
      Object.entries(moduleScores).map(([k, v]) => [k, roundScore(v)])
    ),
    hard_gate_conflicts: hardGates,
    calculated_at: score.calculated_at,
  }

  const { error } = await admin.from('group_compatibility_scores').upsert(payload, {
    onConflict: 'chat_id',
  })
  if (error) {
    // Still return the in-memory score to callers; panel can display without a persisted row.
    safeLogger.warn('Failed to upsert group compatibility v2', { error: error.message, chatId })
  }
}

/** Convenience: cohesion 0-1 for housing scorer */
export async function getGroupCohesionScore(
  chatId: string | null | undefined,
  memberIds: string[]
): Promise<number> {
  if (!memberIds.length) return 1
  if (memberIds.length === 1) return 1
  // Only persist when we have a real chat; otherwise compute ephemeral pair scores
  const id = chatId || `ephemeral-${memberIds.slice().sort().join('-').slice(0, 40)}`
  try {
    const score = await calculateGroupCompatibilityV2(id, memberIds, 'housing')
    return score?.overall_score ?? 0.7
  } catch {
    return 0.7
  }
}
