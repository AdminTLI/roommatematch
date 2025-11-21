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
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = searchParams.get('userId')

    const admin = await createAdminClient()

    let query = admin
      .from('match_blocklist')
      .select(`
        id,
        user_id,
        blocked_user_id,
        created_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: blocklistEntries, error } = await query

    if (error) {
      safeLogger.error('[Admin] Failed to fetch blocklist', error)
      return NextResponse.json(
        { error: 'Failed to fetch blocklist' },
        { status: 500 }
      )
    }

    // Fetch user profiles for both user_id and blocked_user_id
    const allUserIds = new Set<string>()
    blocklistEntries?.forEach(entry => {
      allUserIds.add(entry.user_id)
      allUserIds.add(entry.blocked_user_id)
    })

    const userIdsArray = Array.from(allUserIds)

    const { data: profiles } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', userIdsArray)

    const { data: users } = await admin
      .from('users')
      .select('id, email')
      .in('id', userIdsArray)

    const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
    const usersMap = new Map(users?.map(u => [u.id, u]) || [])

    // Enrich blocklist entries with user info
    const enriched = blocklistEntries?.map(entry => {
      const userProfile = profilesMap.get(entry.user_id)
      const userEmail = usersMap.get(entry.user_id)?.email
      const blockedProfile = profilesMap.get(entry.blocked_user_id)
      const blockedEmail = usersMap.get(entry.blocked_user_id)?.email

      return {
        id: entry.id,
        userId: entry.user_id,
        userName: userProfile ? `${userProfile.first_name} ${userProfile.last_name}`.trim() : 'Unknown',
        userEmail: userEmail || 'Unknown',
        blockedUserId: entry.blocked_user_id,
        blockedUserName: blockedProfile ? `${blockedProfile.first_name} ${blockedProfile.last_name}`.trim() : 'Unknown',
        blockedUserEmail: blockedEmail || 'Unknown',
        createdAt: entry.created_at
      }
    })

    // Get total count
    let countQuery = admin
      .from('match_blocklist')
      .select('id', { count: 'exact', head: true })

    if (userId) {
      countQuery = countQuery.eq('user_id', userId)
    }

    const { count } = await countQuery

    // Get statistics
    const { data: allEntries } = await admin
      .from('match_blocklist')
      .select('user_id, created_at')

    const totalEntries = allEntries?.length || 0
    const uniqueUsers = new Set(allEntries?.map(e => e.user_id) || []).size

    // Calculate blocklist growth over time
    const byDay: Record<string, number> = {}
    allEntries?.forEach(entry => {
      const day = new Date(entry.created_at).toISOString().split('T')[0]
      byDay[day] = (byDay[day] || 0) + 1
    })

    const blocklistGrowth = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    return NextResponse.json({
      blocklist: enriched || [],
      total: count || 0,
      statistics: {
        totalEntries,
        uniqueUsers,
        avgBlocksPerUser: uniqueUsers > 0 ? Number((totalEntries / uniqueUsers).toFixed(2)) : 0
      },
      growth: blocklistGrowth
    })

  } catch (error) {
    safeLogger.error('[Admin] Blocklist error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

