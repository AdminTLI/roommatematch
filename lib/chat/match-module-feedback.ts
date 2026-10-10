/**
 * Pre-generated Match Insights feedback for v2 questionnaire modules.
 *
 * Uses both users' saved answers (when available) to spot topics that line up
 * vs topics that diverge, then picks curated copy. Never exposes raw answers.
 * Tone: similarity framing, student-friendly, no shame language. No em dashes.
 */

import type { V2ChatModuleKey } from '@/lib/chat/vibe-alignment'
import { V2_CHAT_MODULES } from '@/lib/chat/vibe-alignment'

export type ModuleInsightBlock = {
  key: V2ChatModuleKey
  label: string
  score: number | null
  strengths: string[]
  watchOuts: string[]
}

export type MatchInsightSummary = {
  headline: string
  strengths: string[]
  watchOuts: string[]
  tip: string
}

export type BuiltMatchInsights = {
  modules: ModuleInsightBlock[]
  summary: MatchInsightSummary
}

type TopicDef = {
  id: string
  /** Questionnaire item IDs that feed this topic */
  items: string[]
  strengths: string[]
  watchOuts: string[]
}

const STRENGTH_SIM_THRESHOLD = 0.72
const WATCH_SIM_THRESHOLD = 0.48
const MAX_STRENGTHS_PER_MODULE = 3
const MAX_WATCH_PER_MODULE = 3
const MAX_SUMMARY_BULLETS = 4

/** Stable hash so the same pair always sees the same copy variants. */
function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pickStable<T>(items: T[], count: number, seed: string): T[] {
  if (items.length === 0 || count <= 0) return []
  const out: T[] = []
  const used = new Set<number>()
  let h = hashSeed(seed)
  for (let i = 0; i < count && used.size < items.length; i++) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0
    let idx = h % items.length
    let guard = 0
    while (used.has(idx) && guard < items.length) {
      idx = (idx + 1) % items.length
      guard++
    }
    used.add(idx)
    out.push(items[idx]!)
  }
  return out
}

function unwrap(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'value' in (raw as object)) {
    return (raw as { value: unknown }).value
  }
  return raw
}

function parseTimeToHours(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim())
  if (!m) return null
  const hh = Number(m[1])
  const mm = Number(m[2])
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null
  return hh + mm / 60
}

/** 0-1 similarity; null if either side missing / incomparable. */
export function answerSimilarity(rawA: unknown, rawB: unknown): number | null {
  const a = unwrap(rawA)
  const b = unwrap(rawB)
  if (a == null || b == null || a === '' || b === '') return null

  if (typeof a === 'number' && typeof b === 'number') {
    // Likert / bipolar-ish numeric scales
    const span = Math.max(4, Math.abs(a), Math.abs(b), 1)
    return Math.max(0, Math.min(1, 1 - Math.abs(a - b) / span))
  }

  if (
    a &&
    b &&
    typeof a === 'object' &&
    typeof b === 'object' &&
    typeof (a as { start?: unknown }).start === 'string' &&
    typeof (a as { end?: unknown }).end === 'string' &&
    typeof (b as { start?: unknown }).start === 'string' &&
    typeof (b as { end?: unknown }).end === 'string'
  ) {
    const as = parseTimeToHours((a as { start: string }).start)
    const ae = parseTimeToHours((a as { end: string }).end)
    const bs = parseTimeToHours((b as { start: string }).start)
    const be = parseTimeToHours((b as { end: string }).end)
    if (as == null || ae == null || bs == null || be == null) return null
    const startDiff = Math.min(Math.abs(as - bs), 24 - Math.abs(as - bs))
    const endDiff = Math.min(Math.abs(ae - be), 24 - Math.abs(ae - be))
    const avg = (startDiff + endDiff) / 2
    return Math.max(0, Math.min(1, 1 - avg / 4))
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 1 : 0
  }

  if (typeof a === 'string' && typeof b === 'string') {
    return a.trim().toLowerCase() === b.trim().toLowerCase() ? 1 : 0
  }

  try {
    return JSON.stringify(a) === JSON.stringify(b) ? 1 : 0.25
  } catch {
    return null
  }
}

function toUnit(score: number | null | undefined): number | null {
  if (score == null || Number.isNaN(score)) return null
  return score > 1 ? Math.min(1, score / 100) : Math.min(1, Math.max(0, score))
}

// ── Topic banks (mapped to weighted questionnaire items) ────────────────────

const LOGISTICS_TOPICS: TopicDef[] = [
  {
    id: 'cost_split',
    items: ['M1_Q10'],
    strengths: [
      'You both lean toward a similar way of splitting shared costs, which usually keeps money chats low-drama.',
      'Your cost-sharing instincts look aligned, so rent and utilities talks should feel straightforward.',
      'You seem to share a similar fairness style around household expenses.',
    ],
    watchOuts: [
      'Your cost-split instincts differ. Agree early on what is shared vs personal so nobody feels surprised.',
      'Money vibes are not identical here. A simple monthly split plan can prevent awkward moments.',
      'You may see fairness differently for shared bills. Write down what each person covers before move-in.',
    ],
  },
  {
    id: 'rules',
    items: ['M1_Q20', 'M8_Q24'],
    strengths: [
      'You both seem comfortable with a similar level of house-rule structure.',
      'Your approach to roommate agreements looks compatible.',
      'You line up on how formal (or chill) home ground rules should feel.',
    ],
    watchOuts: [
      'One of you likes clearer house rules than the other. Decide which basics are non-negotiable.',
      'Rule strictness differs. Start with a short living agreement covering the top three must-haves.',
      'You may disagree on how formal house expectations should be. Keep it light but written.',
    ],
  },
  {
    id: 'timing',
    items: ['M8_Q23', 'M8_Q20'],
    strengths: [
      'Your move-in timing and stay-length preferences look reasonably in sync.',
      'Practical timing (when and how long) looks like a shared strength.',
      'You both seem aligned on the logistics timeline for living together.',
    ],
    watchOuts: [
      'Move-in timing or stay length may not match perfectly. Confirm dates and lease length early.',
      'Your practical timelines differ a bit. Double-check move-in windows before signing anything.',
      'Stay plans might diverge. Be clear about how long each of you expects to stay.',
    ],
  },
  {
    id: 'admin',
    items: ['M8_Q25', 'M8_Q12', 'M6_Q7'],
    strengths: [
      'You seem similarly practical about admin stuff like docs, insurance, and follow-through.',
      'Your logistics admin styles look compatible, which helps with contracts and setup.',
    ],
    watchOuts: [
      'Admin and follow-through styles differ. Decide who handles landlord messages and paperwork.',
      'One of you may be more proactive on practical admin. Split ownership of tasks to stay balanced.',
    ],
  },
]

const ENVIRONMENT_TOPICS: TopicDef[] = [
  {
    id: 'sleep',
    items: ['M2_Q1'],
    strengths: [
      'Your sleep chronotypes look similar, which makes shared mornings and evenings easier.',
      'You both seem to keep a comparable sleep rhythm, a big win for flat life.',
      'Bedtime energy looks aligned, so late-night/early-morning clashes should be rarer.',
    ],
    watchOuts: [
      'Sleep schedules may differ. Agree on quiet windows so early birds and night owls both feel respected.',
      'Your chronotypes are not identical. Headphones and soft closes go a long way at night.',
      'Different sleep rhythms are normal. Set a gentle quiet-hours window from day one.',
    ],
  },
  {
    id: 'quiet_hours',
    items: ['M2_Q13', 'M2_Q15', 'M2_Q19'],
    strengths: [
      'Quiet-hours expectations look closely aligned across weekdays and weekends.',
      'You both seem to value a similar noise rhythm at home.',
      'Late-night noise tolerance looks compatible, which reduces surprise friction.',
    ],
    watchOuts: [
      'Quiet-hours preferences differ. Decide what counts as too loud after a certain time.',
      'Weekend noise expectations may not match. Agree on guests, calls, and music after hours.',
      'Late-night tolerance is a gap. A simple "after X, keep it soft" rule helps everyone.',
    ],
  },
  {
    id: 'noise',
    items: ['M3_Q2', 'M3_Q4', 'M2_Q6'],
    strengths: [
      'Noise sensitivity looks similar, so volume and background buzz should feel natural to both of you.',
      'You seem aligned on how loud home life should feel day to day.',
      'Sound preferences line up, which makes shared spaces easier to share.',
    ],
    watchOuts: [
      'Noise sensitivity differs. Talk about studying, calls, and music in shared rooms.',
      'One of you may need quieter focus time. Headphones and door cues can help.',
      'Volume preferences are not identical. Agree which rooms are for chill vs deep focus.',
    ],
  },
  {
    id: 'home_vibe',
    items: ['M1_Q6', 'M7_Q2'],
    strengths: [
      'Your overall home vibe and alone-time needs look compatible.',
      'You both seem to want a similar atmosphere when you walk through the door.',
    ],
    watchOuts: [
      'Home vibe or alone-time needs differ. Check in on when each of you wants company vs quiet.',
      'One of you may recharge differently at home. Protect alone time without making it personal.',
    ],
  },
  {
    id: 'climate',
    items: ['M3_Q12', 'M3_Q18', 'M3_Q25'],
    strengths: [
      'Small environment prefs (light, temperature, sensory comfort) look reasonably aligned.',
    ],
    watchOuts: [
      'Temperature or lighting prefs may differ. Those are easy to negotiate room by room.',
    ],
  },
]

const CLEANLINESS_TOPICS: TopicDef[] = [
  {
    id: 'standard',
    items: ['M4_Q1', 'M4_Q12'],
    strengths: [
      'Cleanliness standards look similar, which is one of the biggest roommate harmony factors.',
      'You both seem to expect a comparable baseline of tidiness in shared spaces.',
      'Your "clean enough" bar looks aligned, so kitchen and living-room vibes should feel fair.',
    ],
    watchOuts: [
      'Cleanliness standards differ. Define what "done" looks like for kitchen, bathroom, and living room.',
      'Your tidy baseline is not identical. A weekly shared reset can prevent silent resentment.',
      'One of you may notice mess sooner. Agree on a minimum shared-space standard early.',
    ],
  },
  {
    id: 'dishes',
    items: ['M4_Q4'],
    strengths: [
      'Dish-washing timing looks compatible, a classic roommate flashpoint you seem to avoid.',
      'You both seem to handle kitchen cleanup on a similar clock.',
    ],
    watchOuts: [
      'Dish timing differs. Agree whether sinks get cleared same-day or next morning.',
      'Kitchen cleanup pace is a gap. A simple "no overnight dishes" rule often fixes it.',
    ],
  },
  {
    id: 'chores',
    items: ['M4_Q14', 'M4_Q25', 'M4_Q7'],
    strengths: [
      'Chore schedules and deep-clean willingness look compatible.',
      'You both seem open to a similar level of structured cleaning.',
      'Communal kitchen habits look aligned.',
    ],
    watchOuts: [
      'Chore structure preferences differ. Decide if you want a rota or a flexible shared list.',
      'Deep-clean energy is not identical. Split big tasks (fridge, bathroom) so it stays fair.',
      'Kitchen sharing style may differ. Clarify fridge zones and shared vs personal food.',
    ],
  },
  {
    id: 'money_ops',
    items: ['M4_Q24', 'M8_Q2', 'M8_Q5'],
    strengths: [
      'You seem similarly practical about cleaning funds, expense apps, and small shared buys.',
    ],
    watchOuts: [
      'Shared expense habits differ. Pick one simple system for cleaning supplies and small buys.',
    ],
  },
  {
    id: 'boundaries',
    items: ['M4_Q20', 'M7_Q9', 'M8_Q7'],
    strengths: [
      'Bathroom privacy and shared-tools habits look reasonably aligned.',
    ],
    watchOuts: [
      'Privacy around toiletries or shared tools may differ. Label personal items if needed.',
    ],
  },
]

const COMMUNICATION_TOPICS: TopicDef[] = [
  {
    id: 'style',
    items: ['M6_Q9', 'M6_Q1'],
    strengths: [
      'Communication style looks aligned, so feedback chats should feel natural.',
      'You both seem to prefer a similar channel and tone for house issues.',
      'Your directness levels look compatible, which reduces mixed signals.',
    ],
    watchOuts: [
      'Communication style differs. Ask how each of you prefers to raise small issues.',
      'One of you may be more direct. Agree that honesty is kindness, not conflict.',
      'Preferred channels differ (chat vs in person). Match the medium to the moment.',
    ],
  },
  {
    id: 'conflict',
    items: ['M1_Q23', 'M6_Q8'],
    strengths: [
      'Conflict and banter tolerance look compatible, which keeps small friction from escalating.',
      'You seem aligned on how seriously (or lightly) to take house disagreements.',
    ],
    watchOuts: [
      'Conflict styles differ. Agree to pause heated moments and revisit when calmer.',
      'Banter tolerance is not identical. Check jokes that land differently for each of you.',
      'You may repair differently after friction. A quick "are we good?" habit helps.',
    ],
  },
  {
    id: 'boundaries_culture',
    items: ['M1_Q19', 'M1_Q18', 'M5_Q12', 'M5_Q14'],
    strengths: [
      'Cultural flexibility and language comfort look like shared strengths.',
      'Guest-boundary instincts in conversation look reasonably aligned.',
    ],
    watchOuts: [
      'Cultural or language preferences may differ. Stay curious and ask before assuming.',
      'Boundary-setting styles differ. Be explicit about guests, privacy, and shared norms.',
    ],
  },
  {
    id: 'etiquette',
    items: ['M6_Q15', 'M6_Q16', 'M6_Q11', 'M6_Q21'],
    strengths: [
      'Day-to-day etiquette (doors, reply speed, house tools) looks compatible.',
    ],
    watchOuts: [
      'Reply-speed or door etiquette may differ. Tiny habits matter more than they seem.',
      'Comfort with house apps or anonymous feedback differs. Keep communication human first.',
    ],
  },
]

const SOCIAL_TOPICS: TopicDef[] = [
  {
    id: 'guests',
    items: ['M5_Q1', 'M5_Q2'],
    strengths: [
      'Guest frequency and notice preferences look aligned.',
      'You both seem to expect a similar social rhythm with visitors.',
      'Hosting expectations look compatible, which protects quiet nights for both of you.',
    ],
    watchOuts: [
      'Guest frequency differs. Agree how often friends can come over and how much notice you want.',
      'Notice expectations are a gap. A simple "text the group chat first" rule usually works.',
      'Hosting energy is not identical. Balance social nights with recovery evenings.',
    ],
  },
  {
    id: 'overnight',
    items: ['M5_Q5', 'M5_Q8'],
    strengths: [
      'Overnight guest and partner-stay preferences look reasonably in sync.',
      'You seem aligned on how often overnight visitors feel okay.',
    ],
    watchOuts: [
      'Overnight guests or partner stays may be a gap. Set a clear, respectful default early.',
      'Partner-stay frequency differs. Talk about bathroom mornings and shared-space etiquette.',
    ],
  },
  {
    id: 'energy',
    items: ['M1_Q13', 'M5_Q11'],
    strengths: [
      'Social energy at home looks compatible, so common areas should feel natural to share.',
      'You both seem similarly comfortable with gatherings in shared spaces.',
    ],
    watchOuts: [
      'Social energy at home differs. Protect quiet zones when one of you needs to recharge.',
      'Gathering comfort is not identical. Decide which rooms stay guest-friendly vs chill-only.',
    ],
  },
  {
    id: 'shared_life',
    items: ['M5_Q18', 'M7_Q3', 'M7_Q6', 'M7_Q11', 'M7_Q17', 'M7_Q19'],
    strengths: [
      'Shared-life details (alcohol norms, co-studying, lending, decor) look fairly aligned.',
      'Small social-space habits look compatible enough to keep daily life easy.',
    ],
    watchOuts: [
      'Shared-life norms may differ (alcohol, lending, studying together). Clarify the soft rules.',
      'Decor or parcel habits might not match. Tiny house decisions add up, so check in early.',
    ],
  },
]

const MODULE_TOPICS: Record<V2ChatModuleKey, TopicDef[]> = {
  logistics_context: LOGISTICS_TOPICS,
  environment: ENVIRONMENT_TOPICS,
  cleanliness: CLEANLINESS_TOPICS,
  communication: COMMUNICATION_TOPICS,
  social: SOCIAL_TOPICS,
}

/** Generic fallback banks when item-level answers are thin. */
const MODULE_GENERIC: Record<
  V2ChatModuleKey,
  { strengths: string[]; watchOuts: string[] }
> = {
  logistics_context: {
    strengths: [
      'Overall logistics answers look similar, so practical planning should feel collaborative.',
      'You both seem to approach budgets, timing, and house setup with a comparable mindset.',
      'Practical living logistics look like a shared strength for this match.',
      'Your questionnaire answers suggest you can align on the "admin side" of flatsharing.',
    ],
    watchOuts: [
      'Logistics answers diverge in places. Compare budgets, move-in timing, and house rules early.',
      'Practical plans may not fully match. A short planning chat prevents last-minute stress.',
      'Confirm rent split, move-in dates, and must-have house rules before you commit.',
      'Some admin preferences differ. Decide who leads landlord/utilities setup.',
    ],
  },
  environment: {
    strengths: [
      'Environment answers line up well: sleep, quiet, and home rhythm look compatible.',
      'Your living-environment preferences feel like a natural fit.',
      'Day-to-day home atmosphere looks like a strength for you two.',
      'Shared rhythms (noise, rest, vibe) look easier than average to navigate together.',
    ],
    watchOuts: [
      'Environment answers show some gaps. Compare sleep, quiet hours, and noise needs.',
      'Home rhythm may differ. Agree on quiet windows and focus time.',
      'Sound and rest preferences are worth an early, friendly chat.',
      'Different environment styles are normal. Headphones + agreed quiet hours go far.',
    ],
  },
  cleanliness: {
    strengths: [
      'Cleanliness answers look closely aligned, a major predictor of low-friction living.',
      'Kitchen and shared-space standards seem compatible.',
      'Your tidy baseline looks similar enough that chores should feel fair.',
      'Cleaning habits look like a genuine strength in this match.',
    ],
    watchOuts: [
      'Cleanliness answers diverge. Define shared-space standards and a simple chore rhythm.',
      'Kitchen habits may differ. Agree on dishes, fridge zones, and weekly resets.',
      'Tidy expectations are a gap worth naming early (kindly).',
      'A short cleaning rota can turn a mismatch into an easy system.',
    ],
  },
  communication: {
    strengths: [
      'Communication answers look aligned, so feedback should feel easier to give and receive.',
      'You both seem to handle house friction in a compatible way.',
      'Conflict and feedback styles look like a strength here.',
      'Your questionnaire suggests similar expectations around honesty at home.',
    ],
    watchOuts: [
      'Communication styles differ. Ask how each person prefers to raise small issues.',
      'Conflict repair may look different for each of you. Normalize check-ins after friction.',
      'Directness levels are a gap. Lead with curiosity, not assumptions.',
      'Agree on a default: text for logistics, talk for feelings.',
    ],
  },
  social: {
    strengths: [
      'Social-life answers look aligned around guests, energy, and shared spaces.',
      'Hosting and home-social expectations seem compatible.',
      'You both appear to want a similar balance of company and calm at home.',
      'Guest norms look like a shared strength for this match.',
    ],
    watchOuts: [
      'Social preferences diverge. Compare guest frequency, overnight stays, and notice.',
      'Home social energy may differ. Protect recharge nights as intentionally as party nights.',
      'Hosting norms are a gap. Write a simple guest rule you both can live with.',
      'Partner stays and friends over are classic flashpoints. Name your preferences early.',
    ],
  },
}

function topicSimilarity(
  topic: TopicDef,
  answersA: Record<string, unknown>,
  answersB: Record<string, unknown>,
): number | null {
  const sims: number[] = []
  for (const itemId of topic.items) {
    const sim = answerSimilarity(answersA[itemId], answersB[itemId])
    if (sim != null) sims.push(sim)
  }
  if (sims.length === 0) return null
  return sims.reduce((s, v) => s + v, 0) / sims.length
}

function buildModuleBlock(
  key: V2ChatModuleKey,
  label: string,
  dimScore: number | null,
  answersA: Record<string, unknown>,
  answersB: Record<string, unknown>,
  seed: string,
): ModuleInsightBlock {
  const topics = MODULE_TOPICS[key]
  const strengthPool: string[] = []
  const watchPool: string[] = []

  for (const topic of topics) {
    const sim = topicSimilarity(topic, answersA, answersB)
    if (sim == null) continue
    if (sim >= STRENGTH_SIM_THRESHOLD) {
      strengthPool.push(...topic.strengths)
    } else if (sim <= WATCH_SIM_THRESHOLD) {
      watchPool.push(...topic.watchOuts)
    }
  }

  const unit = toUnit(dimScore)
  const generic = MODULE_GENERIC[key]

  // Score-band fallbacks so every module still teaches something useful.
  if (strengthPool.length === 0 && unit != null && unit >= 0.6) {
    strengthPool.push(...generic.strengths)
  }
  if (watchPool.length === 0 && unit != null && unit <= 0.55) {
    watchPool.push(...generic.watchOuts)
  }
  if (strengthPool.length === 0 && watchPool.length === 0) {
    // Mixed / unknown: give one of each from generics for value.
    strengthPool.push(...generic.strengths)
    watchPool.push(...generic.watchOuts)
  }

  // Always show at least one strength when the module is strong overall.
  if (unit != null && unit >= 0.75 && strengthPool.length === 0) {
    strengthPool.push(...generic.strengths)
  }
  // Always surface a watch-out when the module is weak overall.
  if (unit != null && unit < 0.5 && watchPool.length === 0) {
    watchPool.push(...generic.watchOuts)
  }

  const strengths = pickStable(strengthPool, MAX_STRENGTHS_PER_MODULE, `${seed}:${key}:s`)
  const watchOuts = pickStable(watchPool, MAX_WATCH_PER_MODULE, `${seed}:${key}:w`)

  return {
    key,
    label,
    score: unit,
    strengths,
    watchOuts,
  }
}

function buildSummary(
  modules: ModuleInsightBlock[],
  overallPct: number | null,
  seed: string,
): MatchInsightSummary {
  const ranked = [...modules].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const strongest = ranked.filter(m => (m.score ?? 0) >= 0.6).slice(0, 2)
  const weakest = [...ranked].reverse().filter(m => (m.score ?? 1) <= 0.55).slice(0, 2)

  const strengths = pickStable(
    strongest.flatMap(m => m.strengths),
    MAX_SUMMARY_BULLETS,
    `${seed}:sum-s`,
  )
  const watchOuts = pickStable(
    weakest.flatMap(m => m.watchOuts).length
      ? weakest.flatMap(m => m.watchOuts)
      : ranked.slice(-2).flatMap(m => m.watchOuts),
    MAX_SUMMARY_BULLETS,
    `${seed}:sum-w`,
  )

  const topLabel = strongest[0]?.label?.toLowerCase()
  const weakLabel = weakest[0]?.label?.toLowerCase() ?? ranked[ranked.length - 1]?.label?.toLowerCase()

  let headline = 'Your questionnaires show a mix of natural overlap and normal roommate differences.'
  if (overallPct != null && overallPct >= 75) {
    headline = topLabel
      ? `Strong overall fit, especially around ${topLabel}. Still worth a quick compare on day-to-day habits.`
      : 'Strong overall fit. Use the module notes below to turn alignment into clear house habits.'
  } else if (overallPct != null && overallPct >= 55) {
    headline = topLabel
      ? `Solid overlap with the clearest alignment on ${topLabel}. A few topics below are worth chatting through.`
      : 'Solid overlap overall. The notes below highlight where you already click and where to compare notes.'
  } else if (overallPct != null) {
    headline = weakLabel
      ? `Different rhythms in places (notably ${weakLabel}). That is common, and early clarity makes living together easier.`
      : 'Different rhythms in places. Early clarity on habits usually matters more than a perfect score.'
  }

  const tip = weakLabel
    ? `Start with one friendly chat about ${weakLabel}. Small agreements early beat silent assumptions later.`
    : 'Pick one module below and turn it into a 5-minute check-in before move-in.'

  return {
    headline,
    strengths:
      strengths.length > 0
        ? strengths
        : [
            'You both completed the questionnaire thoughtfully, which already gives you a better roommate starting point than most people get.',
          ],
    watchOuts:
      watchOuts.length > 0
        ? watchOuts
        : [
            'Even strong matches benefit from a short chat about quiet hours, kitchen habits, and guests.',
          ],
    tip,
  }
}

/**
 * Build structured Match Insights from dimension scores + both users' v2 answers.
 * Safe for client consumption: curated strings only.
 */
export function buildMatchModuleInsights(input: {
  dimensionScores?: Record<string, unknown> | null
  answersA?: Record<string, unknown> | null
  answersB?: Record<string, unknown> | null
  overallScore?: number | null
  /** Stable seed (e.g. sorted user ids) so copy does not flicker */
  seed?: string
}): BuiltMatchInsights {
  const answersA = input.answersA ?? {}
  const answersB = input.answersB ?? {}
  const dims = input.dimensionScores ?? {}
  const seed = input.seed || 'match-insights'

  const modules = V2_CHAT_MODULES.map(mod => {
    const raw = dims[mod.key]
    const score = typeof raw === 'number' && !Number.isNaN(raw) ? raw : null
    return buildModuleBlock(mod.key, mod.label, score, answersA, answersB, seed)
  })

  const overallPct =
    input.overallScore != null && !Number.isNaN(input.overallScore)
      ? Math.round((toUnit(input.overallScore) ?? 0) * 100)
      : null

  return {
    modules,
    summary: buildSummary(modules, overallPct, seed),
  }
}
