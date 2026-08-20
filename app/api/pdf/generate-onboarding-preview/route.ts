import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOnboardingAgreementHtml, buildOnboardingPdfSections } from '@/lib/pdf/generate-onboarding-html'
import { renderPdf } from '@/lib/pdf/render-pdf'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { pdfQueue } from '@/lib/pdf/queue'
import { safeLogger } from '@/lib/utils/logger'
import v1ItemsJson from '@/data/item-bank.v1.json'
import v2ItemsJson from '@/data/item-bank.v2.json'
import type { Item } from '@/types/questionnaire'
import { V2_SECTION_KEYS, type SectionKey } from '@/types/questionnaire'
import { createHash, randomBytes } from 'crypto'

export const runtime = 'nodejs'

type AnswerPayload = { value: any; dealBreaker?: boolean; userSetGate?: boolean }

type OnboardingPdfRequestBody = {
  sections?: Record<string, Record<string, AnswerPayload>>
}

const V1_SECTION_META: Record<string, { title: string; whyItMatters: string }> = {
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
  'professional-context': {
    title: 'Professional Context',
    whyItMatters: 'Aligns work schedules and professional living needs for young professionals sharing housing.',
  },
}

const V2_SECTION_META: Record<string, { title: string; whyItMatters: string }> = {
  'logistics-context': {
    title: 'Logistics and Context',
    whyItMatters:
      'Covers practical living constraints, responsibilities, and household logistics that shape daily cohabitation.',
  },
  'environment-rhythms': {
    title: 'Environment and Rhythms',
    whyItMatters:
      'Aligns sleep, noise, lighting, and shared-space rhythms so housemates can rest and work comfortably.',
  },
  'cleanliness-operations': {
    title: 'Cleanliness and Operations',
    whyItMatters:
      'Sets expectations for kitchen habits, chores, and upkeep to reduce friction in shared spaces.',
  },
  'communication-resolution': {
    title: 'Communication and Resolution',
    whyItMatters:
      'Captures how you give feedback and handle conflict so communication styles can be matched thoughtfully.',
  },
  'social-spaces': {
    title: 'Social Life and Spaces',
    whyItMatters:
      'Defines guest norms, gatherings, and how shared areas should feel for a comfortable social balance.',
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

function buildDocumentId(userId: string, generatedAtISO: string): string {
  const stamp = generatedAtISO.slice(0, 10).replace(/-/g, '')
  const hash = createHash('sha256')
    .update(`${userId}:${generatedAtISO}:${randomBytes(4).toString('hex')}`)
    .digest('hex')
    .slice(0, 10)
    .toUpperCase()
  return `DM-${stamp}-${hash}`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

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

    if (pdfQueue.isFull()) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    await pdfQueue.acquire()

    try {
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

            onboardingSections = (dbSections ?? []).reduce<Record<string, Record<string, AnswerPayload>>>(
              (acc, row) => {
                const sectionKey = row.section
                if (typeof sectionKey !== 'string' || !Array.isArray(row.answers)) return acc

                const normalizedAnswers = row.answers.reduce<Record<string, AnswerPayload>>(
                  (answerAcc, answer) => {
                    if (answer?.itemId && typeof answer.itemId === 'string') {
                      answerAcc[answer.itemId] = {
                        value: answer.value,
                        dealBreaker: answer.dealBreaker === true,
                        userSetGate: answer.userSetGate === true,
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
            )
          }

          const sectionKeys = Object.keys(onboardingSections ?? {})
          const isV2 = sectionKeys.some((key) =>
            (V2_SECTION_KEYS as readonly string[]).includes(key)
          )

          const items = (isV2 ? v2ItemsJson : v1ItemsJson) as Item[]
          const sectionMeta = isV2 ? V2_SECTION_META : V1_SECTION_META

          const sections = buildOnboardingPdfSections({
            items,
            onboardingSections: (onboardingSections ?? {}) as Record<
              SectionKey,
              Record<string, AnswerPayload>
            >,
            sectionMeta,
          })

          const generatedAtISO = new Date().toISOString()
          const documentId = buildDocumentId(user.id, generatedAtISO)

          const html = generateOnboardingAgreementHtml({
            student: { name: studentName, email: user.email ?? undefined },
            generatedAtISO,
            documentId,
            sections,
          })

          return renderPdf(html)
        })(),
        30000
      )

      const pdfBuffer = await timeoutPromise
      const filename = `domu-match-compatibility-profile-${new Date().toISOString().split('T')[0]}.pdf`

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': (rateLimitResult.remaining - 1).toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      })
    } finally {
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
