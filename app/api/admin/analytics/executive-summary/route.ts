import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { resolveAdminAnalyticsScope, resolveScopedMetricsUserIds } from '@/lib/admin/analytics-scope'

type LiquidityUniversity = {
  university_id: string | null
  university_name: string
  active_users: number
}

type ExecutiveSummaryResponse = {
  liquidity: {
    topUniversities: LiquidityUniversity[]
    totalActiveUsers: number
  }
  velocity: {
    averageTimeToFirstMatchDays: number
    sampleSize: number
  }
  matchQuality: {
    activeMatches: number
    matchesWith5PlusMessages: number
    conversationRate: number
  }
  onboarding: {
    totalUsers: number
    completedOnboarding: number
    completionRate: number
  }
}

const ACTIVE_HOUSING_STATUSES = ['seeking_room', 'offering_room', 'team_up'] as const

export async function GET(request: NextRequest) {
  try {
    const scope = await resolveAdminAnalyticsScope(request)
    if (!scope.ok) {
      return NextResponse.json({ error: scope.error }, { status: scope.status })
    }

    const { universityId, filters } = scope
    const admin = createAdminClient()
    const universityUserIds = await resolveScopedMetricsUserIds(admin, universityId, filters)

    if (universityUserIds.size === 0) {
        const empty: ExecutiveSummaryResponse = {
          liquidity: {
            topUniversities: [],
            totalActiveUsers: 0,
          },
          velocity: {
            averageTimeToFirstMatchDays: 0,
            sampleSize: 0,
          },
          matchQuality: {
            activeMatches: 0,
            matchesWith5PlusMessages: 0,
            conversationRate: 0,
          },
          onboarding: {
            totalUsers: 0,
            completedOnboarding: 0,
            completionRate: 0,
          },
        }
        return NextResponse.json(empty)
    }

    // Run the four metric groups in parallel where possible
    const [
      liquidityResult,
      velocityResult,
      matchQualityResult,
      onboardingResult,
    ] = await Promise.all([
      computeLiquidity(admin, universityId, universityUserIds),
      computeVelocity(admin, universityId, universityUserIds),
      computeMatchQuality(admin, universityId, universityUserIds),
      computeOnboardingRate(admin, universityId, universityUserIds),
    ])

    const response: ExecutiveSummaryResponse = {
      liquidity: liquidityResult,
      velocity: velocityResult,
      matchQuality: matchQualityResult,
      onboarding: onboardingResult,
    }

    return NextResponse.json(response)
  } catch (error) {
    safeLogger.error('[Admin Executive Summary] Error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function computeLiquidity(
  admin: ReturnType<typeof createAdminClient>,
  universityId: string,
  universityUserIds: Set<string>
): Promise<ExecutiveSummaryResponse['liquidity']> {
  // Fetch profiles with housing_status set
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('user_id, university_id, housing_status')
    .not('housing_status', 'is', null)

  if (profilesError) {
    safeLogger.error('[Admin Executive Summary] Liquidity profiles error', profilesError)
    return {
      topUniversities: [],
      totalActiveUsers: 0,
    }
  }

  // Filter to users in scope and with an "active" housing status
  const filteredProfiles = (profiles || []).filter((profile: any) => {
    if (!profile.user_id) return false

    if (!universityUserIds.has(profile.user_id)) return false

    const statuses = Array.isArray(profile.housing_status)
      ? profile.housing_status as string[]
      : []

    const isActivelyLooking = statuses.some(status =>
      (ACTIVE_HOUSING_STATUSES as readonly string[]).includes(status)
    )

    return isActivelyLooking
  })

  if (filteredProfiles.length === 0) {
    return {
      topUniversities: [],
      totalActiveUsers: 0,
    }
  }

  // Filter by active accounts from users table
  const userIds = Array.from(new Set(filteredProfiles.map((p: any) => p.user_id)))
  let activeUserIds = new Set<string>(userIds)

  if (userIds.length > 0) {
    const { data: activeUsers, error: usersError } = await admin
      .from('users')
      .select('id')
      .eq('is_active', true)
      .in('id', userIds)

    if (usersError) {
      safeLogger.error('[Admin Executive Summary] Liquidity users error', usersError)
    } else {
      activeUserIds = new Set((activeUsers || []).map((u: any) => u.id))
    }
  }

  const activeProfiles = filteredProfiles.filter((p: any) =>
    activeUserIds.has(p.user_id)
  )

  if (activeProfiles.length === 0) {
    return {
      topUniversities: [],
      totalActiveUsers: 0,
    }
  }

  // Resolve university names
  const universityIds = Array.from(
    new Set(
      activeProfiles
        .map((p: any) => p.university_id)
        .filter((id: string | null | undefined): id is string => !!id)
    )
  )

  const universityNameMap = new Map<string, string>()

  if (universityIds.length > 0) {
    const { data: universities, error: universitiesError } = await admin
      .from('universities')
      .select('id, name')
      .in('id', universityIds)

    if (universitiesError) {
      safeLogger.error('[Admin Executive Summary] Liquidity universities error', universitiesError)
    } else {
      (universities || []).forEach((u: any) => {
        if (u.id && u.name) {
          universityNameMap.set(u.id, u.name)
        }
      })
    }
  }

  // Aggregate counts by university
  const countsMap = new Map<string | null, LiquidityUniversity>()

  for (const profile of activeProfiles) {
    const uniId: string | null = profile.university_id || null
    const existing = countsMap.get(uniId)
    const university_name =
      uniId && universityNameMap.get(uniId)
        ? universityNameMap.get(uniId)!
        : uniId
        ? 'Unknown university'
        : 'Unknown'

    if (existing) {
      existing.active_users += 1
    } else {
      countsMap.set(uniId, {
        university_id: uniId,
        university_name,
        active_users: 1,
      })
    }
  }

  const allUniversities = Array.from(countsMap.values()).sort(
    (a, b) => b.active_users - a.active_users
  )

  return {
    topUniversities: allUniversities.slice(0, 5),
    totalActiveUsers: activeProfiles.length,
  }
}

async function computeVelocity(
  admin: ReturnType<typeof createAdminClient>,
  universityId: string,
  universityUserIds: Set<string>
): Promise<ExecutiveSummaryResponse['velocity']> {
  // Get scoped active users with their creation timestamps
  let usersQuery = admin
    .from('users')
    .select('id, created_at')
    .eq('is_active', true)

  if (universityUserIds.size > 0) {
    usersQuery = usersQuery.in('id', Array.from(universityUserIds))
  }

  const { data: users, error: usersError } = await usersQuery

  if (usersError) {
    safeLogger.error('[Admin Executive Summary] Velocity users error', usersError)
    return {
      averageTimeToFirstMatchDays: 0,
      sampleSize: 0,
    }
  }

  const userCreatedAt = new Map<string, Date>()
  ;(users || []).forEach((u: any) => {
    if (u.id && u.created_at) {
      userCreatedAt.set(u.id, new Date(u.created_at))
    }
  })

  if (userCreatedAt.size === 0) {
    return {
      averageTimeToFirstMatchDays: 0,
      sampleSize: 0,
    }
  }

  const matchRows: { a_user: string; b_user: string; created_at: string }[] = []
  const ids = Array.from(universityUserIds)
  for (let i = 0; i < ids.length; i += 120) {
    const part = ids.slice(i, i + 120)
    const { data: ma } = await admin
      .from('matches')
      .select('a_user, b_user, created_at')
      .eq('status', 'confirmed')
      .in('a_user', part)
    const { data: mb } = await admin
      .from('matches')
      .select('a_user, b_user, created_at')
      .eq('status', 'confirmed')
      .in('b_user', part)
    matchRows.push(...((ma || []) as typeof matchRows), ...((mb || []) as typeof matchRows))
  }

  const matches = matchRows

  // Map from user_id -> earliest match created_at
  const firstMatchAt = new Map<string, Date>()

  ;(matches || []).forEach((m: any) => {
    if (!m.created_at) return
    const matchDate = new Date(m.created_at)
    const participants = [m.a_user, m.b_user].filter(Boolean) as string[]

    participants.forEach((userId) => {
      if (!userCreatedAt.has(userId)) return
      const existing = firstMatchAt.get(userId)
      if (!existing || matchDate < existing) {
        firstMatchAt.set(userId, matchDate)
      }
    })
  })

  if (firstMatchAt.size === 0) {
    return {
      averageTimeToFirstMatchDays: 0,
      sampleSize: 0,
    }
  }

  let totalDays = 0
  let count = 0

  firstMatchAt.forEach((matchDate, userId) => {
    const createdAt = userCreatedAt.get(userId)
    if (!createdAt) return

    const diffMs = matchDate.getTime() - createdAt.getTime()
    if (diffMs < 0) return

    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    totalDays += diffDays
    count += 1
  })

  if (count === 0) {
    return {
      averageTimeToFirstMatchDays: 0,
      sampleSize: 0,
    }
  }

  const averageDays = totalDays / count

  return {
    averageTimeToFirstMatchDays: parseFloat(averageDays.toFixed(2)),
    sampleSize: count,
  }
}

async function computeMatchQuality(
  admin: ReturnType<typeof createAdminClient>,
  universityId: string,
  universityUserIds: Set<string>
): Promise<ExecutiveSummaryResponse['matchQuality']> {
  const nowIso = new Date().toISOString()

  // Load pair match suggestions that represent active matches
  const { data: suggestions, error: suggestionsError } = await admin
    .from('match_suggestions')
    .select('id, member_ids, status, accepted_by, expires_at, kind')
    .eq('kind', 'pair')

  if (suggestionsError) {
    safeLogger.error('[Admin Executive Summary] Match quality suggestions error', suggestionsError)
    return {
      activeMatches: 0,
      matchesWith5PlusMessages: 0,
      conversationRate: 0,
    }
  }

  // Deduplicate to unique pairs and filter to "active" matches
  const pairMap = new Map<string, { member_ids: string[] }>()

  ;(suggestions || []).forEach((s: any) => {
    if (!Array.isArray(s.member_ids) || s.member_ids.length !== 2) return

    const allInScope = s.member_ids.every((id: string) => universityUserIds.has(id))
    if (!allInScope) return

    // Filter out expired suggestions if expires_at is present
    if (s.expires_at && typeof s.expires_at === 'string') {
      if (new Date(s.expires_at).toISOString() < nowIso) return
    }

    let isActive = false

    if (s.status === 'confirmed') {
      isActive = true
    } else if (s.status === 'accepted' && Array.isArray(s.accepted_by)) {
      const acceptedSet = new Set<string>(s.accepted_by)
      const allAccepted = s.member_ids.every((id: string) => acceptedSet.has(id))
      if (allAccepted) isActive = true
    }

    if (!isActive) return

    const key = [...s.member_ids].sort().join('-')
    if (!pairMap.has(key)) {
      pairMap.set(key, { member_ids: s.member_ids })
    }
  })

  const activePairs = Array.from(pairMap.values())

  if (activePairs.length === 0) {
    return {
      activeMatches: 0,
      matchesWith5PlusMessages: 0,
      conversationRate: 0,
    }
  }

  // For these pairs, find chats that include both users
  const participantIds = new Set<string>()
  activePairs.forEach((p) => {
    p.member_ids.forEach((id) => participantIds.add(id))
  })

  const { data: chatMembers, error: chatMembersError } = await admin
    .from('chat_members')
    .select('chat_id, user_id')
    .in('user_id', Array.from(participantIds))

  if (chatMembersError) {
    safeLogger.error('[Admin Executive Summary] Match quality chat_members error', chatMembersError)
    return {
      activeMatches: activePairs.length,
      matchesWith5PlusMessages: 0,
      conversationRate: 0,
    }
  }

  const userToChats = new Map<string, Set<string>>()
  const chatsSet = new Set<string>()

  ;(chatMembers || []).forEach((cm: any) => {
    if (!cm.user_id || !cm.chat_id) return
    if (!userToChats.has(cm.user_id)) {
      userToChats.set(cm.user_id, new Set<string>())
    }
    userToChats.get(cm.user_id)!.add(cm.chat_id)
    chatsSet.add(cm.chat_id)
  })

  if (chatsSet.size === 0) {
    return {
      activeMatches: activePairs.length,
      matchesWith5PlusMessages: 0,
      conversationRate: 0,
    }
  }

  // Map each pair to the chats they share
  const pairChatsMap = new Map<string, string[]>()
  const allPairChatIds = new Set<string>()

  activePairs.forEach((pair) => {
    const [aId, bId] = pair.member_ids
    const chatsA = userToChats.get(aId) || new Set<string>()
    const chatsB = userToChats.get(bId) || new Set<string>()

    const sharedChats: string[] = []
    chatsA.forEach((chatId) => {
      if (chatsB.has(chatId)) {
        sharedChats.push(chatId)
        allPairChatIds.add(chatId)
      }
    })

    const key = [...pair.member_ids].sort().join('-')
    pairChatsMap.set(key, sharedChats)
  })

  if (allPairChatIds.size === 0) {
    return {
      activeMatches: activePairs.length,
      matchesWith5PlusMessages: 0,
      conversationRate: 0,
    }
  }

  // Count messages per chat for these chat IDs
  const { data: messages, error: messagesError } = await admin
    .from('messages')
    .select('chat_id')
    .in('chat_id', Array.from(allPairChatIds))

  if (messagesError) {
    safeLogger.error('[Admin Executive Summary] Match quality messages error', messagesError)
    return {
      activeMatches: activePairs.length,
      matchesWith5PlusMessages: 0,
      conversationRate: 0,
    }
  }

  const messagesPerChat = new Map<string, number>()
  ;(messages || []).forEach((m: any) => {
    if (!m.chat_id) return
    messagesPerChat.set(m.chat_id, (messagesPerChat.get(m.chat_id) || 0) + 1)
  })

  // For each active match pair, check if their chats have at least 5 messages total
  let matchesWithConversations = 0

  pairChatsMap.forEach((chatIds, key) => {
    if (!chatIds || chatIds.length === 0) return
    const totalMessagesForPair = chatIds.reduce((sum, chatId) => {
      return sum + (messagesPerChat.get(chatId) || 0)
    }, 0)

    if (totalMessagesForPair >= 5) {
      matchesWithConversations += 1
    }
  })

  const activeMatches = activePairs.length
  const rate =
    activeMatches > 0
      ? parseFloat(((matchesWithConversations / activeMatches) * 100).toFixed(1))
      : 0

  return {
    activeMatches,
    matchesWith5PlusMessages: matchesWithConversations,
    conversationRate: rate,
  }
}

async function computeOnboardingRate(
  admin: ReturnType<typeof createAdminClient>,
  universityId: string,
  universityUserIds: Set<string>
): Promise<ExecutiveSummaryResponse['onboarding']> {
  // Base population: active users in scope
  let usersQuery = admin
    .from('users')
    .select('id')
    .eq('is_active', true)

  if (universityUserIds.size > 0) {
    usersQuery = usersQuery.in('id', Array.from(universityUserIds))
  }

  const { data: users, error: usersError } = await usersQuery

  if (usersError) {
    safeLogger.error('[Admin Executive Summary] Onboarding users error', usersError)
    return {
      totalUsers: 0,
      completedOnboarding: 0,
      completionRate: 0,
    }
  }

  const userIds = (users || []).map((u: any) => u.id).filter(Boolean)

  if (userIds.length === 0) {
    return {
      totalUsers: 0,
      completedOnboarding: 0,
      completionRate: 0,
    }
  }

  // Users who have an onboarding_submissions row are considered complete
  const { data: submissions, error: submissionsError } = await admin
    .from('onboarding_submissions')
    .select('user_id')
    .in('user_id', userIds)

  if (submissionsError) {
    safeLogger.error('[Admin Executive Summary] Onboarding submissions error', submissionsError)
    return {
      totalUsers: userIds.length,
      completedOnboarding: 0,
      completionRate: 0,
    }
  }

  const completedUserIds = new Set(
    (submissions || []).map((s: any) => s.user_id).filter(Boolean)
  )

  const totalUsers = userIds.length
  const completedOnboarding = completedUserIds.size
  const completionRate =
    totalUsers > 0
      ? parseFloat(((completedOnboarding / totalUsers) * 100).toFixed(1))
      : 0

  return {
    totalUsers,
    completedOnboarding,
    completionRate,
  }
}

