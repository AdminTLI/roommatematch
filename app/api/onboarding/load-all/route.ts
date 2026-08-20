import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { V2_SECTION_KEYS } from '@/types/questionnaire'

/**
 * Load all v2 questionnaire sections for the current user in one request.
 * Used by the review page so it does not depend solely on localStorage.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('onboarding_sections')
    .select('section, answers, updated_at')
    .eq('user_id', user.id)
    .in('section', [...V2_SECTION_KEYS])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const sections: Record<string, { answers: unknown[]; lastSavedAt: string | null }> = {}
  for (const key of V2_SECTION_KEYS) {
    sections[key] = { answers: [], lastSavedAt: null }
  }

  let latestSavedAt: string | null = null
  for (const row of data ?? []) {
    const answers = Array.isArray(row.answers) ? row.answers : []
    sections[row.section] = {
      answers,
      lastSavedAt: row.updated_at ?? null,
    }
    if (row.updated_at && (!latestSavedAt || row.updated_at > latestSavedAt)) {
      latestSavedAt = row.updated_at
    }
  }

  return NextResponse.json({ sections, lastSavedAt: latestSavedAt })
}
