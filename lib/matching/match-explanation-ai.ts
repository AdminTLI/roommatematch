import { GoogleGenAI } from '@google/genai'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getGeminiModel } from '@/lib/gemini-model'

/** Room for structured coach guide + safety margin under Hobby function budget. */
export const GEMINI_MAX_OUTPUT_TOKENS = 720

/** Leave headroom under Vercel Hobby ~10s limit after RPC + DB. */
const GEMINI_REQUEST_MS = 8000

const DIMENSION_LABELS: Record<string, string> = {
  cleanliness: 'Cleanliness',
  noise: 'Noise tolerance',
  guests: 'Guest frequency',
  sleep: 'Sleep schedule',
  shared_spaces: 'Shared spaces',
  substances: 'Substances',
  study_social: 'Study/social balance',
  home_vibe: 'Home vibe',
}

/** Lexicographic order on normalized IDs so cache keys match across clients. */
export function canonicalUserPair(userA: string, userB: string): [string, string] {
  const a = userA.toLowerCase()
  const b = userB.toLowerCase()
  return a < b ? [a, b] : [b, a]
}

/**
 * True when text follows the v2 coach Markdown shape (three fixed section headers).
 * Used to ignore legacy cached blurbs so users get the new format without a DB migration.
 */
/** Cached coach text must match structure and must not contain bracket-style placeholders in the icebreaker. */
export function isMatchInsightCoachFormat(text: string): boolean {
  const t = text.trim()
  if (
    !t.includes('**🌟 Why you') ||
    !t.includes('**🗣️ Things to chat about before moving in:**') ||
    !t.includes('**💬 Suggested Icebreaker:**')
  ) {
    return false
  }
  if (hasIcebreakerPlaceholderArtifact(t)) return false
  return true
}

function hasIcebreakerPlaceholderArtifact(text: string): boolean {
  const iceIdx = text.indexOf('**💬 Suggested Icebreaker:**')
  const slice = iceIdx >= 0 ? text.slice(iceIdx) : text
  if (/\[[^\]\n]{0,120}\]/.test(slice)) return true
  if (/\btrait from profile\b/i.test(slice)) return true
  if (/\bTBD\b/i.test(slice)) return true
  if (/\bfill in\b/i.test(slice)) return true
  if (/\bplaceholder\b/i.test(slice)) return true
  return false
}

export async function getCachedMatchExplanation(
  admin: SupabaseClient,
  userLow: string,
  userHigh: string,
  readerUserId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from('match_pair_ai_explanations')
    .select('explanation_text')
    .eq('user_low_id', userLow)
    .eq('user_high_id', userHigh)
    .eq('reader_user_id', readerUserId)
    .maybeSingle()

  if (error || !data?.explanation_text?.trim()) {
    return null
  }
  return data.explanation_text.trim()
}

export async function saveCachedMatchExplanation(
  admin: SupabaseClient,
  userLow: string,
  userHigh: string,
  readerUserId: string,
  explanationText: string,
): Promise<void> {
  const trimmed = explanationText.trim()
  if (!trimmed) return

  const { error } = await admin.from('match_pair_ai_explanations').upsert(
    {
      user_low_id: userLow,
      user_high_id: userHigh,
      reader_user_id: readerUserId,
      explanation_text: trimmed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_low_id,user_high_id,reader_user_id' },
  )

  if (error) {
    console.warn('[match-explanation-ai] Failed to cache explanation', error.message)
  }
}

export type MatchExplanationAudience = {
  viewerUserType: 'student' | 'professional' | null
  roommateUserType: 'student' | 'professional' | null
}

/** Optional profile tags for the icebreaker when questionnaire dimensions are not enough on their own. */
export type MatchIcebreakerSocialHints = {
  viewer_interests: string[]
  roommate_interests: string[]
  shared_interests: string[]
  viewer_bio_snippet: string | null
  roommate_bio_snippet: string | null
}

type ScoreRow = {
  compatibility_score?: unknown
  harmony_score?: unknown
  context_score?: unknown
  personality_score?: unknown
  schedule_score?: unknown
  lifestyle_score?: unknown
  social_score?: unknown
  academic_bonus?: unknown
  top_alignment?: unknown
  watch_out?: unknown
  house_rules_suggestion?: unknown
  dimension_scores_json?: unknown
}

function n(v: unknown): number | null {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  return null
}

function s(v: unknown, max = 400): string {
  const t = v == null ? '' : String(v).trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}

/** Collapse digits the model must not echo (decimals, percentages). */
function scrubNumericTokens(text: string): string {
  return text
    .replace(/\d+\.\d+/g, ' ')
    .replace(/\b\d{1,3}\s*%\b/gi, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function normalize01(x: number): number {
  if (x > 1) return Math.min(1, x / 100)
  return Math.min(1, Math.max(0, x))
}

/** Qualitative band for model input only (never shown verbatim to users by this layer). */
function alignmentBand01(raw: unknown): string {
  const v = n(raw)
  if (v == null) return 'unclear from data'
  const u = normalize01(v)
  if (u >= 0.78) return 'very strong alignment'
  if (u >= 0.64) return 'strong alignment'
  if (u >= 0.52) return 'moderate alignment'
  if (u >= 0.4) return 'mixed alignment'
  return 'meaningful differences'
}

function formatDimensionsQualitative(raw: unknown): string {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return '- (No per-dimension breakdown was provided.)'
  }
  const entries = Object.entries(raw as Record<string, unknown>)
    .filter(([, v]) => typeof v === 'number' && !Number.isNaN(v))
    .sort(([a], [b]) => a.localeCompare(b))

  if (entries.length === 0) {
    return '- (No per-dimension breakdown was provided.)'
  }

  return entries
    .map(([key, v]) => {
      const label = DIMENSION_LABELS[key] || key.replace(/_/g, ' ')
      return `- ${label}: ${alignmentBand01(v)}`
    })
    .join('\n')
}

function dimensionRankedLabels(raw: unknown, order: 'asc' | 'desc', take: number): string[] {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return []
  const entries = Object.entries(raw as Record<string, unknown>)
    .filter(([, v]) => typeof v === 'number' && !Number.isNaN(v))
    .map(([k, v]) => ({ k, u: normalize01(v as number) }))

  entries.sort((a, b) => (order === 'asc' ? a.u - b.u : b.u - a.u))
  return entries.slice(0, take).map(e => DIMENSION_LABELS[e.k] || e.k.replace(/_/g, ' '))
}

function toneInstructions(audience: MatchExplanationAudience): string {
  const v = audience.viewerUserType
  const r = audience.roommateUserType
  const pair =
    v === 'professional' && r === 'professional'
      ? 'You are writing for a young professional roommate searching for another young professional.'
      : v === 'student' && r === 'student'
        ? 'You are writing for a student roommate searching for another student.'
        : 'You are writing for a roommate searcher; the other person may be a student or a young professional.'

  if (v === 'professional') {
    return `${pair} Use a concise, professional tone: clear sentences, no slang, workplace-adjacent examples (e.g. early meetings, hybrid work routines) where helpful.`
  }
  if (v === 'student') {
    return `${pair} Use a friendly, student-appropriate tone: warm and direct, with campus or flat-share examples (e.g. exam weeks, shared kitchen at peak times) where helpful.`
  }
  return `${pair} Use a balanced, approachable tone and everyday shared-housing examples.`
}

function buildMatchInsightSystemInstruction(audience: MatchExplanationAudience): string {
  return `You write short coach-style roommate guidance for Domu Match.

${toneInstructions(audience)}

Output rules (strict):
1) Return Markdown ONLY, using exactly these three section headings in this order (copy them character-for-character, including emojis):
**🌟 Why you'll live well together:**
**🗣️ Things to chat about before moving in:**
**💬 Suggested Icebreaker:**

2) Under the first heading, write exactly 3 bullet lines. Each line must start with "* " (asterisk + single space).

3) Under the second heading, write exactly 2 bullet lines. Each line must start with "* ". Frame these as normal roommate planning topics, especially around exam weeks or other high-stress periods. Never shame anyone.

4) Under the third heading, write exactly 1 bullet line starting with "* ". That bullet must contain one casual message in double quotes that the reader could copy and paste into chat. The message must reference at least one plausible shared trait or overlap (use only what the data suggests). The quoted line must be finished, natural text only. Never use square brackets as placeholders. Never output template fragments like "[shared interest]", "trait from profile", "TBD", or "e.g. ... inside brackets". If hobby tags are missing in the data, anchor the icebreaker on a concrete shared lifestyle theme from the dimension lines (sleep, noise, guests, study vs social, home vibe, and so on) using plain words.

5) NEVER output decimals, percentages, scores, "0.73", "88%", "Harmony score", "Context score", or any raw algorithmic numbers. Translate everything into plain, human language.

6) NEVER use the phrases: "low score", "bad match", "incompatible". Prefer "things to chat about", "where you differ", "worth aligning on", or "a small trade-off to plan for".

7) Use positive, practical examples (e.g. late nights vs early lectures, Sunday kitchen timing) so the advice feels grounded and kind.

8) Do not use em dashes (Unicode U+2014). Use commas, parentheses, or a normal hyphen (-) instead.

9) Use normal single spaces only (no double spaces). Keep lines tight and scannable.

10) Do not add any extra sections, preambles, or closing disclaimers beyond the three headings above.`
}

function formatInterestList(tags: string[], emptyLabel: string): string {
  if (!tags.length) return emptyLabel
  return tags.join('; ')
}

function formatSocialHintsBlock(hints: MatchIcebreakerSocialHints, strongest: string[]): string {
  const themeFallback =
    strongest.length > 0
      ? `If hobby tags are empty on both sides, anchor the icebreaker on these shared questionnaire themes using everyday wording (no brackets): ${strongest.join(', ')}.`
      : 'If hobby tags are empty, anchor the icebreaker on any clear overlap from the dimension lines above using everyday wording (no brackets).'

  return `Social profile tags (optional; never invent tags that are not listed here; never echo this heading in your output):
- Shared hobby tags: ${formatInterestList(hints.shared_interests, '(none listed)')}
- Your (reader) hobby tags: ${formatInterestList(hints.viewer_interests, '(none listed)')}
- Their hobby tags: ${formatInterestList(hints.roommate_interests, '(none listed)')}
- Short reader bio (may be empty): ${hints.viewer_bio_snippet || '(none)'}
- Short roommate bio (may be empty): ${hints.roommate_bio_snippet || '(none)'}

${themeFallback}`
}

function buildMatchInsightUserPayload(score: ScoreRow, socialHints: MatchIcebreakerSocialHints): string {
  const dimBlock = formatDimensionsQualitative(score.dimension_scores_json)
  const weakest = dimensionRankedLabels(score.dimension_scores_json, 'asc', 2)
  const strongest = dimensionRankedLabels(score.dimension_scores_json, 'desc', 3)

  const top = scrubNumericTokens(s(score.top_alignment) || '')
  const watch = scrubNumericTokens(s(score.watch_out) || '')
  const house = scrubNumericTokens(s(score.house_rules_suggestion) || '')

  const legacyBits = [
    n(score.personality_score) != null ? `personality-style fit: ${alignmentBand01(score.personality_score)}` : null,
    n(score.schedule_score) != null ? `schedule rhythm fit: ${alignmentBand01(score.schedule_score)}` : null,
    n(score.lifestyle_score) != null ? `lifestyle fit: ${alignmentBand01(score.lifestyle_score)}` : null,
    n(score.social_score) != null ? `social energy fit: ${alignmentBand01(score.social_score)}` : null,
    n(score.academic_bonus) != null ? `academic-path bonus signal: ${alignmentBand01(score.academic_bonus)}` : null,
  ].filter(Boolean)

  return `Use ONLY the qualitative signals below. Do not invent private facts about real people.

Pairing summary (qualitative, for you only):
- Overall pairing: ${alignmentBand01(score.compatibility_score)}
- Day-to-day living fit: ${alignmentBand01(score.harmony_score)}
- Life-path timing fit: ${alignmentBand01(score.context_score)}
${legacyBits.length ? `- Extra questionnaire sections: ${legacyBits.join('; ')}` : ''}

Eight lifestyle dimensions (each line is alignment strength on that topic, not a number):
${dimBlock}

Strongest topic areas to celebrate (by label): ${strongest.length ? strongest.join(', ') : 'infer kindly from the dimension lines'}.
Most useful planning topics if routines differ (by label): ${weakest.length ? weakest.join(', ') : 'infer kindly from the dimension lines'}.

Algorithm hints (may be empty; never quote digits from here; use only as themes):
- Likely strengths: ${top || 'not specified'}
- Gentle watch-outs: ${watch || 'none noted'}
- House-rules nudge: ${house || 'none'}

${formatSocialHintsBlock(socialHints, strongest)}

Write the final Markdown coach guide now.`
}

/**
 * Calls Gemini for a match narrative. Returns null on failure (caller should use template fallback).
 */
const EMPTY_SOCIAL_HINTS: MatchIcebreakerSocialHints = {
  viewer_interests: [],
  roommate_interests: [],
  shared_interests: [],
  viewer_bio_snippet: null,
  roommate_bio_snippet: null,
}

/** Loads interests and short bio snippets for icebreakers (best-effort). */
export async function fetchMatchIcebreakerSocialHints(
  admin: SupabaseClient,
  viewerUserId: string,
  roommateUserId: string,
): Promise<MatchIcebreakerSocialHints> {
  const empty = (): MatchIcebreakerSocialHints => ({
    viewer_interests: [],
    roommate_interests: [],
    shared_interests: [],
    viewer_bio_snippet: null,
    roommate_bio_snippet: null,
  })

  function normalizeInterestArray(raw: unknown): string[] {
    if (!Array.isArray(raw)) return []
    const out = raw
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map(x => x.trim())
    return [...new Set(out)].slice(0, 15)
  }

  function bioSnippet(bio: unknown): string | null {
    if (typeof bio !== 'string') return null
    const one = bio.replace(/\s+/g, ' ').replace(/[\[\]]/g, '').trim()
    if (!one) return null
    return one.length > 160 ? `${one.slice(0, 157)}…` : one
  }

  try {
    const { data, error } = await admin
      .from('profiles')
      .select('user_id, interests, bio')
      .in('user_id', [viewerUserId, roommateUserId])

    if (error || !data?.length) return empty()

    const vRow = data.find(r => r.user_id === viewerUserId)
    const rRow = data.find(r => r.user_id === roommateUserId)

    const viewer_interests = normalizeInterestArray(vRow?.interests)
    const roommate_interests = normalizeInterestArray(rRow?.interests)
    const shared_interests = viewer_interests.filter(t => roommate_interests.includes(t))

    return {
      viewer_interests,
      roommate_interests,
      shared_interests,
      viewer_bio_snippet: bioSnippet(vRow?.bio),
      roommate_bio_snippet: bioSnippet(rRow?.bio),
    }
  } catch {
    return empty()
  }
}

export async function generateMatchExplanationWithGemini(
  score: ScoreRow,
  audience: MatchExplanationAudience,
  socialHints: MatchIcebreakerSocialHints = EMPTY_SOCIAL_HINTS,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
  if (!apiKey) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), GEMINI_REQUEST_MS)

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: [{ role: 'user', parts: [{ text: buildMatchInsightUserPayload(score, socialHints) }] }],
      config: {
        systemInstruction: buildMatchInsightSystemInstruction(audience),
        maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
        thinkingConfig: { thinkingBudget: 0 },
        abortSignal: controller.signal,
      },
    })

    const text = response.text?.trim()
    return text && text.length > 0 ? text : null
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[match-explanation-ai] Gemini error:', msg)
    return null
  } finally {
    clearTimeout(timeout)
  }
}
