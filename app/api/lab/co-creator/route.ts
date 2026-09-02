import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireDomuLabEnabled } from '@/lib/lab/guard'

export async function GET() {
  const disabled = requireDomuLabEnabled()
  if (disabled) return disabled

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: badge } = await supabase
      .from('lab_co_creator_badges')
      .select('wish_id, wish_title, awarded_at')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({ badge: badge ?? null })
  } catch {
    return NextResponse.json({ badge: null })
  }
}
