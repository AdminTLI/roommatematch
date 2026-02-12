import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { createNotificationsForUsers } from '@/lib/notifications/create'

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

    // Add to blocklist (or re-activate an existing block)
    const { error: blockError } = await admin
      .from('match_blocklist')
      .upsert(
        {
          user_id: user.id,
          blocked_user_id,
          created_at: new Date().toISOString(),
          ended_at: null
        },
        { onConflict: 'user_id,blocked_user_id' }
      )

    if (blockError) {
      safeLogger.error('[Block] Failed to block user', blockError)
      return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
    }

    safeLogger.info('[Block] User blocked', {
      userId: user.id,
      blockedUserId: blocked_user_id
    })

    // Notify all admins about the block action
    try {
      const { data: admins } = await admin
        .from('admins')
        .select('user_id')

      if (admins && admins.length > 0) {
        const adminUserIds = admins.map(a => a.user_id)
        
        // Get user names for notification
        const { data: blockerProfile } = await admin
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .maybeSingle()

        const { data: blockedProfile } = await admin
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', blocked_user_id)
          .maybeSingle()

        const blockerName = blockerProfile 
          ? [blockerProfile.first_name, blockerProfile.last_name].filter(Boolean).join(' ') || 'User'
          : 'User'
        
        const blockedName = blockedProfile
          ? [blockedProfile.first_name, blockedProfile.last_name].filter(Boolean).join(' ') || 'User'
          : 'User'

        await createNotificationsForUsers(
          adminUserIds,
          'system_announcement',
          'User Blocked',
          `${blockerName} blocked ${blockedName}.`,
          {
            blocker_id: user.id,
            blocked_user_id: blocked_user_id,
            link: `/admin/matches?tab=blocklist`,
            type: 'user_blocked'
          }
        )

        safeLogger.info('[Block] Notified admins', {
          blockerId: user.id,
          blockedUserId: blocked_user_id,
          adminCount: adminUserIds.length
        })
      }
    } catch (notifyError) {
      // Don't fail the block action if notification fails
      safeLogger.error('[Block] Failed to notify admins', notifyError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    safeLogger.error('[Block] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}








