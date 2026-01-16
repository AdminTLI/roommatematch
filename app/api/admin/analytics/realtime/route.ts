import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { adminRecord } = adminCheck
    const admin = createAdminClient()
    const isSuperAdmin = adminRecord?.role === 'super_admin'
    const universityId = isSuperAdmin ? null : adminRecord?.university_id

    // Get active users in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    let eventsQuery = admin
      .from('user_journey_events')
      .select('user_id, session_id, event_timestamp')
      .gte('event_timestamp', fiveMinutesAgo.toISOString())
      .order('event_timestamp', { ascending: false })

    // Filter by university if needed
    if (universityId) {
      // Get user IDs for this university
      const { data: academic } = await admin
        .from('user_academic')
        .select('user_id')
        .eq('university_id', universityId)
      
      const universityUserIds = new Set(academic?.map(a => a.user_id) || [])
      
      if (universityUserIds.size > 0) {
        eventsQuery = eventsQuery.in('user_id', Array.from(universityUserIds))
      } else {
        // No users for this university
        return NextResponse.json({
          activeUsers: 0,
          activeSessions: 0,
          eventsLast5Min: 0
        })
      }
    }

    const { data: activeEvents, error } = await eventsQuery

    if (error) {
      safeLogger.error('[Admin Analytics] Realtime error', { error })
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Calculate unique users and sessions
    const uniqueUsers = new Set(
      (activeEvents || [])
        .map(e => e.user_id)
        .filter(Boolean)
    )
    const uniqueSessions = new Set(
      (activeEvents || [])
        .map(e => e.session_id)
        .filter(Boolean)
    )

    return NextResponse.json({
      activeUsers: uniqueUsers.size,
      activeSessions: uniqueSessions.size,
      eventsLast5Min: activeEvents?.length || 0
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] Realtime error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}





