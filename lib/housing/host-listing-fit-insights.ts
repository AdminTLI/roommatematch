/**
 * Host-facing fit copy for an applicant × listing score.
 * Written in second person for the host reviewing the applicant.
 */

export type HostListingFitInsights = {
  overall: string
  lifestyle: string
  budget: string
  timeline: string
  capacity: string
  amenities: string
  cohesion: string
}

function band(score01: number): 'strong' | 'ok' | 'weak' {
  if (score01 >= 0.75) return 'strong'
  if (score01 >= 0.5) return 'ok'
  return 'weak'
}

function to01(n: number | undefined): number {
  if (n == null || Number.isNaN(n)) return 0
  return n > 1 ? Math.min(1, n / 100) : Math.max(0, Math.min(1, n))
}

function dimLabel(key: 'lifestyle' | 'budget' | 'timeline'): string {
  if (key === 'lifestyle') return 'living habits'
  if (key === 'budget') return 'budget'
  return 'move-in timing'
}

const GATE_CONFLICT_COPY: Record<string, string> = {
  smoking:
    'Your listing prefers smoke-free, but at least one applicant indicated they smoke or are open to smoking.',
  pets: 'Your listing does not allow pets, but an applicant wants to bring a pet.',
  airbnb:
    'Your house rules disallow short-lets / Airbnb, but an applicant is open to that.',
  group_size:
    'Their group is larger than the number of people you are seeking for this listing.',
}

export function explainHostGateConflicts(conflicts: string[]): string[] {
  return conflicts
    .map((key) => GATE_CONFLICT_COPY[key] || `A hard house rule may conflict: ${key.replace(/_/g, ' ')}.`)
    .filter(Boolean)
}

export function buildHostListingFitInsights(
  breakdown: {
    lifestyle?: number
    budget?: number
    timeline?: number
    capacity?: number
    amenities?: number
    cohesion?: number
  },
  overallScore?: number | null,
  opts?: { groupSize?: number },
): HostListingFitInsights {
  const lifestyle = to01(breakdown.lifestyle)
  const budget = to01(breakdown.budget)
  const timeline = to01(breakdown.timeline)
  const capacity = to01(breakdown.capacity)
  const amenities = to01(breakdown.amenities)
  const cohesion = to01(breakdown.cohesion)
  const groupSize = opts?.groupSize ?? 1
  const overall =
    overallScore != null && Number.isFinite(overallScore)
      ? to01(overallScore)
      : (lifestyle + budget + timeline) / 3

  const lifestyleCopy: Record<ReturnType<typeof band>, string> = {
    strong:
      'Their day-to-day living style lines up well with the house rules and vibe you set for this listing.',
    ok: 'Living habits are a mixed fit: some preferences match your listing, others are worth clarifying in chat.',
    weak: 'Several lifestyle signals diverge from what you ask for. Confirm cleanliness, quiet hours, and guests early.',
  }

  const budgetCopy: Record<ReturnType<typeof band>, string> = {
    strong: 'Their stated budget covers your rent with comfortable headroom.',
    ok: 'Budget is workable but closer to their ceiling. Confirm utilities and deposit expectations.',
    weak: 'Their budget sits tight or below your rent. Ask how they plan to cover the full monthly cost.',
  }

  const timelineCopy: Record<ReturnType<typeof band>, string> = {
    strong: 'Their move-in window and stay length line up well with your availability.',
    ok: 'Timing is workable if dates stay close. Confirm the exact move-in date together.',
    weak: 'Move-in or stay length may not match your listing. Align on dates before sending an offer.',
  }

  const capacityCopy: Record<ReturnType<typeof band>, string> = {
    strong:
      groupSize > 1
        ? 'Their group size fits the rooms and people you are seeking.'
        : 'They are applying as one person, which fits the capacity you listed.',
    ok:
      groupSize > 1
        ? 'Group size is workable but close to your capacity. Confirm who would move in.'
        : 'Solo application is fine; double-check how many rooms you still want to fill.',
    weak:
      groupSize > 1
        ? 'Their group may be larger than what this listing can take. Confirm numbers before offering.'
        : 'Capacity is a weaker match for how many people you want in the home.',
  }

  const amenitiesCopy: Record<ReturnType<typeof band>, string> = {
    strong: 'The home features they care about line up well with what your listing offers.',
    ok: 'Some requested home features match; a few may be missing. Worth confirming in chat.',
    weak: 'Several amenities they want are not listed for this home. Ask what is must-have vs nice-to-have.',
  }

  const cohesionCopy: Record<ReturnType<typeof band>, string> = {
    strong:
      groupSize > 1
        ? 'People in this group look well aligned with each other as housemates.'
        : 'Solo application: group cohesion is not a factor here.',
    ok:
      groupSize > 1
        ? 'Group cohesion is okay, with a few soft gaps inside the group itself.'
        : 'Solo application: group cohesion is not a factor here.',
    weak:
      groupSize > 1
        ? 'This group may not be tightly aligned internally. Ask how they share chores and quiet hours.'
        : 'Solo application: group cohesion is not a factor here.',
  }

  const entries: Array<['lifestyle' | 'budget' | 'timeline', number]> = [
    ['lifestyle', lifestyle],
    ['budget', budget],
    ['timeline', timeline],
  ]
  const sorted = [...entries].sort((a, b) => b[1] - a[1])
  const strongest = sorted[0]!
  const weakest = sorted[sorted.length - 1]!

  let overallBase: string
  if (overall >= 0.8) {
    overallBase =
      'Based on their preferences and your listing, they look like a strong applicant for this home.'
  } else if (overall >= 0.68) {
    overallBase =
      'They look like a solid fit overall, with a couple of softer gaps that are easy to clarify in chat.'
  } else if (overall >= 0.5) {
    overallBase =
      'Overall fit is mixed: some signals match your listing closely, while others leave room to clarify.'
  } else {
    overallBase =
      'Overall fit is lower because a few important preferences diverge from your listing. Review the watch-outs carefully.'
  }

  let overallTail = ''
  if (strongest[1] - weakest[1] >= 0.12) {
    if (strongest[1] >= 0.7 && weakest[1] < 0.55) {
      overallTail = ` Their ${dimLabel(strongest[0])} alignment is strongest, while ${dimLabel(weakest[0])} is the main drag on the score.`
    } else if (strongest[1] >= 0.7) {
      overallTail = ` Their strongest signal is ${dimLabel(strongest[0])}.`
    } else if (weakest[1] < 0.55) {
      overallTail = ` Their ${dimLabel(weakest[0])} gap is the main reason this score is not higher.`
    }
  }

  return {
    overall: `${overallBase}${overallTail}`,
    lifestyle: lifestyleCopy[band(lifestyle)],
    budget: budgetCopy[band(budget)],
    timeline: timelineCopy[band(timeline)],
    capacity: capacityCopy[band(capacity)],
    amenities: amenitiesCopy[band(amenities)],
    cohesion: cohesionCopy[band(cohesion)],
  }
}
