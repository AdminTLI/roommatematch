import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createServiceClient } from '@/lib/supabase/service'

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const message = (body?.message ?? '').trim()

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

    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: message,
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 2048
      }
    })

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
    let reply =
      'Sorry, something went wrong on my side. Please try again in a moment.'

    // Rate limits / overload
    if (raw && (raw.includes('quota') || raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED'))) {
      reply = "I’m getting a lot of requests right now and need a short break. Please try again in a minute."
    }

    // For all other errors, keep the reply generic and user-friendly.
    return NextResponse.json({ reply }, { status: 500 })
  }
}
