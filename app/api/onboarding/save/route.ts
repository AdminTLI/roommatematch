import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SectionKey } from '@/types/questionnaire'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { trackEvent, EVENT_TYPES } from '@/lib/events'

type SaveBody = { section: SectionKey; answers: any[] }

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting: 100 requests per 15 minutes per user
  const rateLimitKey = getUserRateLimitKey('api', user.id)
  const rateLimitResult = await checkRateLimit('api', rateLimitKey)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }

  const body = (await request.json()) as SaveBody
  if (!body?.section || !Array.isArray(body?.answers)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { error } = await supabase
    .from('onboarding_sections')
    .upsert(
      {
        user_id: user.id,
        section: body.section,
        answers: body.answers,
        version: 'rmq-v1',
      },
      { onConflict: 'user_id,section' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Track section completion analytics
  try {
    await trackEvent(EVENT_TYPES.QUESTIONNAIRE_SECTION_COMPLETED, {
      section: body.section,
      answer_count: body.answers.length,
      user_id: user.id
    }, user.id)
  } catch (analyticsError) {
    // Don't fail the save if analytics fails
    console.error('Failed to track analytics:', analyticsError)
  }

  // Automatically generate/update user vector when section is saved
  // This ensures vectors are up-to-date for matching
  try {
    await supabase.rpc('compute_user_vector_and_store', { p_user_id: user.id })
  } catch (vectorError) {
    // Don't fail the save if vector generation fails
    console.error('Failed to generate user vector:', vectorError)
  }

  const lastSavedAt = new Date().toISOString()
  return NextResponse.json({ lastSavedAt })
}


