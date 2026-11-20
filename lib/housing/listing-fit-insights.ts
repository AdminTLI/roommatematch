/**
 * Curated compatibility insights for applicant × listing fit.
 * Copy is written in second person so the student feels the score is about them.
 */

import type { ListingLifestylePrefs } from '@/lib/host/types'
import type { ListingScoreInput, MemberHousingSignals } from '@/lib/housing/group-listing-score'

export type ListingFitDimension = 'lifestyle' | 'budget' | 'timeline'

export type ListingFitInsights = Record<ListingFitDimension, string> & {
  overall: string
}

type Polarity = 'strength' | 'watch' | 'neutral'

type InsightVariant = {
  id: string
  polarity: Polarity
  weight?: number
  lines: string[]
}

const LIFESTYLE_BY_TOPIC: Record<string, InsightVariant[]> = {
  cleanliness: [
    {
      id: 'clean_aligned',
      polarity: 'strength',
      lines: [
        'Your tidy-home habits line up with what this host wants, so shared spaces should feel natural to you.',
        'You and this host expect a similar level of day-to-day tidiness in the apartment.',
      ],
    },
    {
      id: 'clean_gap',
      polarity: 'watch',
      lines: [
        'Your cleanliness bar differs a bit from this host. Agree early on how you will keep shared areas.',
        'You may not match the host tidy-home standard exactly. A simple cleaning rota usually closes your gap.',
      ],
    },
  ],
  quiet_hours: [
    {
      id: 'quiet_aligned',
      polarity: 'strength',
      lines: [
        'Your quiet-hours preferences match this host, which helps your evenings and study time feel calm.',
        'You and this host treat noise the same way at home, a strong lifestyle fit for you here.',
      ],
    },
    {
      id: 'quiet_gap',
      polarity: 'watch',
      lines: [
        'Your quiet-hours priorities differ from this host. Clarify evening noise before you apply.',
        'Your noise tolerance may not match this home. Confirm quiet windows so you are not surprised later.',
      ],
    },
  ],
  guests: [
    {
      id: 'guests_aligned',
      polarity: 'strength',
      lines: [
        'Your guest habits sit close to what this host prefers for the apartment.',
        'How often you like having people over looks compatible with this household.',
      ],
    },
    {
      id: 'guests_gap',
      polarity: 'watch',
      lines: [
        'Your guest habits differ from this host preference. Check overnight and weekday guest rules early.',
        'Hosting friends may land differently for you here. Align on guest frequency before you apply.',
      ],
    },
  ],
  parties: [
    {
      id: 'parties_aligned',
      polarity: 'strength',
      lines: [
        'Your social hosting energy matches what this listing is set up for.',
        'Your gathering preferences line up with the house rules vibe this host wants.',
      ],
    },
    {
      id: 'parties_gap',
      polarity: 'watch',
      lines: [
        'Your gathering preferences differ from this host. Confirm what social nights look like before you apply.',
        'This listing may want a quieter social rhythm than you. Worth clarifying up front.',
      ],
    },
  ],
  social: [
    {
      id: 'social_aligned',
      polarity: 'strength',
      lines: [
        'Your social energy at home matches what this host prefers for the place.',
        'Your day-to-day social level looks compatible with how this household likes to live.',
      ],
    },
    {
      id: 'social_gap',
      polarity: 'watch',
      lines: [
        'Your home social energy differs from this host. Talk through alone-time vs shared hangouts early.',
        'You may want a different social rhythm than this home expects. A quick chat usually helps.',
      ],
    },
  ],
  chores: [
    {
      id: 'chores_aligned',
      polarity: 'strength',
      lines: [
        'Your chore expectations line up with this host, which keeps shared responsibilities clearer for you.',
        'You and this host seem aligned on how much structure chores should have.',
      ],
    },
    {
      id: 'chores_gap',
      polarity: 'watch',
      lines: [
        'Your chore expectations differ from this host. Agree on a light rota for kitchen and bathroom.',
        'Your household-task style may not match perfectly. Write down who owns which basics.',
      ],
    },
  ],
  schedule: [
    {
      id: 'schedule_aligned',
      polarity: 'strength',
      lines: [
        'Your daily schedule rhythm matches what this host prefers for the home.',
        'Your morning and evening energy looks compatible with this listing preferred schedule.',
      ],
    },
    {
      id: 'schedule_gap',
      polarity: 'watch',
      lines: [
        'Your schedule rhythm differs from this host. Soft closes and quiet mornings help a lot.',
        'Your early-bird or night-owl timing may clash here. Agree on quiet windows up front.',
      ],
    },
  ],
  lifestyle_overall: [
    {
      id: 'life_strong',
      polarity: 'strength',
      weight: 2,
      lines: [
        'Your lifestyle answers line up well with this host preferences for the apartment.',
        'Your day-to-day living style looks like a strong fit for how this home is meant to run.',
      ],
    },
    {
      id: 'life_mid',
      polarity: 'neutral',
      lines: [
        'Your lifestyle fit is mixed: some of your habits match this host, others may need a short conversation.',
        'You share some living preferences with this host, with a few soft gaps worth clarifying.',
      ],
    },
    {
      id: 'life_weak',
      polarity: 'watch',
      weight: 2,
      lines: [
        'Your lifestyle preferences diverge from this host in a few key areas. Read the house rules carefully.',
        'Several of your living-style signals differ from what this listing asks for. Align expectations before you apply.',
      ],
    },
  ],
}

const BUDGET_VARIANTS: InsightVariant[] = [
  {
    id: 'budget_comfortable',
    polarity: 'strength',
    lines: [
      'Your budget leaves comfortable headroom for this rent, plus utilities and daily costs.',
      'This listing sits well inside your max rent, so cost looks like a strong fit for you.',
    ],
  },
  {
    id: 'budget_within',
    polarity: 'strength',
    lines: [
      'Your stated monthly budget covers this rent without stretching.',
      'Cost-wise this apartment aligns with what you said you can spend.',
    ],
  },
  {
    id: 'budget_tight',
    polarity: 'watch',
    lines: [
      'This rent sits close to your ceiling. Factor your utilities and deposit before you apply.',
      'Your budget fit is tight here. Double-check total monthly cost including utilities.',
    ],
  },
  {
    id: 'budget_over',
    polarity: 'watch',
    weight: 2,
    lines: [
      'This rent is above your current max. You may need to stretch your budget or keep looking.',
      'This listing sits over your stated rent limit, which weakens your budget compatibility.',
    ],
  },
  {
    id: 'budget_unknown',
    polarity: 'neutral',
    lines: [
      'You have not set a clear max rent yet, so this cost score is only a neutral estimate.',
      'Add your monthly budget in your profile so we can tell you how well this rent fits you.',
    ],
  },
]

const TIMELINE_VARIANTS: InsightVariant[] = [
  {
    id: 'timeline_flexible',
    polarity: 'strength',
    lines: [
      'Your move-in flexibility looks strong for this listing availability window.',
      'Timing works in your favour here: you can adapt enough to match when this home frees up.',
    ],
  },
  {
    id: 'timeline_ok',
    polarity: 'neutral',
    lines: [
      'Your move-in timing is workable if dates stay close to what the host posted.',
      'Your timeline fit is moderate. Confirm the exact move-in date before you apply.',
    ],
  },
  {
    id: 'timeline_tight',
    polarity: 'watch',
    lines: [
      'Your move-in window looks tight for this listing. Confirm dates with the host early.',
      'Timing may be your weaker fit here. Check availability and lease start before you apply.',
    ],
  },
  {
    id: 'timeline_stay',
    polarity: 'neutral',
    lines: [
      'Your planned stay length should still be checked against this host minimum lease.',
      'Confirm your planned duration against the min stay so timeline surprises do not show up later.',
    ],
  },
]

const OVERALL_VARIANTS: InsightVariant[] = [
  {
    id: 'overall_strong',
    polarity: 'strength',
    lines: [
      'Based on your answers and this host preferences, you look like a strong applicant for this home. Your lifestyle and practical fit pull the score up.',
      'Your profile aligns well with what this host is screening for. That is why your overall fit lands in a competitive range.',
    ],
  },
  {
    id: 'overall_good',
    polarity: 'strength',
    lines: [
      'Your answers and this host preferences mostly line up. A couple of softer gaps keep the score from being perfect, but you still look like a solid fit.',
      'You match this listing on several key signals. Hosts rank by lifestyle fit, and your profile already reads as a credible match.',
    ],
  },
  {
    id: 'overall_mixed',
    polarity: 'neutral',
    lines: [
      'Your overall score reflects a mixed picture: some of your preferences match this host closely, while others leave room to clarify before you apply.',
      'Comparing your answers with this host listing prefs, you land in the middle. Read the dimension insights to see where you align and where you differ.',
    ],
  },
  {
    id: 'overall_watch',
    polarity: 'watch',
    lines: [
      'Your answers diverge from this host preferences in a few important places, which is why the overall fit is lower. Review the watch-outs before you apply.',
      'This score is lower because some of your lifestyle or practical signals conflict with what this listing asks for. Use the breakdown to see what is pulling you down.',
    ],
  },
]

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pickLine(lines: string[], seed: string): string {
  if (!lines.length) return ''
  const h = hashSeed(seed)
  return lines[h % lines.length]!
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(1, n))
}

function likertSim(a: number, b: number): number {
  return clamp01(1 - Math.abs(a - b) / 4)
}

type TopicScore = { topic: string; sim: number }

function lifestyleTopicScores(
  member: MemberHousingSignals,
  prefs: ListingLifestylePrefs
): TopicScore[] {
  const scores: TopicScore[] = []
  if (prefs.cleanliness != null && member.cleanliness != null) {
    scores.push({ topic: 'cleanliness', sim: likertSim(prefs.cleanliness, member.cleanliness) })
  }
  if (prefs.quiet_hours_importance != null && member.quietHoursImportance != null) {
    scores.push({
      topic: 'quiet_hours',
      sim: likertSim(prefs.quiet_hours_importance, member.quietHoursImportance),
    })
  }
  if (prefs.guests_frequency != null && member.guestsFrequency != null) {
    scores.push({ topic: 'guests', sim: likertSim(prefs.guests_frequency, member.guestsFrequency) })
  }
  if (prefs.overnight_guests != null && member.overnightGuests != null) {
    scores.push({
      topic: 'guests',
      sim: likertSim(prefs.overnight_guests, member.overnightGuests),
    })
  }
  if (prefs.parties_frequency != null && member.partiesFrequency != null) {
    scores.push({ topic: 'parties', sim: likertSim(prefs.parties_frequency, member.partiesFrequency) })
  }
  if (prefs.social_level != null && member.socialLevel != null) {
    scores.push({ topic: 'social', sim: likertSim(Number(prefs.social_level), member.socialLevel) })
  }
  if (prefs.chores_expectation != null && member.choresExpectation != null) {
    scores.push({
      topic: 'chores',
      sim: likertSim(prefs.chores_expectation, member.choresExpectation),
    })
  }
  if (prefs.preferred_schedule && member.preferredSchedule) {
    const scheduleSim =
      prefs.preferred_schedule === member.preferredSchedule
        ? 1
        : prefs.preferred_schedule === 'flexible' || member.preferredSchedule === 'flexible'
          ? 0.75
          : 0.35
    scores.push({ topic: 'schedule', sim: scheduleSim })
  }
  return scores
}

function pickVariant(
  variants: InsightVariant[],
  polarity: Polarity,
  seed: string
): string {
  const pool = variants.filter((v) => v.polarity === polarity)
  const use = pool.length ? pool : variants
  const expanded = use.flatMap((v) =>
    Array.from({ length: Math.max(1, v.weight ?? 1) }, () => v)
  )
  const chosen = expanded[hashSeed(seed) % expanded.length]!
  return pickLine(chosen.lines, `${seed}:${chosen.id}`)
}

function buildLifestyleInsight(
  members: MemberHousingSignals[],
  listing: ListingScoreInput,
  score: number,
  seed: string
): string {
  const prefs = listing.lifestylePrefs || {}
  const member = members[0]
  if (!member) {
    return pickVariant(LIFESTYLE_BY_TOPIC.lifestyle_overall, 'neutral', seed)
  }

  const topics = lifestyleTopicScores(member, prefs)
  if (!topics.length) {
    if (score >= 0.75) return pickVariant(LIFESTYLE_BY_TOPIC.lifestyle_overall, 'strength', seed)
    if (score < 0.55) return pickVariant(LIFESTYLE_BY_TOPIC.lifestyle_overall, 'watch', seed)
    return pickVariant(LIFESTYLE_BY_TOPIC.lifestyle_overall, 'neutral', seed)
  }

  const sorted = [...topics].sort((a, b) => b.sim - a.sim)
  const best = sorted[0]!
  const worst = sorted[sorted.length - 1]!

  if (score >= 0.72 && best.sim >= 0.7) {
    const bank = LIFESTYLE_BY_TOPIC[best.topic]
    if (bank) return pickVariant(bank, 'strength', `${seed}:${best.topic}`)
  }
  if (score < 0.55 || worst.sim < 0.5) {
    const bank = LIFESTYLE_BY_TOPIC[worst.topic]
    if (bank) return pickVariant(bank, 'watch', `${seed}:${worst.topic}`)
  }
  if (best.sim - worst.sim >= 0.25) {
    const bank = LIFESTYLE_BY_TOPIC[best.topic]
    if (bank) return pickVariant(bank, best.sim >= 0.7 ? 'strength' : 'watch', `${seed}:mix`)
  }

  if (score >= 0.75) return pickVariant(LIFESTYLE_BY_TOPIC.lifestyle_overall, 'strength', seed)
  if (score < 0.55) return pickVariant(LIFESTYLE_BY_TOPIC.lifestyle_overall, 'watch', seed)
  return pickVariant(LIFESTYLE_BY_TOPIC.lifestyle_overall, 'neutral', seed)
}

function buildBudgetInsight(
  members: MemberHousingSignals[],
  listing: ListingScoreInput,
  score: number,
  seed: string
): string {
  const budgets = members
    .map((m) => m.maxRentMonthly)
    .filter((n): n is number => typeof n === 'number' && n > 0)
  if (!budgets.length) {
    return pickVariant(BUDGET_VARIANTS, 'neutral', seed)
  }
  const limiting = Math.min(...budgets)
  const rent = listing.rentMonthly
  if (rent > limiting) return pickVariant(BUDGET_VARIANTS, 'watch', `${seed}:over`)
  const headroom = (limiting - rent) / Math.max(limiting, 1)
  if (headroom >= 0.15 || score >= 0.85) {
    return pickLine(
      BUDGET_VARIANTS.find((v) => v.id === 'budget_comfortable')!.lines,
      seed
    )
  }
  if (score >= 0.7) {
    return pickLine(BUDGET_VARIANTS.find((v) => v.id === 'budget_within')!.lines, seed)
  }
  if (score < 0.5) {
    return pickLine(BUDGET_VARIANTS.find((v) => v.id === 'budget_over')!.lines, seed)
  }
  return pickLine(BUDGET_VARIANTS.find((v) => v.id === 'budget_tight')!.lines, seed)
}

function buildTimelineInsight(
  members: MemberHousingSignals[],
  _listing: ListingScoreInput,
  score: number,
  seed: string
): string {
  if (score >= 0.75) return pickVariant(TIMELINE_VARIANTS, 'strength', seed)
  if (score < 0.45) return pickVariant(TIMELINE_VARIANTS, 'watch', seed)
  const flex = members
    .map((m) => m.moveInFlexibilityDays)
    .filter((n): n is number => typeof n === 'number')
  if (flex.length && Math.min(...flex) < 14) {
    return pickVariant(TIMELINE_VARIANTS, 'watch', `${seed}:flex`)
  }
  return pickVariant(TIMELINE_VARIANTS, 'neutral', seed)
}

function dimensionLabel(key: ListingFitDimension): string {
  if (key === 'lifestyle') return 'lifestyle'
  if (key === 'budget') return 'budget'
  return 'timeline'
}

function buildOverallInsight(
  breakdown: { lifestyle: number; budget: number; timeline: number },
  overallScore: number | undefined,
  seed: string
): string {
  const entries: Array<[ListingFitDimension, number]> = [
    ['lifestyle', breakdown.lifestyle],
    ['budget', breakdown.budget],
    ['timeline', breakdown.timeline],
  ]
  const sorted = [...entries].sort((a, b) => b[1] - a[1])
  const strongest = sorted[0]!
  const weakest = sorted[sorted.length - 1]!
  const avg =
    overallScore ??
    (breakdown.lifestyle + breakdown.budget + breakdown.timeline) / 3

  let base: string
  if (avg >= 0.8) base = pickVariant(OVERALL_VARIANTS, 'strength', `${seed}:strong`)
  else if (avg >= 0.68) base = pickLine(OVERALL_VARIANTS.find((v) => v.id === 'overall_good')!.lines, seed)
  else if (avg >= 0.5) base = pickVariant(OVERALL_VARIANTS, 'neutral', seed)
  else base = pickVariant(OVERALL_VARIANTS, 'watch', seed)

  if (strongest[1] - weakest[1] < 0.12) return base

  const tail =
    strongest[1] >= 0.7 && weakest[1] < 0.55
      ? ` Your ${dimensionLabel(strongest[0])} alignment is pulling you up, while ${dimensionLabel(weakest[0])} is the main drag on your score.`
      : strongest[1] >= 0.7
        ? ` Your strongest signal here is ${dimensionLabel(strongest[0])}.`
        : weakest[1] < 0.55
          ? ` Your ${dimensionLabel(weakest[0])} gap is the main reason this score is not higher.`
          : ''

  return `${base}${tail}`
}

/**
 * Build per-dimension + overall insight copy for an applicant (or group) vs listing.
 */
export function buildListingFitInsights(
  members: MemberHousingSignals[],
  listing: ListingScoreInput,
  breakdown: { lifestyle: number; budget: number; timeline: number },
  overallScore?: number
): ListingFitInsights {
  const seedBase = `${members.map((m) => m.userId).sort().join(',')}:${listing.rentMonthly}:${listing.availableFrom ?? ''}`
  return {
    lifestyle: buildLifestyleInsight(members, listing, breakdown.lifestyle, `${seedBase}:lifestyle`),
    budget: buildBudgetInsight(members, listing, breakdown.budget, `${seedBase}:budget`),
    timeline: buildTimelineInsight(members, listing, breakdown.timeline, `${seedBase}:timeline`),
    overall: buildOverallInsight(breakdown, overallScore, `${seedBase}:overall`),
  }
}

/** Flat export of template lines for DB seeding / admin reference. */
export function listAllInsightTemplateLines(): Array<{
  dimension: ListingFitDimension | 'lifestyle_topic' | 'overall'
  topic: string
  polarity: Polarity
  body: string
}> {
  const rows: Array<{
    dimension: ListingFitDimension | 'lifestyle_topic' | 'overall'
    topic: string
    polarity: Polarity
    body: string
  }> = []

  for (const [topic, variants] of Object.entries(LIFESTYLE_BY_TOPIC)) {
    for (const v of variants) {
      for (const body of v.lines) {
        rows.push({
          dimension: topic === 'lifestyle_overall' ? 'lifestyle' : 'lifestyle_topic',
          topic,
          polarity: v.polarity,
          body,
        })
      }
    }
  }
  for (const v of BUDGET_VARIANTS) {
    for (const body of v.lines) {
      rows.push({ dimension: 'budget', topic: v.id, polarity: v.polarity, body })
    }
  }
  for (const v of TIMELINE_VARIANTS) {
    for (const body of v.lines) {
      rows.push({ dimension: 'timeline', topic: v.id, polarity: v.polarity, body })
    }
  }
  for (const v of OVERALL_VARIANTS) {
    for (const body of v.lines) {
      rows.push({ dimension: 'overall', topic: v.id, polarity: v.polarity, body })
    }
  }
  return rows
}
