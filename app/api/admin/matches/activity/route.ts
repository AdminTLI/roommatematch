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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const days = parseInt(searchParams.get('days') || '7')
    const actionType = searchParams.get('type') // 'decline', 'accept', 'all'

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const admin = await createAdminClient()

    // Get match-related events
    let query = admin
      .from('app_events')
      .select('*')
      .in('name', [
        'match_declined',
        'match_rejected',
        'match_accepted',
        'match_confirmed',
        'match_created'
      ])
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)

    if (actionType && actionType !== 'all') {
      if (actionType === 'decline') {
        query = query.in('name', ['match_declined', 'match_rejected'])
      } else if (actionType === 'accept') {
        query = query.in('name', ['match_accepted', 'match_confirmed'])
      }
    }

    const { data: events, error } = await query

    if (error) {
      safeLogger.error('[Admin] Failed to fetch activity events', error)
      return NextResponse.json(
        { error: 'Failed to fetch activity' },
        { status: 500 }
      )
    }

    // Fetch user profiles for enrichment
    const userIds = new Set<string>()
    events?.forEach(event => {
      if (event.user_id) userIds.add(event.user_id)
      if (event.props?.other_user_ids && Array.isArray(event.props.other_user_ids)) {
        event.props.other_user_ids.forEach((id: string) => userIds.add(id))
      }
      if (event.props?.blocked_user_id) userIds.add(event.props.blocked_user_id)
    })

    const userIdsArray = Array.from(userIds)
    
    const { data: profiles } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', userIdsArray)

    const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

    // Enrich events with user info
    const enriched = events?.map(event => {
      const userProfile = profilesMap.get(event.user_id)
      const userName = userProfile 
        ? `${userProfile.first_name} ${userProfile.last_name}`.trim() 
        : 'Unknown User'

      let description = ''
      let actionType = 'unknown'

      if (event.name === 'match_declined' || event.name === 'match_rejected') {
        actionType = 'decline'
        const blockedCount = Array.isArray(event.props?.other_user_ids) 
          ? event.props.other_user_ids.length 
          : (event.props?.blocked_user_id ? 1 : 0)
        description = `${userName} declined a match (score: ${event.props?.match_fit_index || event.props?.match_score || 'N/A'}). ${blockedCount} user(s) added to blocklist.`
      } else if (event.name === 'match_accepted') {
        actionType = 'accept'
        description = `${userName} accepted a match (score: ${event.props?.match_fit_index || event.props?.match_score || 'N/A'}).`
      } else if (event.name === 'match_confirmed') {
        actionType = 'confirm'
        description = `Match confirmed between users (score: ${event.props?.match_fit_index || event.props?.match_score || 'N/A'}).`
      } else if (event.name === 'match_created') {
        actionType = 'create'
        description = `New match created (score: ${event.props?.match_fit_index || event.props?.match_score || 'N/A'}).`
      }

      return {
        id: event.id,
        userId: event.user_id,
        userName,
        actionType,
        eventName: event.name,
        description,
        suggestionId: event.props?.suggestion_id,
        matchScore: event.props?.match_fit_index || event.props?.match_score,
        blockedUserIds: event.props?.other_user_ids || (event.props?.blocked_user_id ? [event.props.blocked_user_id] : []),
        metadata: event.props,
        timestamp: event.created_at
      }
    })

    return NextResponse.json({
      activity: enriched || [],
      total: enriched?.length || 0,
      periodDays: days
    })

  } catch (error) {
    safeLogger.error('[Admin] Match activity error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


