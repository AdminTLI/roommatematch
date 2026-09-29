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

export function calculateArchetype(answers: Record<string, number>): ArchetypeResult {
  const { overallHarmony, ...scores } = calculateModuleScores(answers)
  const { environment: env, cleanliness: clean, communication: comm, social: soc } = scores

  if (clean >= 70 && soc <= 50) {
    return {
      title: 'The Zen Sanctuary',
      subtitle: 'Order, Quiet & High Intention',
      tagline: 'Your home is your recharging battery, not a pub.',
      description:
        'You value micro-hygiene, clear quiet hours, and peaceful common areas. You prefer socializing outside and returning home to a calm, predictable environment.',
      traits: ['Immediate Dish Cleaner', 'Respects Quiet Hours', 'Low Household Chaos'],
      idealMatch: 'The Harmonious Co-Director',
      dealbreakerWarning: 'Night Owls who leave dishes in the sink for >24h.',
      scores,
      overallHarmony,
    }
  }

  if (soc >= 70) {
    return {
      title: 'The Social Catalyst',
      subtitle: 'Communal Energy & Open Doors',
      tagline: 'A house is only a home when shared with good people.',
      description:
        'You thrive in an active, communal house where kitchen pre-games, shared dinners, and spontaneous movie nights happen naturally.',
      traits: ['Open Door Policy', 'Enjoys Group Cooking', 'High Social Tolerance'],
      idealMatch: 'The Social Catalyst / Harmonious Co-Director',
      dealbreakerWarning: 'Roommates who enforce strict quiet hours before 22:00.',
      scores,
      overallHarmony,
    }
  }

  if (comm >= 70) {
    return {
      title: 'The Harmonious Co-Director',
      subtitle: 'Direct Dialogue & Clear Boundaries',
      tagline: 'No passive-aggressive notes in the house chat.',
      description:
        'You believe most roommate drama is prevented through clear expectations, direct face-to-face communication, and shared accountability.',
      traits: ['Direct Conflict Solver', 'Reliable Chore Partner', 'Fair Expense Splitter'],
      idealMatch: 'The Zen Sanctuary / The Social Catalyst',
      dealbreakerWarning: 'Passive-aggressive WhatsApp messages.',
      scores,
      overallHarmony,
    }
  }

  return {
    title: 'The Independent Autonomous',
    subtitle: 'Low Friction, High Freedom',
    tagline: 'Respect my space, I will respect yours, and everything runs smoothly.',
    description:
      'You are self-sufficient, easy-going, and respect personal boundaries. You keep common areas tidy and live an active life both in and out of the house.',
    traits: ['Self-Sufficient', 'Boundary Respecter', 'Low Maintenance'],
    idealMatch: 'The Zen Sanctuary',
    dealbreakerWarning: 'Unannounced long-term guests.',
    scores,
    overallHarmony,
  }
}
