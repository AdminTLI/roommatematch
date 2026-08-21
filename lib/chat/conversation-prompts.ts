import type { ChatCompatibilityPayload } from '@/lib/chat/fetch-chat-compatibility'
import { V2_CHAT_MODULES, isV2DimensionPayload } from '@/lib/chat/vibe-alignment'

export interface PromptChip {
  id: string
  label: string
  message: string
}

function pct(v: unknown): number | null {
  if (typeof v !== 'number' || Number.isNaN(v)) return null
  return v > 1 ? Math.min(100, Math.round(v)) : Math.min(100, Math.round(v * 100))
}

/** Prefer a real first name; never fall back to "them". */
export function partnerFirstName(...candidates: Array<string | null | undefined>): string {
  for (const raw of candidates) {
    const n = (raw || '').trim()
    if (!n) continue
    const first = n.split(/\s+/)[0]
    if (!first) continue
    if (first.toLowerCase() === 'them') continue
    return first
  }
  return 'there'
}

export interface ConversationPromptContext {
  partnerName?: string | null
  budgetMin?: number | null
  budgetMax?: number | null
  preferredCities?: string[] | null
  housingStatus?: string[] | null
  interests?: string[] | null
  compat?: ChatCompatibilityPayload | null
}

const MODULE_PROMPTS: Record<string, (name: string) => { label: string; message: string }> = {
  logistics_context: name => ({
    label: `Compare budgets with ${name}`,
    message: `Hey ${name}! Curious what budget range you're aiming for. Want to compare notes on rent and utilities?`,
  }),
  environment: name => ({
    label: `Ask ${name} about sleep schedule`,
    message: `Hey ${name}! Are you more of an early bird or night owl at home?`,
  }),
  cleanliness: name => ({
    label: `Chat chores with ${name}`,
    message: `Hey ${name}! How do you usually handle kitchen and shared cleaning: schedule or go-with-the-flow?`,
  }),
  communication: name => ({
    label: `Ask how ${name} handles feedback`,
    message: `Hey ${name}! If something small bugs you at home, do you prefer a quick chat or a message?`,
  }),
  social: name => ({
    label: `Ask ${name} about guests`,
    message: `Hey ${name}! How often do you like having friends over: weekends, rarely, or somewhere in between?`,
  }),
}

const ICEBREAKERS = [
  (name: string) => `Hey ${name}! What's your target budget for utilities each month?`,
  (name: string) => `Hi ${name}! When are you hoping to move in?`,
  (name: string) => `Hey ${name}! Do you study better with quiet evenings or a bit of background buzz?`,
  (name: string) => `Hi ${name}! Any deal-breakers for shared spaces I should know about?`,
  (name: string) => `Hey ${name}! Coffee person, tea person, or neither?`,
]

/** Deterministic icebreaker for mutual-match notification metadata (no AI). */
export function pickMutualMatchIcebreaker(partnerName?: string | null, seed?: string): string {
  const name = partnerFirstName(partnerName)
  let index = 0
  if (seed && seed.length > 0) {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
    }
    index = hash % ICEBREAKERS.length
  } else {
    index = Math.floor(Math.random() * ICEBREAKERS.length)
  }
  return ICEBREAKERS[index]!(name)
}

export function buildPromptChips(ctx: ConversationPromptContext): PromptChip[] {
  const name = partnerFirstName(ctx.partnerName)
  const chips: PromptChip[] = []
  const dims = ctx.compat?.dimension_scores_json

  if (dims && typeof dims === 'object' && !Array.isArray(dims) && isV2DimensionPayload(dims as Record<string, unknown>)) {
    const ranked = V2_CHAT_MODULES.map(m => ({
      key: m.key,
      score: pct((dims as Record<string, unknown>)[m.key]) ?? 0,
    })).sort((a, b) => b.score - a.score)

    for (const row of ranked.slice(0, 2)) {
      const builder = MODULE_PROMPTS[row.key]
      if (!builder) continue
      const { label, message } = builder(name)
      chips.push({ id: `mod-${row.key}`, label, message })
    }
  }

  if (ctx.budgetMin != null || ctx.budgetMax != null) {
    chips.push({
      id: 'budget',
      label: `Compare move-in budgets`,
      message: `Hey ${name}! Want to compare housing budgets and see if we're in a similar range?`,
    })
  }

  if (ctx.preferredCities && ctx.preferredCities.length > 0) {
    chips.push({
      id: 'city',
      label: `Talk neighborhoods`,
      message: `Hey ${name}! Which areas are you looking at, anything near campus or more central?`,
    })
  }

  if (ctx.interests && ctx.interests.length > 0) {
    const interest = ctx.interests[0]
    chips.push({
      id: 'interest',
      label: `Ask about ${interest}`,
      message: `Hey ${name}! I saw you're into ${interest}. Anything fun you're into lately?`,
    })
  }

  if (chips.length === 0) {
    chips.push(
      {
        id: 'intro',
        label: `Say hi to ${name}`,
        message: `Hey ${name}! Excited we matched. How's your housing search going?`,
      },
      {
        id: 'move-in',
        label: 'Compare move-in dates',
        message: `Hi ${name}! When are you hoping to move in?`,
      },
    )
  }

  const seen = new Set<string>()
  return chips.filter(c => {
    if (seen.has(c.id)) return false
    seen.add(c.id)
    return true
  }).slice(0, 4)
}

export function randomIcebreaker(partnerName?: string | null): string {
  const name = partnerFirstName(partnerName)
  const pick = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)]
  return pick(name)
}

export function attachMenuPrompts(partnerName?: string | null): PromptChip[] {
  const name = partnerFirstName(partnerName)
  return [
    {
      id: 'attach-budget',
      label: 'Share budget chat starter',
      message: `Hey ${name}! Quick one: what's your target monthly rent + utilities range?`,
    },
    {
      id: 'attach-move-in',
      label: 'Ask about move-in',
      message: `Hi ${name}! When are you hoping to move in, and how flexible is that date?`,
    },
    {
      id: 'attach-study',
      label: 'Suggest a study schedule',
      message: `Hey ${name}! Do you usually keep quiet study hours in the evening, or is daytime better for you?`,
    },
  ]
}

export function nudgeBioMessage(partnerName?: string | null): string {
  const name = partnerFirstName(partnerName)
  return `Hey ${name}! I'd love to know a bit more about you. Mind adding a short bio when you get a chance?`
}

export function nudgeHousingMessage(partnerName?: string | null): string {
  const name = partnerFirstName(partnerName)
  return `Hey ${name}! Curious about your housing prefs. Mind filling those out so we can compare notes?`
}
