import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SectionKey } from '@/types/questionnaire'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const section = url.searchParams.get('section') as SectionKey | null
  if (!section) {
    return NextResponse.json({ error: 'Missing section' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('onboarding_sections')
    .select('answers, updated_at')
    .eq('user_id', user.id)
    .eq('section', section)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ answers: data?.answers ?? [], lastSavedAt: data?.updated_at })
}


