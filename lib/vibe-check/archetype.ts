import {
  VIBE_CHECK_QUESTIONS,
  VIBE_MODULE_WEIGHTS,
  type VibeModule,
} from './questions'

export interface ArchetypeResult {
  title: string
  subtitle: string
  tagline: string
  description: string
  traits: string[]
  idealMatch: string
  dealbreakerWarning: string
  scores: {
    environment: number
    cleanliness: number
    communication: number
    social: number
  }
  overallHarmony: number
}

type ArchetypeKey = 'zen' | 'social' | 'director' | 'autonomous'

type ModuleVector = {
  environment: number
  cleanliness: number
  communication: number
  social: number
}

/**
 * Ideal module-score centroids (0–100) for each archetype.
 * Selection = nearest centroid under module-weighted distance so answer
 * patterns map to different types instead of a single early if-branch.
 */
const ARCHETYPE_CENTROIDS: Record<ArchetypeKey, ModuleVector> = {
  zen: { environment: 28, cleanliness: 88, communication: 55, social: 22 },
  social: { environment: 72, cleanliness: 48, communication: 58, social: 88 },
  director: { environment: 48, cleanliness: 62, communication: 88, social: 48 },
  autonomous: { environment: 55, cleanliness: 52, communication: 38, social: 42 },
}

const ARCHETYPE_CONTENT: Record<
  ArchetypeKey,
  Omit<ArchetypeResult, 'scores' | 'overallHarmony'>
> = {
  zen: {
    title: 'The Zen Sanctuary',
    subtitle: 'Order, Quiet & High Intention',
    tagline: 'Your home is your recharging battery, not a pub.',
    description:
      'You value micro-hygiene, clear quiet hours, and peaceful common areas. You prefer socializing outside and returning home to a calm, predictable environment.',
    traits: ['Immediate Dish Cleaner', 'Respects Quiet Hours', 'Low Household Chaos'],
    idealMatch: 'The Harmonious Co-Director',
    dealbreakerWarning: 'Night Owls who leave dishes in the sink for >24h.',
  },
  social: {
    title: 'The Social Catalyst',
    subtitle: 'Communal Energy & Open Doors',
    tagline: 'A house is only a home when shared with good people.',
    description:
      'You thrive in an active, communal house where kitchen pre-games, shared dinners, and spontaneous movie nights happen naturally.',
    traits: ['Open Door Policy', 'Enjoys Group Cooking', 'High Social Tolerance'],
    idealMatch: 'The Social Catalyst / Harmonious Co-Director',
    dealbreakerWarning: 'Roommates who enforce strict quiet hours before 22:00.',
  },
  director: {
    title: 'The Harmonious Co-Director',
    subtitle: 'Direct Dialogue & Clear Boundaries',
    tagline: 'No passive-aggressive notes in the house chat.',
    description:
      'You believe most roommate drama is prevented through clear expectations, direct face-to-face communication, and shared accountability.',
    traits: ['Direct Conflict Solver', 'Reliable Chore Partner', 'Fair Expense Splitter'],
    idealMatch: 'The Zen Sanctuary / The Social Catalyst',
    dealbreakerWarning: 'Passive-aggressive WhatsApp messages.',
  },
  autonomous: {
    title: 'The Independent Autonomous',
    subtitle: 'Low Friction, High Freedom',
    tagline: 'Respect my space, I will respect yours, and everything runs smoothly.',
    description:
      'You are self-sufficient, easy-going, and respect personal boundaries. You keep common areas tidy and live an active life both in and out of the house.',
    traits: ['Self-Sufficient', 'Boundary Respecter', 'Low Maintenance'],
    idealMatch: 'The Zen Sanctuary',
    dealbreakerWarning: 'Unannounced long-term guests.',
  },
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}

/**
 * Weighted module scores (0–100) using research in-module shares,
 * then overall harmony via MODULE_WEIGHTS (cleanliness 28%).
 */
export function calculateModuleScores(
  answers: Record<string, number>
): ArchetypeResult['scores'] & { overallHarmony: number } {
  const moduleAcc: Record<VibeModule, { weighted: number; weightSum: number }> = {
    environment: { weighted: 0, weightSum: 0 },
    cleanliness: { weighted: 0, weightSum: 0 },
    communication: { weighted: 0, weightSum: 0 },
    social: { weighted: 0, weightSum: 0 },
  }

  for (const q of VIBE_CHECK_QUESTIONS) {
    const raw = answers[q.id]
    if (typeof raw !== 'number' || raw < 1 || raw > 5) continue
    moduleAcc[q.module].weighted += raw * q.inModuleWeight
    moduleAcc[q.module].weightSum += q.inModuleWeight
  }

  const scores = {
    environment: 0,
    cleanliness: 0,
    communication: 0,
    social: 0,
  } as ArchetypeResult['scores']

  for (const mod of Object.keys(moduleAcc) as VibeModule[]) {
    const { weighted, weightSum } = moduleAcc[mod]
    scores[mod] = weightSum > 0 ? clampScore((weighted / weightSum / 5) * 100) : 0
  }

  const overallHarmony = clampScore(
    scores.environment * VIBE_MODULE_WEIGHTS.environment +
      scores.cleanliness * VIBE_MODULE_WEIGHTS.cleanliness +
      scores.communication * VIBE_MODULE_WEIGHTS.communication +
      scores.social * VIBE_MODULE_WEIGHTS.social
  )

  return { ...scores, overallHarmony }
}

function weightedSquaredDistance(scores: ModuleVector, centroid: ModuleVector): number {
  return (
    VIBE_MODULE_WEIGHTS.environment * (scores.environment - centroid.environment) ** 2 +
    VIBE_MODULE_WEIGHTS.cleanliness * (scores.cleanliness - centroid.cleanliness) ** 2 +
    VIBE_MODULE_WEIGHTS.communication *
      (scores.communication - centroid.communication) ** 2 +
    VIBE_MODULE_WEIGHTS.social * (scores.social - centroid.social) ** 2
  )
}

/**
 * Dominant-dimension tie-breakers when two centroids are nearly equidistant.
 * Ensures strong social / communication / cleanliness signals win clearly.
 */
function dominantKey(scores: ModuleVector): ArchetypeKey | null {
  const { cleanliness: clean, communication: comm, social: soc } = scores
  const ranked: Array<{ key: ArchetypeKey; score: number; gate: boolean }> = [
    { key: 'social', score: soc, gate: soc >= 68 },
    { key: 'director', score: comm, gate: comm >= 68 },
    { key: 'zen', score: clean, gate: clean >= 72 && soc <= 45 },
    { key: 'autonomous', score: 100 - Math.abs(50 - (clean + soc + comm) / 3), gate: false },
  ]
  const eligible = ranked.filter((r) => r.gate)
  if (eligible.length === 0) return null
  eligible.sort((a, b) => b.score - a.score)
  return eligible[0]?.key ?? null
}

export function selectArchetypeKey(scores: ModuleVector): ArchetypeKey {
  let bestKey: ArchetypeKey = 'autonomous'
  let bestDist = Number.POSITIVE_INFINITY

  for (const key of Object.keys(ARCHETYPE_CENTROIDS) as ArchetypeKey[]) {
    const dist = weightedSquaredDistance(scores, ARCHETYPE_CENTROIDS[key])
    if (dist < bestDist) {
      bestDist = dist
      bestKey = key
    }
  }

  // If a dimension is clearly extreme, prefer that archetype when close to another centroid.
  const dominant = dominantKey(scores)
  if (dominant && dominant !== bestKey) {
    const dominantDist = weightedSquaredDistance(scores, ARCHETYPE_CENTROIDS[dominant])
    // Allow override when within ~15% of the nearest centroid distance (or closer).
    if (dominantDist <= bestDist * 1.15) {
      return dominant
    }
  }

  return bestKey
}

export function calculateArchetype(answers: Record<string, number>): ArchetypeResult {
  const { overallHarmony, ...scores } = calculateModuleScores(answers)
  const key = selectArchetypeKey(scores)
  const content = ARCHETYPE_CONTENT[key]

  return {
    ...content,
    scores,
    overallHarmony,
  }
}
