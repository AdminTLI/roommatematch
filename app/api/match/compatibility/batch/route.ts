import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

type BatchRequestBody = {
  other_user_ids: string[]
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: BatchRequestBody
  try {
    body = (await request.json()) as BatchRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const otherUserIds = Array.isArray(body?.other_user_ids) ? body.other_user_ids.filter(Boolean) : []
  if (otherUserIds.length === 0) {
    return NextResponse.json({ results: [] })
  }

  const admin = await createAdminClient()
  const { data, error } = await admin.rpc('compute_compatibility_scores_batch', {
    user_a_id: user.id,
    user_b_ids: otherUserIds,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ results: data || [] })
}

