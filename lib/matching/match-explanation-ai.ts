import { GoogleGenAI } from '@google/genai'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Cost-focused model; keep in sync with Domu chat + Python API. */
export const GEMINI_FLASH_MODEL = 'gemini-1.5-flash' as const

export const GEMINI_MAX_OUTPUT_TOKENS = 350

/** Leave headroom under Vercel Hobby ~10s limit after RPC + DB. */
const GEMINI_REQUEST_MS = 8000

/** Lexicographic order on normalized IDs so cache keys match across clients. */
export function canonicalUserPair(userA: string, userB: string): [string, string] {
  const a = userA.toLowerCase()
  const b = userB.toLowerCase()
  return a < b ? [a, b] : [b, a]
}

export async function getCachedMatchExplanation(
  admin: SupabaseClient,
  userLow: string,
  userHigh: string
): Promise<string | null> {
  const { data, error } = await admin
    .from('match_pair_ai_explanations')
    .select('explanation_text')
    .eq('user_low_id', userLow)
    .eq('user_high_id', userHigh)
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
  explanationText: string
): Promise<void> {
  const trimmed = explanationText.trim()
  if (!trimmed) return

  const { error } = await admin.from('match_pair_ai_explanations').upsert(
    {
      user_low_id: userLow,
      user_high_id: userHigh,
      explanation_text: trimmed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_low_id,user_high_id' }
  )

  if (error) {
    console.warn('[match-explanation-ai] Failed to cache explanation', error.message)
  }
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
}

function buildMatchExplanationPrompt(score: ScoreRow): string {
  const n = (v: unknown) => (typeof v === 'number' && !Number.isNaN(v) ? v : null)
  const s = (v: unknown, max = 400) => {
    const t = v == null ? '' : String(v).trim()
    return t.length > max ? `${t.slice(0, max)}…` : t
  }

  return `You are a roommate matching assistant. Write a brief, friendly explanation (at most 120 words) for the reader ("you") about compatibility with a potential roommate ("they"), based ONLY on the summary below. Do not invent specific habits, schedules, or facts not implied by the data. Plain text only, no markdown headings or bullet labels.

Summary:
- Overall compatibility (0–1): ${n(score.compatibility_score) ?? 'n/a'}
- Harmony: ${n(score.harmony_score) ?? 'n/a'}, Context: ${n(score.context_score) ?? 'n/a'}
- Personality: ${n(score.personality_score) ?? 'n/a'}, Schedule: ${n(score.schedule_score) ?? 'n/a'}, Lifestyle: ${n(score.lifestyle_score) ?? 'n/a'}, Social: ${n(score.social_score) ?? 'n/a'}
- Strengths: ${s(score.top_alignment) || 'not specified'}
- Watch outs: ${s(score.watch_out) || 'none noted'}
- House rules hint: ${s(score.house_rules_suggestion) || 'none'}`
}

/**
 * Calls Gemini for a short match blurb. Returns null on failure (caller should use template fallback).
 */
export async function generateMatchExplanationWithGemini(score: ScoreRow): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
  if (!apiKey) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), GEMINI_REQUEST_MS)

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: [{ role: 'user', parts: [{ text: buildMatchExplanationPrompt(score) }] }],
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
