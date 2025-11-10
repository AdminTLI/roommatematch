import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = getUserRateLimitKey('block', user.id)
    const rateLimitResult = await checkRateLimit('block', rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { blocked_user_id } = await request.json()

    if (!blocked_user_id) {
      return NextResponse.json({ error: 'Missing blocked_user_id' }, { status: 400 })
    }

    if (blocked_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })
    }

    const admin = await createAdminClient()

    // Add to blocklist
    const { error: blockError } = await admin
      .from('match_blocklist')
      .insert({
        user_id: user.id,
        blocked_user_id
      })

    if (blockError) {
      // Check if already blocked
      if (blockError.code === '23505') {
        return NextResponse.json({ success: true, message: 'User already blocked' })
      }
      
      safeLogger.error('[Block] Failed to block user', blockError)
      return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
    }

    safeLogger.info('[Block] User blocked', {
      userId: user.id,
      blockedUserId: blocked_user_id
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    safeLogger.error('[Block] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


