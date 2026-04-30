import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const otherUserId = request.nextUrl.searchParams.get('other_user_id')
  if (!otherUserId) {
    return NextResponse.json({ error: 'Missing other_user_id' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { data, error } = await admin.rpc('compute_compatibility_score', {
    user_a_id: user.id,
    user_b_id: otherUserId,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const row = Array.isArray(data) && data.length > 0 ? data[0] : null
  return NextResponse.json({ result: row })
}

