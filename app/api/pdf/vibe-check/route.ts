import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { z } from 'zod'
import { renderPdf } from '@/lib/pdf/render-pdf'
import { pdfQueue } from '@/lib/pdf/queue'
import { generateVibeCheckPassportHtml } from '@/lib/pdf/templates/vibe-check-passport'
import { calculateArchetype } from '@/lib/vibe-check/archetype'
import { VIBE_CHECK_QUESTIONS } from '@/lib/vibe-check/questions'
import {
  checkRateLimit,
  getClientIp,
  getIPRateLimitKey,
  buildRateLimitHeaders,
} from '@/lib/rate-limit'
import { safeLogger } from '@/lib/utils/logger'

export const runtime = 'nodejs'

const BodySchema = z.object({
  university: z.string().min(1).max(200),
  city: z.string().min(1).max(80),
  answers: z.record(z.string(), z.number().int().min(1).max(5)),
  matchCount: z.number().int().min(0).max(1_000_000).optional(),
  lifestyleFitPercent: z.number().int().min(0).max(100).optional(),
})

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`PDF timeout after ${ms}ms`)), ms)
    promise
      .then((v) => {
        clearTimeout(timer)
        resolve(v)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

function buildVerificationId(answers: Record<string, number>, city: string): string {
  const payload = JSON.stringify({ answers, city, salt: randomBytes(4).toString('hex') })
  const hash = createHash('sha256').update(payload).digest('hex').slice(0, 8).toUpperCase()
  return `DOMU-VC-${hash}`
}

export async function POST(req: NextRequest) {
  try {
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      const ip = getClientIp(req)
      const rateLimitResult = await checkRateLimit(
        'pdf_generation',
        getIPRateLimitKey('pdf_generation', ip)
      )
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: buildRateLimitHeaders(5, rateLimitResult),
          }
        )
      }
    }

    const json = await req.json().catch(() => null)
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { university, city, answers, matchCount = 10, lifestyleFitPercent = 60 } = parsed.data

    const missing = VIBE_CHECK_QUESTIONS.filter((q) => typeof answers[q.id] !== 'number')
    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'Incomplete answers', missing: missing.map((q) => q.id) },
        { status: 400 }
      )
    }

    if (pdfQueue.isFull()) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    await pdfQueue.acquire()

    try {
      const archetype = calculateArchetype(answers)
      const verificationId = buildVerificationId(answers, city)
      const generatedAt = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://www.domumatch.com'

      const html = generateVibeCheckPassportHtml({
        university,
        city,
        archetype,
        matchCount,
        lifestyleFitPercent,
        generatedAt,
        verificationId,
        appUrl,
      })

      const pdfBuffer = await withTimeout(renderPdf(html, { timeoutMs: 45000 }), 50000)

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Domu-Match-Vibe-Passport-${verificationId}.pdf"`,
          'Cache-Control': 'no-store',
        },
      })
    } finally {
      pdfQueue.release()
    }
  } catch (err) {
    safeLogger.error('[api/pdf/vibe-check] failed', err)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
