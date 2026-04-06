import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createServiceClient } from '@/lib/supabase/service'

/** Vercel Hobby caps server routes at ~10s; Pro can raise this in dashboard if needed. */
export const maxDuration = 10

const GEMINI_MODEL = 'gemini-2.5-flash' as const
/** 350 was too small for 2.5 + Google Search: answers hit MAX_TOKENS mid-sentence. */
const MAX_OUTPUT_TOKENS = 2048
const GEMINI_TIMEOUT_MS = 9000

/** Max number of prior messages to send as context (user + assistant pairs). */
const MAX_HISTORY_MESSAGES = 20

type HistoryEntry = { role: 'user' | 'assistant'; text: string }

function buildContents(history: HistoryEntry[], currentMessage: string): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
  const trimmed = history.slice(-MAX_HISTORY_MESSAGES)
  for (const entry of trimmed) {
    const role = entry.role === 'assistant' ? 'model' : 'user'
    contents.push({ role, parts: [{ text: entry.text }] })
  }
  contents.push({ role: 'user', parts: [{ text: currentMessage }] })
  return contents
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const message = (body?.message ?? '').trim()
    const rawHistory = body?.history
    const history: HistoryEntry[] = Array.isArray(rawHistory)
      ? rawHistory
          .filter((m: unknown) => m && typeof m === 'object' && 'role' in m && 'text' in m)
          .map((m: { role: string; text: string }) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            text: String(m.text ?? '').trim()
          }))
          .filter((m: HistoryEntry) => m.text.length > 0)
      : []

    if (!message) {
      return NextResponse.json({ reply: 'Please send a non-empty message.' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
    if (!apiKey) {
      console.error('[Domu AI] Missing GEMINI_API_KEY / GOOGLE_API_KEY.')
      return NextResponse.json(
        {
          reply:
            "I’m temporarily unavailable due to a configuration issue. Please try again later or contact support if this keeps happening.",
        },
        { status: 503 },
      )
    }

    const contents = buildContents(history, message)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

    const ai = new GoogleGenAI({ apiKey })
    let response
    try {
      response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          tools: [{ googleSearch: {} }],
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          // 2.5 models use "thinking" by default; it competes with visible output under maxOutputTokens.
          thinkingConfig: { thinkingBudget: 0 },
          abortSignal: controller.signal,
        },
      })
    } finally {
      clearTimeout(timeoutId)
    }

    const reply = response.text ?? "I couldn't generate a response."

    // Save to Supabase (best-effort, don't block)
    try {
      const supabase = createServiceClient()
      await supabase.from('domu_ai_chat_log').insert({
        user_message: message,
        assistant_reply: reply
      })
    } catch {
      // Ignore Supabase errors
    }

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[Domu AI] Chat error', err)

    const raw = err instanceof Error ? err.message : String(err)
    const name = err instanceof Error ? err.name : ''
    let reply =
      'Sorry, something went wrong on my side. Please try again in a moment.'

    if (name === 'AbortError' || /aborted|timeout|deadline|DEADLINE_EXCEEDED|504/i.test(raw)) {
      return NextResponse.json({
        reply:
          'That took too long to answer. Please try again with a shorter question, or try again in a moment.',
      })
    }

    // Rate limits / overload
    if (raw && (raw.includes('quota') || raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED'))) {
      reply = "I’m getting a lot of requests right now and need a short break. Please try again in a minute."
    }

    // For all other errors, keep the reply generic and user-friendly.
    return NextResponse.json({ reply }, { status: 500 })
  }
}
