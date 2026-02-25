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

    if (!adminRecord) {
      return NextResponse.json(
        { error: 'Admin record not found' },
        { status: 500 }
      )
    }

    const isSuperAdmin = adminRecord.role === 'super_admin'
    const universityId = isSuperAdmin ? null : adminRecord.university_id

    // Resolve university-scoped user IDs (if applicable)
    let universityUserIds: Set<string> | null = null

    if (universityId) {
      const { data: academic, error: academicError } = await admin
        .from('user_academic')
        .select('user_id')
        .eq('university_id', universityId)

      if (academicError) {
        safeLogger.error('[Marketplace Dynamics] Failed to fetch academic users', academicError)
        return NextResponse.json(
          { error: 'Failed to load marketplace dynamics' },
          { status: 500 }
        )
      }

      universityUserIds = new Set(academic?.map(a => a.user_id) || [])
    }

    // 1) Active users with housing status (supply vs demand)
    let usersQuery = admin
      .from('users')
      .select('id')
      .eq('is_active', true)

    if (universityId && universityUserIds) {
      if (universityUserIds.size > 0) {
        usersQuery = usersQuery.in('id', Array.from(universityUserIds))
      } else {
        // No users for this university
        usersQuery = usersQuery.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    }

    const { data: activeUsers, error: usersError } = await usersQuery

    if (usersError) {
      safeLogger.error('[Marketplace Dynamics] Failed to fetch active users', usersError)
      return NextResponse.json(
        { error: 'Failed to load marketplace dynamics' },
        { status: 500 }
      )
    }

    const activeUserIds = new Set((activeUsers || []).map(u => u.id as string))

    let supplyDemand = {
      haveRoomCount: 0,
      needRoomCount: 0,
      haveRoomPercentage: 0,
      needRoomPercentage: 0,
      totalUsersConsidered: 0
    }

    if (activeUserIds.size > 0) {
      let profilesQuery = admin
        .from('profiles')
        .select('user_id, housing_status')
        .in('user_id', Array.from(activeUserIds))

      const { data: profiles, error: profilesError } = await profilesQuery

      if (profilesError) {
        safeLogger.error('[Marketplace Dynamics] Failed to fetch profiles', profilesError)
        return NextResponse.json(
          { error: 'Failed to load marketplace dynamics' },
          { status: 500 }
        )
      }

      let haveRoomCount = 0
      let needRoomCount = 0
      let relevantUsers = 0

      for (const profile of profiles || []) {
        const statuses = Array.isArray(profile.housing_status)
          ? (profile.housing_status as string[])
          : []

        const hasRoom = statuses.includes('offering_room')
        const needsRoom = statuses.includes('seeking_room')

        if (hasRoom || needsRoom) {
          relevantUsers += 1
        }
        if (hasRoom) {
          haveRoomCount += 1
        }
        if (needsRoom) {
          needRoomCount += 1
        }
      }

      const totalUsersConsidered = relevantUsers
      const havePct =
        totalUsersConsidered > 0 ? (haveRoomCount / totalUsersConsidered) * 100 : 0
      const needPct =
        totalUsersConsidered > 0 ? (needRoomCount / totalUsersConsidered) * 100 : 0

      supplyDemand = {
        haveRoomCount,
        needRoomCount,
        haveRoomPercentage: Number(havePct.toFixed(1)),
        needRoomPercentage: Number(needPct.toFixed(1)),
        totalUsersConsidered
      }
    }

    // 2) Squad formation rate (group vs duo chats) over the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    let messagesQuery = admin
      .from('messages')
      .select('chat_id')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const { data: recentMessages, error: messagesError } = await messagesQuery

    if (messagesError) {
      safeLogger.error('[Marketplace Dynamics] Failed to fetch recent messages', messagesError)
      return NextResponse.json(
        { error: 'Failed to load marketplace dynamics' },
        { status: 500 }
      )
    }

    const activeChatIdsAll = new Set(
      (recentMessages || [])
        .map(m => m.chat_id as string)
        .filter(Boolean)
    )

    let activeChatIds = activeChatIdsAll

    if (universityId && universityUserIds && activeChatIdsAll.size > 0) {
      const { data: chatMembers, error: membersError } = await admin
        .from('chat_members')
        .select('chat_id, user_id')
        .in('chat_id', Array.from(activeChatIdsAll))

      if (membersError) {
        safeLogger.error('[Marketplace Dynamics] Failed to fetch chat members', membersError)
        return NextResponse.json(
          { error: 'Failed to load marketplace dynamics' },
          { status: 500 }
        )
      }

      const scopedChatIds = new Set<string>()
      for (const cm of chatMembers || []) {
        if (universityUserIds.has(cm.user_id)) {
          scopedChatIds.add(cm.chat_id)
        }
      }
      activeChatIds = scopedChatIds
    }

    let squadFormation = {
      groupChatCount: 0,
      duoChatCount: 0,
      groupChatPercentage: 0,
      duoChatPercentage: 0,
      totalActiveChats: 0
    }

    if (activeChatIds.size > 0) {
      const { data: chats, error: chatsError } = await admin
        .from('chats')
        .select('id, is_group')
        .in('id', Array.from(activeChatIds))

      if (chatsError) {
        safeLogger.error('[Marketplace Dynamics] Failed to fetch chats', chatsError)
        return NextResponse.json(
          { error: 'Failed to load marketplace dynamics' },
          { status: 500 }
        )
      }

      let groupChatCount = 0
      let duoChatCount = 0

      for (const chat of chats || []) {
        if (chat.is_group) {
          groupChatCount += 1
        } else {
          duoChatCount += 1
        }
      }

      const totalActiveChats = groupChatCount + duoChatCount
      const groupPct =
        totalActiveChats > 0 ? (groupChatCount / totalActiveChats) * 100 : 0
      const duoPct =
        totalActiveChats > 0 ? (duoChatCount / totalActiveChats) * 100 : 0

      squadFormation = {
        groupChatCount,
        duoChatCount,
        groupChatPercentage: Number(groupPct.toFixed(1)),
        duoChatPercentage: Number(duoPct.toFixed(1)),
        totalActiveChats
      }
    }

    return NextResponse.json({
      supplyDemand,
      squadFormation
    })
  } catch (error) {
    safeLogger.error('[Marketplace Dynamics] Unexpected error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

