import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { filterCompatibilityPeerIds } from '@/lib/matching/compatibility-peer-access'

type BatchRequestBody = {
  other_user_ids: string[]
}

const MAX_BATCH_PEERS = 25

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

  const rawIds = Array.isArray(body?.other_user_ids) ? body.other_user_ids.filter(Boolean) : []
  const otherUserIds = [...new Set(rawIds)].slice(0, MAX_BATCH_PEERS)
  if (otherUserIds.length === 0) {
    return NextResponse.json({ results: [] })
  }

  const admin = await createAdminClient()
  const allowedPeers = await filterCompatibilityPeerIds(admin, user.id, otherUserIds)
  if (allowedPeers.length === 0) {
    return NextResponse.json({ results: [] })
  }

  const { data, error } = await admin.rpc('compute_compatibility_scores_batch', {
    user_a_id: user.id,
    user_b_ids: allowedPeers,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ results: data || [] })
}

