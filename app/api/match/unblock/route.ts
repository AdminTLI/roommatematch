import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { blocked_user_id } = await request.json()

    if (!blocked_user_id) {
      return NextResponse.json({ error: 'Missing blocked_user_id' }, { status: 400 })
    }

    if (blocked_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot unblock yourself' }, { status: 400 })
    }

    const admin = await createAdminClient()

    // Mark existing active block as ended (if any)
    const { error: unblockError } = await admin
      .from('match_blocklist')
      .update({ ended_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('blocked_user_id', blocked_user_id)
      .is('ended_at', null)

    if (unblockError) {
      safeLogger.error('[Unblock] Failed to unblock user', unblockError)
      return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 })
    }

    safeLogger.info('[Unblock] User unblocked', {
      userId: user.id,
      unblockedUserId: blocked_user_id
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    safeLogger.error('[Unblock] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

