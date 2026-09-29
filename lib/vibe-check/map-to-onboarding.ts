import type { Answer } from '@/store/onboarding'
import type { SectionKey } from '@/types/questionnaire'

export type MappedVibeAnswer = {
  section: SectionKey
  answer: Answer
}

function asLikert(n: number): 1 | 2 | 3 | 4 | 5 {
  const clamped = Math.max(1, Math.min(5, Math.round(n)))
  return clamped as 1 | 2 | 3 | 4 | 5
}

/**
 * Map marketing vibe-check 1–5 answers into v2 onboarding Answer payloads
 * for optional later hydration.
 */
export function mapVibeAnswersToOnboarding(
  answers: Record<string, number>
): MappedVibeAnswer[] {
  const out: MappedVibeAnswer[] = []

  const m2q1 = answers['M2_Q1']
  if (typeof m2q1 === 'number') {
    // Vibe: 1 early bird … 5 night owl. V2 bipolar: 1 night owl … 5 morning.
    out.push({
      section: 'environment-rhythms',
      answer: {
        itemId: 'M2_Q1',
        value: { kind: 'bipolar', value: asLikert(6 - m2q1) },
      },
    })
  }

  const m2q13 = answers['M2_Q13']
  if (typeof m2q13 === 'number') {
    const windows: Record<number, { start: string; end: string }> = {
      1: { start: '21:00', end: '07:00' },
      2: { start: '22:00', end: '07:00' },
      3: { start: '23:00', end: '07:00' },
      4: { start: '23:00', end: '08:00' },
      5: { start: '00:00', end: '06:00' },
    }
    const range = windows[asLikert(m2q13)] ?? windows[3]
    out.push({
      section: 'environment-rhythms',
      answer: {
        itemId: 'M2_Q13',
        value: { kind: 'timeRange', start: range.start, end: range.end },
      },
    })
  }

  const m4q1 = answers['M4_Q1']
  if (typeof m4q1 === 'number') {
    const v =
      m4q1 >= 5 ? 'clean_high' : m4q1 >= 3 ? 'clean_medium' : 'clean_low'
    out.push({
      section: 'cleanliness-operations',
      answer: {
        itemId: 'M4_Q1',
        value: { kind: 'mcq', value: v },
      },
    })
  }

  const m4q4 = answers['M4_Q4']
  if (typeof m4q4 === 'number') {
    const v =
      m4q4 >= 5
        ? 'dishes_immediately'
        : m4q4 >= 3
          ? 'dishes_same_day'
          : 'dishes_next_day'
    out.push({
      section: 'cleanliness-operations',
      answer: {
        itemId: 'M4_Q4',
        value: { kind: 'mcq', value: v },
      },
    })
  }

  const m6q9 = answers['M6_Q9']
  if (typeof m6q9 === 'number') {
    out.push({
      section: 'communication-resolution',
      answer: {
        itemId: 'M6_Q9',
        value: { kind: 'bipolar', value: asLikert(m6q9) },
      },
    })
  }

  const m6q1 = answers['M6_Q1']
  if (typeof m6q1 === 'number') {
    // Face-to-face / private → left (1); WhatsApp / let slide → right (5).
    const mapped = asLikert(6 - m6q1)
    out.push({
      section: 'communication-resolution',
      answer: {
        itemId: 'M6_Q1',
        value: { kind: 'bipolar', value: mapped },
      },
    })
  }

  const m5q1 = answers['M5_Q1']
  if (typeof m5q1 === 'number') {
    const hostMap: Record<number, string> = {
      1: 'host_never',
      2: 'host_monthly',
      3: 'host_weekly',
      4: 'host_few_weekly',
      5: 'host_few_weekly',
    }
    out.push({
      section: 'social-spaces',
      answer: {
        itemId: 'M5_Q1',
        value: { kind: 'mcq', value: hostMap[asLikert(m5q1)] ?? 'host_weekly' },
      },
    })
  }

  const m5q5 = answers['M5_Q5']
  if (typeof m5q5 === 'number') {
    out.push({
      section: 'social-spaces',
      answer: {
        itemId: 'M5_Q5',
        value: { kind: 'likert', value: asLikert(m5q5) },
      },
    })
  }

  return out
}
