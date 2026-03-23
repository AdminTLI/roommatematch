import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOnboardingAgreementHtml, buildOnboardingPdfSections } from '@/lib/pdf/generate-onboarding-html'
import { renderPdf } from '@/lib/pdf/render-pdf'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { pdfQueue } from '@/lib/pdf/queue'
import { safeLogger } from '@/lib/utils/logger'
import itemsJson from '@/data/item-bank.v1.json'
import type { Item } from '@/types/questionnaire'
import type { SectionKey } from '@/types/questionnaire'

// Ensure this route always runs in a Node.js runtime (required for Puppeteer)
export const runtime = 'nodejs'

type OnboardingPdfRequestBody = {
  sections?: Record<SectionKey, Record<string, { value: any; dealBreaker?: boolean }>>
}

const sectionMeta: Record<SectionKey, { title: string; whyItMatters: string }> = {
  'location-commute': {
    title: 'Location & Commute',
    whyItMatters:
      'Ensures you find housing in convenient areas that match your lifestyle and daily routine.',
  },
  'personality-values': {
    title: 'Personality & Values',
    whyItMatters:
      'Helps match you with compatible roommates who share similar approaches to life and living together.',
  },
  'sleep-circadian': {
    title: 'Sleep & Circadian Rhythms',
    whyItMatters:
      'Critical for avoiding conflicts around noise levels and establishing mutually respectful schedules.',
  },
  'noise-sensory': {
    title: 'Noise & Sensory Preferences',
    whyItMatters:
      'Ensures comfort in shared spaces by aligning environmental preferences and sensitivities.',
  },
  'home-operations': {
    title: 'Home Operations',
    whyItMatters:
      'Establishes clear expectations for maintaining shared spaces and preventing common roommate conflicts.',
  },
  'social-hosting-language': {
    title: 'Social Life & Hosting',
    whyItMatters: 'Sets boundaries for social activities and creates a comfortable home environment for all.',
  },
  'communication-conflict': {
    title: 'Communication & Conflict Resolution',
    whyItMatters: 'Foundation for healthy roommate relationships and addressing issues constructively.',
  },
  'privacy-territoriality': {
    title: 'Privacy & Boundaries',
    whyItMatters:
      'Respects individual privacy needs while fostering a comfortable shared living arrangement.',
  },
  'reliability-logistics': {
    title: 'Reliability & Logistics',
    whyItMatters: 'Ensures all roommates are dependable and aligned on practical living requirements.',
  },
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`PDF generation timeout after ${ms / 1000} seconds`))
    }, ms)

    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as OnboardingPdfRequestBody

    const isProduction = process.env.NODE_ENV === 'production'
    const rateLimitResult = isProduction
      ? await checkRateLimit('pdf_generation', getUserRateLimitKey('pdf_generation', user.id))
      : { allowed: true, remaining: 5, resetTime: Date.now() + 60 * 60 * 1000, totalHits: 0 }

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Check if queue is full
    if (pdfQueue.isFull()) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    // Acquire queue slot (waits if max concurrent reached)
    await pdfQueue.acquire()

    try {
      // Set timeout: kill Puppeteer after 30 seconds
      const timeoutPromise = withTimeout(
        (async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('user_id', user.id)
            .maybeSingle()

          const studentName =
            profile?.first_name || (user.email ? user.email.split('@')[0] : 'Your profile')

          let onboardingSections = body.sections
          if (!onboardingSections) {
            const { data: dbSections, error: sectionsError } = await supabase
              .from('onboarding_sections')
              .select('section, answers')
              .eq('user_id', user.id)

            if (sectionsError) {
              throw new Error(`Failed to load saved onboarding sections: ${sectionsError.message}`)
            }

            onboardingSections = (dbSections ?? []).reduce<Record<string, Record<string, { value: any; dealBreaker?: boolean }>>>(
              (acc, row) => {
                const sectionKey = row.section
                if (typeof sectionKey !== 'string' || !Array.isArray(row.answers)) return acc

                const normalizedAnswers = row.answers.reduce<Record<string, { value: any; dealBreaker?: boolean }>>(
                  (answerAcc, answer) => {
                    if (answer?.itemId && typeof answer.itemId === 'string') {
                      answerAcc[answer.itemId] = {
                        value: answer.value,
                        dealBreaker: answer.dealBreaker === true,
                      }
                    }
                    return answerAcc
                  },
                  {}
                )

                acc[sectionKey] = normalizedAnswers
                return acc
              },
              {}
            ) as OnboardingPdfRequestBody['sections']
          }

          const sections = buildOnboardingPdfSections({
            items: itemsJson as Item[],
            onboardingSections: onboardingSections ?? {},
            sectionMeta,
          })

          const html = generateOnboardingAgreementHtml({
            student: { name: studentName, email: user.email ?? undefined },
            generatedAtISO: new Date().toISOString(),
            sections,
          })

          return renderPdf(html)
        })(),
        30000
      )

      const pdfBuffer = await timeoutPromise

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="domu-match-onboarding-agreement-${new Date()
            .toISOString()
            .split('T')[0]}.pdf"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': (rateLimitResult.remaining - 1).toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      })
    } finally {
      // Always release queue slot
      pdfQueue.release()
    }
  } catch (error) {
    safeLogger.error('Onboarding PDF generation error', error)

    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'PDF generation timed out. Please try again.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

