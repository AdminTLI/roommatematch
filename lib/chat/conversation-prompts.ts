import type { ChatCompatibilityPayload } from '@/lib/chat/fetch-chat-compatibility'
import { V2_CHAT_MODULES, isV2DimensionPayload } from '@/lib/chat/vibe-alignment'

export interface PromptChip {
  id: string
  label: string
  message: string
}

export type PromptCategoryId =
  | 'housing'
  | 'living'
  | 'study'
  | 'social'
  | 'get_to_know'
  | 'fun'

export interface PromptCategory {
  id: PromptCategoryId
  title: string
  description: string
}

export interface ConversationQuestion {
  id: string
  category: PromptCategoryId
  /** Short label for the browse list */
  label: string
  /** Full message inserted into the composer; receives partner first name */
  build: (name: string) => string
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

export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'housing',
    title: 'Housing & Move-In',
    description: 'Budget, timing, neighborhoods, and flat search',
  },
  {
    id: 'living',
    title: 'Living Together',
    description: 'Chores, quiet hours, kitchen, and house rhythm',
  },
  {
    id: 'study',
    title: 'Study & Uni Life',
    description: 'Classes, exams, focus time, and campus routines',
  },
  {
    id: 'social',
    title: 'Guests & Social',
    description: 'Friends over, overnight stays, and shared spaces',
  },
  {
    id: 'get_to_know',
    title: 'Get To Know You',
    description: 'Background, goals, and how you like to live',
  },
  {
    id: 'fun',
    title: 'Fun Openers',
    description: 'Light questions that invite a real reply',
  },
]

/**
 * Large student / roommate prompt bank.
 * Messages should invite a reply and stay platform-relevant (living together + student life).
 */
export const CONVERSATION_QUESTIONS: ConversationQuestion[] = [
  // ── Housing & move-in ────────────────────────────────────────────────────
  {
    id: 'h-budget',
    category: 'housing',
    label: 'Compare rent budgets',
    build: n =>
      `Hey ${n}! What's your target monthly rent + utilities range? Curious if we're in a similar ballpark.`,
  },
  {
    id: 'h-move-in',
    category: 'housing',
    label: 'Ask about move-in timing',
    build: n =>
      `Hi ${n}! When are you hoping to move in, and how flexible is that date?`,
  },
  {
    id: 'h-lease',
    category: 'housing',
    label: 'Lease length',
    build: n =>
      `Hey ${n}! Are you looking for a full academic year, a shorter stay, or something open-ended?`,
  },
  {
    id: 'h-area',
    category: 'housing',
    label: 'Neighborhood prefs',
    build: n =>
      `Hey ${n}! Which areas are you looking at - closer to campus, more central, or quieter residential?`,
  },
  {
    id: 'h-room',
    category: 'housing',
    label: 'Room vs flat size',
    build: n =>
      `Hi ${n}! Are you mainly after a private room in a shared flat, or open to other setups?`,
  },
  {
    id: 'h-furnished',
    category: 'housing',
    label: 'Furnished or not',
    build: n =>
      `Hey ${n}! Do you need a furnished place, or are you cool bringing / buying some basics?`,
  },
  {
    id: 'h-commute',
    category: 'housing',
    label: 'Commute vs vibe',
    build: n =>
      `Hey ${n}! Would you rather live a bit farther for a nicer place, or stay super close to campus?`,
  },
  {
    id: 'h-viewing',
    category: 'housing',
    label: 'Viewing flats together',
    build: n =>
      `Hi ${n}! Would you be up for viewing a couple of places together once we narrow options?`,
  },
  {
    id: 'h-deposit',
    category: 'housing',
    label: 'Deposit comfort',
    build: n =>
      `Hey ${n}! Just checking practical stuff - are deposits / first-month rent something you're ready for soon?`,
  },
  {
    id: 'h-must-haves',
    category: 'housing',
    label: 'Housing must-haves',
    build: n =>
      `Hey ${n}! Any absolute must-haves for a flat (desk space, natural light, washer, balcony)?`,
  },
  {
    id: 'h-dealbreakers',
    category: 'housing',
    label: 'Housing deal-breakers',
    build: n =>
      `Hi ${n}! Any hard no's for housing - like basement rooms, no kitchen, or super noisy streets?`,
  },
  {
    id: 'h-utilities',
    category: 'housing',
    label: 'Utilities split',
    build: n =>
      `Hey ${n}! How do you usually like splitting utilities - equal split, or based on what each person uses?`,
  },
  {
    id: 'h-search-status',
    category: 'housing',
    label: 'Where they are in the search',
    build: n =>
      `Hey ${n}! How's your housing search going right now - just browsing, or actively applying?`,
  },
  {
    id: 'h-city-compare',
    category: 'housing',
    label: 'Compare city areas',
    build: n =>
      `Hi ${n}! Have you already lived in this city, or is this your first time picking a neighborhood here?`,
  },

  // ── Living together ──────────────────────────────────────────────────────
  {
    id: 'l-sleep',
    category: 'living',
    label: 'Early bird or night owl',
    build: n =>
      `Hey ${n}! Are you more of an early bird or night owl at home?`,
  },
  {
    id: 'l-quiet',
    category: 'living',
    label: 'Quiet hours',
    build: n =>
      `Hi ${n}! Do you usually keep quiet evenings for studying, or is the flat more lively after dinner?`,
  },
  {
    id: 'l-chores',
    category: 'living',
    label: 'Chore style',
    build: n =>
      `Hey ${n}! How do you usually handle kitchen and shared cleaning - a schedule, or more go-with-the-flow?`,
  },
  {
    id: 'l-dishes',
    category: 'living',
    label: 'Dishes timing',
    build: n =>
      `Hey ${n}! Random but important roommate question: same-day dishes, or is next morning fine for you?`,
  },
  {
    id: 'l-kitchen',
    category: 'living',
    label: 'Kitchen habits',
    build: n =>
      `Hi ${n}! Do you cook a lot at home, or are you more of a quick meals / takeout person?`,
  },
  {
    id: 'l-fridge',
    category: 'living',
    label: 'Fridge zones',
    build: n =>
      `Hey ${n}! Would you prefer labeled fridge shelves, or are you chill sharing space more loosely?`,
  },
  {
    id: 'l-feedback',
    category: 'living',
    label: 'How they raise issues',
    build: n =>
      `Hey ${n}! If something small bugs you at home, do you prefer a quick chat or a message?`,
  },
  {
    id: 'l-alone',
    category: 'living',
    label: 'Alone time at home',
    build: n =>
      `Hi ${n}! After a long uni day, do you usually want company in the common area or more alone time?`,
  },
  {
    id: 'l-music',
    category: 'living',
    label: 'Music / noise at home',
    build: n =>
      `Hey ${n}! Speakers in the living room - yay, headphones only, or depends on the day?`,
  },
  {
    id: 'l-temperature',
    category: 'living',
    label: 'Home temperature',
    build: n =>
      `Hey ${n}! Are you usually the "windows open" person or the "keep it warm" person at home?`,
  },
  {
    id: 'l-bathroom',
    category: 'living',
    label: 'Morning bathroom rhythm',
    build: n =>
      `Hi ${n}! Morning rush question - early shower person, or more of a night shower routine?`,
  },
  {
    id: 'l-groceries',
    category: 'living',
    label: 'Shared groceries',
    build: n =>
      `Hey ${n}! For basics like oil, soap, toilet paper - do you like a shared pot or each person buys their own?`,
  },
  {
    id: 'l-weekend',
    category: 'living',
    label: 'Weekend energy at home',
    build: n =>
      `Hey ${n}! What do weekends at home usually look like for you - recovery mode, friends over, or out most of the day?`,
  },
  {
    id: 'l-rules',
    category: 'living',
    label: 'House rules vibe',
    build: n =>
      `Hi ${n}! Do you like a short written house agreement, or keeping things more informal?`,
  },
  {
    id: 'l-plants',
    category: 'living',
    label: 'Decor / plants',
    build: n =>
      `Hey ${n}! Are you into decorating the common space, or do you keep it pretty minimal?`,
  },

  // ── Study & uni ──────────────────────────────────────────────────────────
  {
    id: 's-focus',
    category: 'study',
    label: 'Study vibe at home',
    build: n =>
      `Hey ${n}! Do you study better with quiet evenings or a bit of background buzz?`,
  },
  {
    id: 's-exam',
    category: 'study',
    label: 'Exam season at home',
    build: n =>
      `Hi ${n}! During exam weeks, do you prefer a super quiet flat, or are you still okay with normal life around you?`,
  },
  {
    id: 's-desk',
    category: 'study',
    label: 'Where they study',
    build: n =>
      `Hey ${n}! Do you mostly study in your room, common area, or library / campus?`,
  },
  {
    id: 's-schedule',
    category: 'study',
    label: 'Class schedule rhythm',
    build: n =>
      `Hey ${n}! Are your classes mostly morning-heavy, afternoon, or all over the place this term?`,
  },
  {
    id: 's-group',
    category: 'study',
    label: 'Group projects at home',
    build: n =>
      `Hi ${n}! Do you ever host group project calls at home, or do you usually keep that on campus?`,
  },
  {
    id: 's-major',
    category: 'study',
    label: 'What they study',
    build: n =>
      `Hey ${n}! What are you studying, and how's the workload feeling this semester?`,
  },
  {
    id: 's-year',
    category: 'study',
    label: 'Year / stage',
    build: n =>
      `Hi ${n}! Which year are you in, and is this your first time living with roommates for uni?`,
  },
  {
    id: 's-library',
    category: 'study',
    label: 'Library vs home',
    build: n =>
      `Hey ${n}! Are you more of a library person, or do you get most work done at home?`,
  },
  {
    id: 's-late-nights',
    category: 'study',
    label: 'Late-night study',
    build: n =>
      `Hey ${n}! Ever pull late study nights at home, or do you try to shut it down at a set time?`,
  },
  {
    id: 's-internship',
    category: 'study',
    label: 'Work / internship hours',
    build: n =>
      `Hi ${n}! Alongside uni, do you have a job or internship that shapes your weekly schedule?`,
  },
  {
    id: 's-languages',
    category: 'study',
    label: 'Languages at home',
    build: n =>
      `Hey ${n}! Which languages do you usually speak day to day - curious what feels natural at home?`,
  },
  {
    id: 's-campus',
    category: 'study',
    label: 'Campus hangouts',
    build: n =>
      `Hey ${n}! Favorite campus spot so far for studying or grabbing a quick break?`,
  },

  // ── Guests & social ──────────────────────────────────────────────────────
  {
    id: 'g-friends',
    category: 'social',
    label: 'Friends over',
    build: n =>
      `Hey ${n}! How often do you like having friends over - weekends, rarely, or somewhere in between?`,
  },
  {
    id: 'g-notice',
    category: 'social',
    label: 'Guest notice',
    build: n =>
      `Hi ${n}! For guests, do you like a heads-up in the chat, or are drop-bys usually fine?`,
  },
  {
    id: 'g-overnight',
    category: 'social',
    label: 'Overnight guests',
    build: n =>
      `Hey ${n}! How do you feel about occasional overnight guests - cool with notice, or prefer keeping that rare?`,
  },
  {
    id: 'g-partner',
    category: 'social',
    label: 'Partner stays',
    build: n =>
      `Hey ${n}! Just to be clear early: how often would partner stays feel okay for you in a shared flat?`,
  },
  {
    id: 'g-parties',
    category: 'social',
    label: 'Small gatherings',
    build: n =>
      `Hi ${n}! Small hangouts at home - something you'd enjoy hosting sometimes, or prefer going out instead?`,
  },
  {
    id: 'g-common',
    category: 'social',
    label: 'Common-area vibe',
    build: n =>
      `Hey ${n}! Do you like a social living room, or more of a chill / quiet common space?`,
  },
  {
    id: 'g-alone-social',
    category: 'social',
    label: 'Social battery',
    build: n =>
      `Hey ${n}! After busy social weeks, do you recharge best alone at home or with low-key roommate company?`,
  },
  {
    id: 'g-flatmates',
    category: 'social',
    label: 'Roommate hangouts',
    build: n =>
      `Hi ${n}! Would you be into occasional roommate dinners / movie nights, or keeping social lives more separate?`,
  },
  {
    id: 'g-alcohol',
    category: 'social',
    label: 'Drinks at home',
    build: n =>
      `Hey ${n}! Casual drinks in the common area - totally fine, rare, or not really your thing?`,
  },
  {
    id: 'g-quiet-nights',
    category: 'social',
    label: 'Protect quiet nights',
    build: n =>
      `Hey ${n}! Are there nights you usually want kept quieter (weeknights, before early classes)?`,
  },

  // ── Get to know you ──────────────────────────────────────────────────────
  {
    id: 'k-from',
    category: 'get_to_know',
    label: 'Where they are from',
    build: n =>
      `Hey ${n}! Where are you from originally, and what brought you here for uni?`,
  },
  {
    id: 'k-why',
    category: 'get_to_know',
    label: 'Why this city / uni',
    build: n =>
      `Hi ${n}! What made you choose this uni / city - program, people, or a fresh start?`,
  },
  {
    id: 'k-roommate-exp',
    category: 'get_to_know',
    label: 'Past roommate experience',
    build: n =>
      `Hey ${n}! Have you lived with roommates before, or would this be a first shared-flat setup?`,
  },
  {
    id: 'k-ideal',
    category: 'get_to_know',
    label: 'Ideal roommate vibe',
    build: n =>
      `Hey ${n}! In a few words, what does a good roommate situation look like for you?`,
  },
  {
    id: 'k-stress',
    category: 'get_to_know',
    label: 'How they unwind',
    build: n =>
      `Hi ${n}! When uni gets stressful, what usually helps you unwind at home?`,
  },
  {
    id: 'k-morning',
    category: 'get_to_know',
    label: 'Morning person check',
    build: n =>
      `Hey ${n}! Be honest - how functional are you before coffee / breakfast?`,
  },
  {
    id: 'k-hobbies',
    category: 'get_to_know',
    label: 'Hobbies outside class',
    build: n =>
      `Hey ${n}! Outside of classes, what are you into lately - sports, games, creative stuff, something else?`,
  },
  {
    id: 'k-food',
    category: 'get_to_know',
    label: 'Food preferences',
    build: n =>
      `Hi ${n}! Any food prefs or allergies I should know about if we ever share kitchen space?`,
  },
  {
    id: 'k-travel',
    category: 'get_to_know',
    label: 'Weekend travel',
    build: n =>
      `Hey ${n}! Do you tend to stay in town on weekends, or disappear for trips when you can?`,
  },
  {
    id: 'k-goals',
    category: 'get_to_know',
    label: 'This year goals',
    build: n =>
      `Hey ${n}! What's one thing you're hoping this academic year looks like for you?`,
  },
  {
    id: 'k-pets',
    category: 'get_to_know',
    label: 'Pets',
    build: n =>
      `Hi ${n}! Big pet person, allergic, or somewhere in the middle?`,
  },
  {
    id: 'k-remote',
    category: 'get_to_know',
    label: 'Home vs out',
    build: n =>
      `Hey ${n}! Are you usually home a lot during the week, or out for classes / activities most days?`,
  },
  {
    id: 'k-values',
    category: 'get_to_know',
    label: 'What matters most',
    build: n =>
      `Hey ${n}! For living together, what matters most to you - cleanliness, quiet, communication, or something else?`,
  },
  {
    id: 'k-conflict',
    category: 'get_to_know',
    label: 'Conflict style',
    build: n =>
      `Hi ${n}! If there's a roommate mismatch, do you like clearing it same day or cooling off first?`,
  },
  {
    id: 'k-intro',
    category: 'get_to_know',
    label: 'Simple intro',
    build: n =>
      `Hey ${n}! Excited we matched. Want to swap a quick intro - program, year, and what you're looking for in a flat?`,
  },

  // ── Fun openers (still invite reply + student life) ──────────────────────
  {
    id: 'f-coffee',
    category: 'fun',
    label: 'Coffee or tea',
    build: n =>
      `Hey ${n}! Coffee person, tea person, or neither - crucial roommate intel.`,
  },
  {
    id: 'f-snack',
    category: 'fun',
    label: 'Late-night snack',
    build: n =>
      `Hi ${n}! What's your go-to late-night snack during exam season?`,
  },
  {
    id: 'f-playlist',
    category: 'fun',
    label: 'Cleaning playlist',
    build: n =>
      `Hey ${n}! If we ever do a flat clean day, what playlist energy are we bringing?`,
  },
  {
    id: 'f-movie',
    category: 'fun',
    label: 'Roommate movie night',
    build: n =>
      `Hey ${n}! Hypothetical roommate movie night - comfort rewatch or something new?`,
  },
  {
    id: 'f-cook',
    category: 'fun',
    label: 'Signature dish',
    build: n =>
      `Hi ${n}! Do you have a "I can cook this without thinking" dish?`,
  },
  {
    id: 'f-plant',
    category: 'fun',
    label: 'Plant parent?',
    build: n =>
      `Hey ${n}! Are you secretly a plant person, or do houseplants usually not survive your semester?`,
  },
  {
    id: 'f-alarm',
    category: 'fun',
    label: 'Alarm situation',
    build: n =>
      `Hey ${n}! How many alarms does it take to get you up on a lecture morning?`,
  },
  {
    id: 'f-comfort',
    category: 'fun',
    label: 'Comfort show',
    build: n =>
      `Hi ${n}! What's your comfort show when you need to turn your brain off after uni?`,
  },
  {
    id: 'f-rain',
    category: 'fun',
    label: 'Rainy day plan',
    build: n =>
      `Hey ${n}! Rainy Sunday at the flat - baking, gaming, sleeping, or fleeing to a cafe?`,
  },
  {
    id: 'f-spice',
    category: 'fun',
    label: 'Spice level',
    build: n =>
      `Hey ${n}! Kitchen negotiation starter: how spicy is too spicy for you?`,
  },
  {
    id: 'f-desk',
    category: 'fun',
    label: 'Messy desk honesty',
    build: n =>
      `Hi ${n}! Be honest - is your desk usually organized chaos or actual chaos?`,
  },
  {
    id: 'f-first-week',
    category: 'fun',
    label: 'First-week priority',
    build: n =>
      `Hey ${n}! First week in a new flat - groceries first, or unpacking aesthetics first?`,
  },
  {
    id: 'f-boardgame',
    category: 'fun',
    label: 'Game night?',
    build: n =>
      `Hey ${n}! Would you ever be down for a low-key board game / card night with roommates?`,
  },
  {
    id: 'f-sunrise',
    category: 'fun',
    label: 'Sunrise or sunset',
    build: n =>
      `Hi ${n}! Sunrise person or sunset person - and does that match your actual sleep schedule?`,
  },
  {
    id: 'f-laundry',
    category: 'fun',
    label: 'Laundry procrastination',
    build: n =>
      `Hey ${n}! How long does laundry usually wait in your world before it becomes urgent?`,
  },
  {
    id: 'f-hot-take',
    category: 'fun',
    label: 'Student hot take',
    build: n =>
      `Hey ${n}! Hot take for student life: library or cafe for deep work - which team are you on?`,
  },
  {
    id: 'f-budget-fun',
    category: 'fun',
    label: 'Student budget wins',
    build: n =>
      `Hi ${n}! Best student-budget life hack you've found so far in this city?`,
  },
  {
    id: 'f-welcome',
    category: 'fun',
    label: 'Friendly hello',
    build: n =>
      `Hey ${n}! Domu Match brought us here - how's your week looking, and how's the flat hunt going?`,
  },
]

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

/** Deterministic icebreaker for mutual-match notification metadata (no AI). */
export function pickMutualMatchIcebreaker(partnerName?: string | null, seed?: string): string {
  const name = partnerFirstName(partnerName)
  let index = 0
  if (seed && seed.length > 0) {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
    }
    index = hash % CONVERSATION_QUESTIONS.length
  } else {
    index = Math.floor(Math.random() * CONVERSATION_QUESTIONS.length)
  }
  return CONVERSATION_QUESTIONS[index]!.build(name)
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
  return chips
    .filter(c => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
    .slice(0, 4)
}

/** True random pick from the full conversation question bank. */
export function randomIcebreaker(partnerName?: string | null): string {
  const name = partnerFirstName(partnerName)
  const index = Math.floor(Math.random() * CONVERSATION_QUESTIONS.length)
  return CONVERSATION_QUESTIONS[index]!.build(name)
}

export function questionsForCategory(category: PromptCategoryId): ConversationQuestion[] {
  return CONVERSATION_QUESTIONS.filter(q => q.category === category)
}

export function formatConversationQuestion(
  question: ConversationQuestion,
  partnerName?: string | null,
): string {
  return question.build(partnerFirstName(partnerName))
}

/** @deprecated Prefer browse + random via the + menu. Kept for any leftover callers. */
export function attachMenuPrompts(partnerName?: string | null): PromptChip[] {
  const name = partnerFirstName(partnerName)
  return CONVERSATION_QUESTIONS.slice(0, 8).map(q => ({
    id: q.id,
    label: q.label,
    message: q.build(name),
  }))
}

export function nudgeBioMessage(partnerName?: string | null): string {
  const name = partnerFirstName(partnerName)
  return `Hey ${name}! I'd love to know a bit more about you. Mind adding a short bio when you get a chance?`
}

export function nudgeHousingMessage(partnerName?: string | null): string {
  const name = partnerFirstName(partnerName)
  return `Hey ${name}! Curious about your housing prefs. Mind filling those out so we can compare notes?`
}
