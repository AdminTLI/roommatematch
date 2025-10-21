import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SectionKey } from '@/types/questionnaire'

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

  const lastSavedAt = new Date().toISOString()
  return NextResponse.json({ lastSavedAt })
}


