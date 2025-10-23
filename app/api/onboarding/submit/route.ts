import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Handle demo users
  const userId = user?.id || 'demo-user-id'
  const isDemo = !user
  
  if (!isDemo) {
    // Real user: save to database
    const { data: sections, error } = await supabase
      .from('onboarding_sections')
      .select('section, answers, version, updated_at')
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const payload = {
      user_id: userId,
      snapshot: sections ?? [],
      submitted_at: new Date().toISOString(),
    }

    const { error: insertError } = await supabase
      .from('onboarding_submissions')
      .insert(payload)
      
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, isDemo })
}


