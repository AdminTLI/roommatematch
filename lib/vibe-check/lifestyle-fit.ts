import { calculateModuleScores } from './archetype'
import { VIBE_MODULE_WEIGHTS, type VibeModule } from './questions'
import { VIBE_CHECK_QUESTIONS } from './questions'

export const LIFESTYLE_FIT_THRESHOLD = 0.6
export const LIFESTYLE_FIT_COUNT_OFFSET = 10

export type ModuleScores = {
  environment: number
  cleanliness: number
  communication: number
  social: number
  overallHarmony: number
}

const MODULE_KEYS: VibeModule[] = [
  'environment',
  'cleanliness',
  'communication',
  'social',
]

const VIBE_ITEM_IDS = VIBE_CHECK_QUESTIONS.map((q) => q.id)

function unwrap(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'value' in (raw as Record<string, unknown>)) {
    return (raw as { value: unknown }).value
  }
  return raw
}

function as1to5(n: number): number | null {
  if (!Number.isFinite(n)) return null
  const rounded = Math.round(n)
  if (rounded < 1 || rounded > 5) return null
  return rounded
}

function parseTimeToHours(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return h + min / 60
}

/**
 * Map a stored v2 onboarding answer for a vibe-check item ID onto the
 * marketing 1–5 scale used by calculateModuleScores.
 */
export function onboardingAnswerToVibeScale(itemId: string, raw: unknown): number | null {
  const v = unwrap(raw)

  switch (itemId) {
    case 'M2_Q1': {
      // v2 bipolar: 1 night owl … 5 morning. Vibe: 1 early … 5 night owl.
      if (v && typeof v === 'object' && typeof (v as { value?: unknown }).value === 'number') {
        return as1to5(6 - (v as { value: number }).value)
      }
      if (typeof v === 'number') return as1to5(6 - v)
      return null
    }
    case 'M2_Q13': {
      const range =
        v && typeof v === 'object'
          ? (v as { start?: string; end?: string; kind?: string })
          : null
      const start =
        range && typeof range.start === 'string'
          ? parseTimeToHours(range.start)
          : null
      if (start == null) return null
      // Align with vibe quiet-hour options: 21 / 22 / 23 / flexible / none
      if (start <= 21.25) return 1
      if (start <= 22.25) return 2
      if (start <= 23.25) return 3
      if (start < 24) return 4
      return 5
    }
    case 'M4_Q1': {
      const s =
        typeof v === 'string'
          ? v
          : v && typeof v === 'object' && typeof (v as { value?: unknown }).value === 'string'
            ? (v as { value: string }).value
            : null
      if (s === 'clean_high') return 5
      if (s === 'clean_medium') return 3
      if (s === 'clean_low') return 1
      return null
    }
    case 'M4_Q4': {
      const s =
        typeof v === 'string'
          ? v
          : v && typeof v === 'object' && typeof (v as { value?: unknown }).value === 'string'
            ? (v as { value: string }).value
            : null
      if (s === 'dishes_immediately') return 5
      if (s === 'dishes_same_day') return 4
      if (s === 'dishes_next_day') return 1
      return null
    }
    case 'M6_Q9': {
      if (v && typeof v === 'object' && typeof (v as { value?: unknown }).value === 'number') {
        return as1to5((v as { value: number }).value)
      }
      if (typeof v === 'number') return as1to5(v)
      return null
    }
    case 'M6_Q1': {
      // Stored bipolar was inverted from vibe (private left). Recover vibe scale.
      if (v && typeof v === 'object' && typeof (v as { value?: unknown }).value === 'number') {
        return as1to5(6 - (v as { value: number }).value)
      }
      if (typeof v === 'number') return as1to5(6 - v)
      return null
    }
    case 'M5_Q1': {
      const s =
        typeof v === 'string'
          ? v
          : v && typeof v === 'object' && typeof (v as { value?: unknown }).value === 'string'
            ? (v as { value: string }).value
            : null
      if (s === 'host_never') return 1
      if (s === 'host_monthly') return 2
      if (s === 'host_weekly') return 3
      if (s === 'host_few_weekly') return 4
      return null
    }
    case 'M5_Q5': {
      if (v && typeof v === 'object' && typeof (v as { value?: unknown }).value === 'number') {
        return as1to5((v as { value: number }).value)
      }
      if (typeof v === 'number') return as1to5(v)
      return null
    }
    default:
      return null
  }
}

type SectionRow = {
  user_id: string
  section: string
  answers: unknown
}

/**
 * Build vibe 1–5 answer maps per user from onboarding_sections rows.
 * Accepts rows that may contain full section answers (arrays or maps).
 */
export function buildVibeAnswerMapsFromSections(
  rows: SectionRow[]
): Map<string, Record<string, number>> {
  const byUser = new Map<string, Record<string, number>>()

  for (const row of rows) {
    if (!row.user_id) continue
    const answers = row.answers
    let entries: Array<{ itemId?: string; value?: unknown }> = []

    if (Array.isArray(answers)) {
      entries = answers as Array<{ itemId?: string; value?: unknown }>
    } else if (answers && typeof answers === 'object') {
      entries = Object.entries(answers as Record<string, unknown>).map(([itemId, payload]) => {
        if (payload && typeof payload === 'object' && 'value' in (payload as object)) {
          return { itemId, value: (payload as { value: unknown }).value }
        }
        return { itemId, value: payload }
      })
    }

    for (const entry of entries) {
      const itemId = entry.itemId
      if (!itemId || !VIBE_ITEM_IDS.includes(itemId)) continue
      const vibe = onboardingAnswerToVibeScale(itemId, entry.value ?? entry)
      if (vibe == null) continue
      const map = byUser.get(row.user_id) ?? {}
      map[itemId] = vibe
      byUser.set(row.user_id, map)
    }
  }

  return byUser
}

export function moduleSimilarity(a: number, b: number): number {
  return 1 - Math.min(100, Math.abs(a - b)) / 100
}

/**
 * Overall lifestyle fit between two module-score profiles (0–1).
 * Uses the same module weights as harmony (cleanliness 28%, others 24%).
 */
export function computeOverallLifestyleFit(a: ModuleScores, b: ModuleScores): number {
  let weighted = 0
  for (const mod of MODULE_KEYS) {
    weighted += moduleSimilarity(a[mod], b[mod]) * VIBE_MODULE_WEIGHTS[mod]
  }
  return Math.max(0, Math.min(1, weighted))
}

export type LifestyleFitResult = {
  /** Display percentage (e.g. 72 for "72%+"), average fit among matches, floored, min 60 when any match. */
  lifestyleFitPercent: number
  /** Users with fit >= 60%, plus offset. */
  matchCount: number
  /** Real users compared (had enough vibe answers). */
  comparedUsers: number
  /** Real users clearing the 60% threshold (before +10). */
  realMatches: number
  /** Mean module scores (0–100) across compared peers - for UI average markers. */
  cohortAverages: {
    environment: number
    cleanliness: number
    communication: number
    social: number
  } | null
}

export function summarizeLifestyleFit(
  visitorScores: ModuleScores,
  peerAnswerMaps: Map<string, Record<string, number>>,
  options?: { offset?: number; threshold?: number; minItems?: number }
): LifestyleFitResult {
  const offset = options?.offset ?? LIFESTYLE_FIT_COUNT_OFFSET
  const threshold = options?.threshold ?? LIFESTYLE_FIT_THRESHOLD
  const minItems = options?.minItems ?? 4

  const matchFits: number[] = []
  let comparedUsers = 0
  const sums = {
    environment: 0,
    cleanliness: 0,
    communication: 0,
    social: 0,
  }

  for (const [, answers] of peerAnswerMaps) {
    const answered = Object.keys(answers).length
    if (answered < minItems) continue
    const peerScores = calculateModuleScores(answers)
    const fit = computeOverallLifestyleFit(visitorScores, peerScores)
    comparedUsers += 1
    for (const mod of MODULE_KEYS) {
      sums[mod] += peerScores[mod]
    }
    if (fit >= threshold) matchFits.push(fit)
  }

  const realMatches = matchFits.length
  const matchCount = realMatches + offset

  let lifestyleFitPercent = Math.round(threshold * 100)
  if (matchFits.length > 0) {
    const avg = matchFits.reduce((s, f) => s + f, 0) / matchFits.length
    lifestyleFitPercent = Math.max(Math.round(threshold * 100), Math.floor(avg * 100))
  }

  const cohortAverages =
    comparedUsers > 0
      ? {
          environment: sums.environment / comparedUsers,
          cleanliness: sums.cleanliness / comparedUsers,
          communication: sums.communication / comparedUsers,
          social: sums.social / comparedUsers,
        }
      : null

  return {
    lifestyleFitPercent,
    matchCount,
    comparedUsers,
    realMatches,
    cohortAverages,
  }
}
