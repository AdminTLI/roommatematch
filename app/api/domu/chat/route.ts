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
      return NextResponse.json(
        { reply: 'Server error: GEMINI_API_KEY not configured.' },
        { status: 500 }
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
    const raw = err instanceof Error ? err.message : String(err)
    // Parse Gemini API error and return user-friendly message
    let reply = 'Sorry, something went wrong. Please try again.'
    if (raw.includes('quota') || raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
      reply =
        "I've hit my rate limit for now. Please try again in a minute, or check your Gemini API quota and billing at https://ai.google.dev/gemini-api/docs/rate-limits"
    } else {
      try {
        const parsed = JSON.parse(raw)
        const apiErr = parsed?.error
        if (typeof apiErr?.message === 'string') {
          reply = apiErr.message.split('\n')[0].slice(0, 300) ?? reply
        }
      } catch {
        if (raw && !raw.startsWith('{') && raw.length < 300) reply = raw
      }
    }
    return NextResponse.json({ reply }, { status: 500 })
  }
}
