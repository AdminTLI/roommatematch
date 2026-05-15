import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isUuidString } from '@/lib/auth/compatibility-pair-access'
import { filterCompatibilityPeerIds } from '@/lib/matching/compatibility-peer-access'

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

  if (!isUuidString(otherUserId)) {
    return NextResponse.json({ error: 'Invalid other_user_id' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const allowed = await filterCompatibilityPeerIds(admin, user.id, [otherUserId])
  if (allowed.length === 0) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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
