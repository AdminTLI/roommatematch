import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Snapshot all sections for this user
  const { data: sections, error } = await supabase
    .from('onboarding_sections')
    .select('section, answers, version, updated_at')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const payload = {
    user_id: user.id,
    snapshot: sections ?? [],
    submitted_at: new Date().toISOString(),
  }

  const { error: insertError } = await supabase.from('onboarding_submissions').insert(payload)
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}


