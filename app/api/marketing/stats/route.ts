import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export interface MarketingStatsResponse {
  matchedWithin24hPercent: number
  matchedWithin48hPercent: number
  avgScoreConfirmedMatches: number
  avgScoreAllMatches: number
  medianHoursToFirstMatch: number
  matchesToChatWithin24hPercent: number
  verifiedUsersPercent: number
  universitiesCount: number
  programmesCount: number
  generatedAt: string
}

export async function GET() {
  try {
    const admin = createAdminClient()
    const now = new Date()
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    const oneYearAgoISO = oneYearAgo.toISOString()

    // Helper to compute average score
    const avg = (rows: { score: number | string | null }[]) => {
      const nums = rows.map(r => Number(r.score || 0)).filter(n => !Number.isNaN(n))
      if (nums.length === 0) return 0
      const mean0to1 = nums.reduce((a, b) => a + b, 0) / nums.length
      return Math.round(mean0to1 * 100) // convert from 0–1 to 0–100
    }

    // 1. Get active users from last 12 months
    const { data: users, error: usersError } = await admin
      .from('users')
      .select('id, created_at')
      .eq('is_active', true)
      .gte('created_at', oneYearAgoISO)

    if (usersError) {
      console.error('[Marketing Stats] Error fetching users:', usersError)
      throw usersError
    }

    if (!users || users.length === 0) {
      // Return default values if no users
      return NextResponse.json({
        matchedWithin24hPercent: 0,
        matchedWithin48hPercent: 0,
        avgScoreConfirmedMatches: 0,
        avgScoreAllMatches: 0,
        medianHoursToFirstMatch: 0,
        matchesToChatWithin24hPercent: 0,
        verifiedUsersPercent: 0,
        universitiesCount: 0,
        programmesCount: 0,
        generatedAt: new Date().toISOString(),
      } as MarketingStatsResponse)
    }

    const userIds = users.map(u => u.id)

    // 2. Get all matches for these users
    // Query matches where either a_user or b_user is in our user list
    const { data: matchesA, error: matchesAError } = await admin
      .from('matches')
      .select('a_user, b_user, created_at, score, status')
      .in('a_user', userIds)
      .gte('created_at', oneYearAgoISO)

    const { data: matchesB, error: matchesBError } = await admin
      .from('matches')
      .select('a_user, b_user, created_at, score, status')
      .in('b_user', userIds)
      .gte('created_at', oneYearAgoISO)

    if (matchesAError || matchesBError) {
      console.error('[Marketing Stats] Error fetching matches:', matchesAError || matchesBError)
      throw matchesAError || matchesBError
    }

    // Combine and deduplicate matches (a match could appear in both queries)
    type MatchRow = { a_user: string; b_user: string; created_at: string; score: number | string | null; status: string }
    const matchMap = new Map<string, MatchRow>()
    ;[...(matchesA || []), ...(matchesB || [])].forEach(match => {
      const key = `${match.a_user}:${match.b_user}`
      if (!matchMap.has(key)) {
        matchMap.set(key, match)
      }
    })
    const matches = Array.from(matchMap.values())

    // 3. Compute match timing metrics
    const userFirstMatchMap = new Map<string, Date>()
    const userDelays: number[] = []

    matches?.forEach(match => {
      const matchDate = new Date(match.created_at)
      const aUser = match.a_user
      const bUser = match.b_user

      // Track first match for each user
      if (userIds.includes(aUser)) {
        const existing = userFirstMatchMap.get(aUser)
        if (!existing || matchDate < existing) {
          userFirstMatchMap.set(aUser, matchDate)
        }
      }
      if (userIds.includes(bUser)) {
        const existing = userFirstMatchMap.get(bUser)
        if (!existing || matchDate < existing) {
          userFirstMatchMap.set(bUser, matchDate)
        }
      }
    })

    // Compute delays for users with matches
    users.forEach(user => {
      const firstMatch = userFirstMatchMap.get(user.id)
      if (firstMatch) {
        const userCreated = new Date(user.created_at)
        const delayMs = firstMatch.getTime() - userCreated.getTime()
        const delayHours = delayMs / (1000 * 60 * 60)
        if (delayHours >= 0) {
          userDelays.push(delayHours)
        }
      }
    })

    // Count users matched within 24h/48h
    const matchedWithin24h = userDelays.filter(h => h <= 24).length
    const matchedWithin48h = userDelays.filter(h => h <= 48).length
    const eligibleUsers = userDelays.length

    const matchedWithin24hPercent = eligibleUsers > 0
      ? Math.round((matchedWithin24h / eligibleUsers) * 100)
      : 0
    const matchedWithin48hPercent = eligibleUsers > 0
      ? Math.round((matchedWithin48h / eligibleUsers) * 100)
      : 0

    // Compute median hours to first match
    let medianHoursToFirstMatch = 0
    if (userDelays.length > 0) {
      const sorted = [...userDelays].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      medianHoursToFirstMatch = sorted.length % 2 === 0
        ? Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1))
        : Number(sorted[mid].toFixed(1))
    }

    // 4. Compute average scores
    const allMatches = matches || []
    const avgScoreAllMatches = avg(allMatches)

    const confirmedMatches = allMatches.filter(m => m.status === 'accepted')
    const avgScoreConfirmedMatches = avg(confirmedMatches)

    // 5. Compute matches to chat conversion
    const { data: chats, error: chatsError } = await admin
      .from('chats')
      .select('id, is_group, created_at')
      .eq('is_group', false)
      .gte('created_at', oneYearAgoISO)

    if (chatsError) {
      console.error('[Marketing Stats] Error fetching chats:', chatsError)
      throw chatsError
    }

    // Get chat members for 1:1 chats
    const chatIds = chats?.map(c => c.id) || []
    const { data: chatMembers, error: chatMembersError } = chatIds.length > 0
      ? await admin
          .from('chat_members')
          .select('chat_id, user_id')
          .in('chat_id', chatIds)
      : { data: [], error: null }

    if (chatMembersError) {
      console.error('[Marketing Stats] Error fetching chat members:', chatMembersError)
      throw chatMembersError
    }

    // Build map of chat pairs
    type PairKey = `${string}:${string}`
    const chatPairs = new Map<PairKey, { created_at: string }>()

    chats?.forEach(chat => {
      const members = chatMembers?.filter(cm => cm.chat_id === chat.id) || []
      if (members.length === 2) {
        const [id1, id2] = members.map(m => m.user_id).sort()
        const key: PairKey = `${id1}:${id2}`
        chatPairs.set(key, { created_at: chat.created_at })
      }
    })

    // Count matches that turned into chats within 24h
    let matchesWithChat24h = 0
    const totalMatches = allMatches.length

    allMatches.forEach(match => {
      const key: PairKey = match.a_user < match.b_user
        ? `${match.a_user}:${match.b_user}`
        : `${match.b_user}:${match.a_user}`
      
      const chat = chatPairs.get(key)
      if (chat) {
        const matchDate = new Date(match.created_at)
        const chatDate = new Date(chat.created_at)
        const hoursDiff = (chatDate.getTime() - matchDate.getTime()) / (1000 * 60 * 60)
        if (hoursDiff >= 0 && hoursDiff <= 24) {
          matchesWithChat24h++
        }
      }
    })

    const matchesToChatWithin24hPercent = totalMatches > 0
      ? Math.round((matchesWithChat24h / totalMatches) * 100)
      : 0

    // 6. Compute verified users percentage
    // Get total active users (not just last 12 months for verification stat)
    const { count: totalUsers, error: totalUsersError } = await admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (totalUsersError) {
      console.error('[Marketing Stats] Error counting total users:', totalUsersError)
      throw totalUsersError
    }

    // Get verified profiles
    const { data: verifiedProfiles, error: verifiedProfilesError } = await admin
      .from('profiles')
      .select('user_id')
      .eq('verification_status', 'verified')

    if (verifiedProfilesError) {
      console.error('[Marketing Stats] Error fetching verified profiles:', verifiedProfilesError)
      throw verifiedProfilesError
    }

    // Get users with email confirmed (using auth.admin.listUsers)
    let emailVerifiedUserIds = new Set<string>()
    try {
      const { data: authUsers, error: authError } = await admin.auth.admin.listUsers()
      if (!authError && authUsers?.users) {
        authUsers.users.forEach(u => {
          if (u.email_confirmed_at) {
            emailVerifiedUserIds.add(u.id)
          }
        })
      }
    } catch (authErr) {
      console.warn('[Marketing Stats] Could not fetch auth users, using profiles only:', authErr)
    }

    const verifiedSet = new Set<string>()
    verifiedProfiles?.forEach(p => verifiedSet.add(p.user_id))
    emailVerifiedUserIds.forEach(id => verifiedSet.add(id))

    const verifiedUsersPercent = totalUsers && totalUsers > 0
      ? Math.round((verifiedSet.size / totalUsers) * 100)
      : 0

    // 7. Compute universities and programmes count
    const { data: academicData, error: academicError } = await admin
      .from('user_academic')
      .select('university_id, program_id')
      .not('university_id', 'is', null)

    if (academicError) {
      console.error('[Marketing Stats] Error fetching academic data:', academicError)
      throw academicError
    }

    const universitiesSet = new Set<string>()
    const programmesSet = new Set<string>()

    academicData?.forEach(row => {
      if (row.university_id) {
        universitiesSet.add(row.university_id)
      }
      if (row.program_id) {
        programmesSet.add(row.program_id)
      }
    })

    const universitiesCount = universitiesSet.size
    const programmesCount = programmesSet.size

    const response: MarketingStatsResponse = {
      matchedWithin24hPercent,
      matchedWithin48hPercent,
      avgScoreConfirmedMatches,
      avgScoreAllMatches,
      medianHoursToFirstMatch,
      matchesToChatWithin24hPercent,
      verifiedUsersPercent,
      universitiesCount,
      programmesCount,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Marketing Stats] Error computing stats:', error)
    return NextResponse.json(
      { error: 'Failed to compute marketing stats' },
      { status: 500 }
    )
  }
}

