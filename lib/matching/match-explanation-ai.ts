import { GoogleGenAI } from '@google/genai'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getGeminiModel } from '@/lib/gemini-model'

/** Room for ~200 words + safety margin under Hobby function budget. */
export const GEMINI_MAX_OUTPUT_TOKENS = 520

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

export async function getCachedMatchExplanation(
  admin: SupabaseClient,
  userLow: string,
  userHigh: string,
  readerUserId: string
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
  explanationText: string
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
    { onConflict: 'user_low_id,user_high_id,reader_user_id' }
  )

  if (error) {
    console.warn('[match-explanation-ai] Failed to cache explanation', error.message)
  }
}

export type MatchExplanationAudience = {
  viewerUserType: 'student' | 'professional' | null
  roommateUserType: 'student' | 'professional' | null
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

function pct01(v: unknown): string {
  const x = n(v)
  if (x == null) return 'n/a'
  const p = x <= 1 ? Math.round(x * 100) : Math.round(x)
  return `${Math.min(100, Math.max(0, p))}%`
}

function formatDimensionsJson(raw: unknown): string {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return 'none provided'
  }
  const entries = Object.entries(raw as Record<string, unknown>)
    .filter(([, v]) => typeof v === 'number' && !Number.isNaN(v))
    .sort(([a], [b]) => a.localeCompare(b))

  if (entries.length === 0) return 'none provided'

  return entries
    .map(([key, v]) => {
      const label = DIMENSION_LABELS[key] || key.replace(/_/g, ' ')
      return `- ${label}: ${pct01(v)} aligned`
    })
    .join('\n')
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

function buildMatchExplanationPrompt(score: ScoreRow, audience: MatchExplanationAudience): string {
  const dimBlock = formatDimensionsJson(score.dimension_scores_json)

  return `You are a roommate matching assistant. Write ONE cohesive explanation (plain text only, no markdown, no bullet labels like "Harmony:") for the reader ("you") about living with this potential roommate ("they").

${toneInstructions(audience)}

Hard requirements:
- Length: about 160–220 words.
- You MUST explicitly reflect: overall match, Harmony (${pct01(score.harmony_score)}), Context (${pct01(score.context_score)}), and EVERY dimension line listed below — weave them into natural sentences (do not skip any line).
- If Harmony or Context is high, say why that usually helps day-to-day; if low, name the trade-off constructively (no shaming).
- Include 1–2 short real-life vignettes (e.g. Sunday evening kitchen, guest staying over, late-night study vs early lectures) that illustrate strengths or friction — only as plausible examples tied to the scores, not invented private facts.
- Do not claim you know their exact habits; frame as "this suggests" / "you might find".
- Reference algorithm hints only if useful: strengths: ${s(score.top_alignment) || 'not specified'}; watch outs: ${s(score.watch_out) || 'none noted'}; house rules hint: ${s(score.house_rules_suggestion) || 'none'}.

Numeric summary (0–1 scale unless noted):
- Overall compatibility: ${n(score.compatibility_score) ?? 'n/a'}
- Harmony: ${n(score.harmony_score) ?? 'n/a'}, Context: ${n(score.context_score) ?? 'n/a'}
- Legacy sections (if present): Personality ${n(score.personality_score) ?? 'n/a'}, Schedule ${n(score.schedule_score) ?? 'n/a'}, Lifestyle ${n(
    score.lifestyle_score
  ) ?? 'n/a'}, Social ${n(score.social_score) ?? 'n/a'}, Academic bonus ${n(score.academic_bonus) ?? 'n/a'}

Eight lifestyle dimensions (each must appear in your text in some form):
${dimBlock}`
}

/**
 * Calls Gemini for a match narrative. Returns null on failure (caller should use template fallback).
 */
export async function generateMatchExplanationWithGemini(
  score: ScoreRow,
  audience: MatchExplanationAudience
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
  if (!apiKey) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), GEMINI_REQUEST_MS)

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: [{ role: 'user', parts: [{ text: buildMatchExplanationPrompt(score, audience) }] }],
      config: {
        maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
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
