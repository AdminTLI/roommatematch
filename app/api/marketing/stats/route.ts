import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

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

    safeLogger.debug('[Marketing Stats] Starting stats calculation...')
    safeLogger.debug('[Marketing Stats] Time window: last 12 months from', oneYearAgoISO)

    // Helper to compute average score. fit_score in DB is DECIMAL(4,3) 0.000-1.000;
    // normalize any value > 1 as 0-100 scale so we always output 0-100.
    const toZeroToOne = (n: number) => (n > 1 ? n / 100 : n)
    const avg = (rows: { fit_score: number | string | null }[]) => {
      const nums = rows
        .map(r => {
          const num = Number(r.fit_score || 0)
          if (Number.isNaN(num)) return null
          return toZeroToOne(num)
        })
        .filter((n): n is number => n !== null)

      if (nums.length === 0) {
        safeLogger.debug('[Marketing Stats] No valid scores found in avg calculation')
        return 0
      }

      const mean0to1 = nums.reduce((a, b) => a + b, 0) / nums.length
      const result = Math.round(mean0to1 * 100)
      safeLogger.debug('[Marketing Stats] Score calculation:', {
        count: nums.length,
        sampleScores: nums.slice(0, 5),
        mean0to1,
        result
      })
      return result
    }

    // 1. Get ALL active users (no time restriction)
    safeLogger.debug('[Marketing Stats] Fetching all active users...')
    const { data: users, error: usersError } = await admin
      .from('users')
      .select('id, created_at')
      .eq('is_active', true)

    if (usersError) {
      console.error('[Marketing Stats] Error fetching users:', usersError)
      throw usersError
    }

    safeLogger.debug('[Marketing Stats] Found users:', users?.length || 0)

    if (!users || users.length === 0) {
      safeLogger.debug('[Marketing Stats] No active users found, returning default values')
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
    safeLogger.debug('[Marketing Stats] User IDs sample:', userIds.slice(0, 5))

    // 2. Get all match suggestions from last 12 months (for recent activity stats)
    safeLogger.debug('[Marketing Stats] Fetching match suggestions from last 12 months...')
    const { data: suggestionsRecent, error: suggestionsError } = await admin
      .from('match_suggestions')
      .select('id, member_ids, created_at, fit_score, status, expires_at')
      .eq('kind', 'pair')
      .in('status', ['pending', 'accepted', 'confirmed'])
      .gte('created_at', oneYearAgoISO)
      .gte('expires_at', oneYearAgoISO) // Filter out expired suggestions (expires_at must be in future)

    if (suggestionsError) {
      console.error('[Marketing Stats] Error fetching match suggestions:', suggestionsError)
      throw suggestionsError
    }

    safeLogger.debug('[Marketing Stats] Found match suggestions (last 12 months):', suggestionsRecent?.length || 0)
    if (suggestionsRecent && suggestionsRecent.length > 0) {
      safeLogger.debug('[Marketing Stats] Sample suggestion:', {
        id: suggestionsRecent[0].id,
        member_ids: suggestionsRecent[0].member_ids,
        fit_score: suggestionsRecent[0].fit_score,
        status: suggestionsRecent[0].status,
        created_at: suggestionsRecent[0].created_at
      })
    }

    const suggestions = suggestionsRecent || []

    // 3. Compute match timing metrics
    // Find first match suggestion for each user (regardless of when user signed up)
    safeLogger.debug('[Marketing Stats] Computing match timing metrics...')
    const userFirstMatchMap = new Map<string, Date>()
    const userDelays: number[] = []

    // Get ALL match suggestions (not just last 12 months) to find first match for each user
    // Query suggestions where user is in member_ids array
    safeLogger.debug('[Marketing Stats] Fetching all match suggestions to find first match per user...')
    
    // Query all pair suggestions where any user in our list is a member
    // Use GIN index on member_ids for efficient querying
    const { data: allSuggestions, error: allSuggestionsError } = await admin
      .from('match_suggestions')
      .select('id, member_ids, created_at, expires_at')
      .eq('kind', 'pair')
      .in('status', ['pending', 'accepted', 'confirmed'])
      .gte('expires_at', oneYearAgoISO) // Only non-expired suggestions

    if (allSuggestionsError) {
      console.warn('[Marketing Stats] Error fetching all suggestions, using recent suggestions only:', allSuggestionsError)
    }

    safeLogger.debug('[Marketing Stats] Found all match suggestions:', allSuggestions?.length || 0)

    // Track first match for each user from all suggestions
    ;(allSuggestions || suggestions).forEach(suggestion => {
      const matchDate = new Date(suggestion.created_at)
      const memberIds = suggestion.member_ids as string[]
      
      if (!memberIds || memberIds.length !== 2) {
        return // Skip invalid pairs
      }

      // Track first match for each user in the pair
      memberIds.forEach(userId => {
        if (userIds.includes(userId)) {
          const existing = userFirstMatchMap.get(userId)
          if (!existing || matchDate < existing) {
            userFirstMatchMap.set(userId, matchDate)
          }
        }
      })
    })

    safeLogger.debug('[Marketing Stats] Users with matches:', userFirstMatchMap.size)

    // Compute delays for users with matches (only for users who got their first match in last 12 months)
    users.forEach(user => {
      const firstMatch = userFirstMatchMap.get(user.id)
      if (firstMatch) {
        // Only include if first match was in last 12 months
        if (firstMatch >= oneYearAgo) {
          const userCreated = new Date(user.created_at)
          const delayMs = firstMatch.getTime() - userCreated.getTime()
          const delayHours = delayMs / (1000 * 60 * 60)
          if (delayHours >= 0) {
            userDelays.push(delayHours)
          }
        }
      }
    })

    safeLogger.debug('[Marketing Stats] Users with matches in last 12 months:', userDelays.length)
    if (userDelays.length > 0) {
      safeLogger.debug('[Marketing Stats] Sample delays (hours):', userDelays.slice(0, 10))
    }

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
    safeLogger.debug('[Marketing Stats] Computing average scores...')
    const suggestionsForScores = suggestions || []
    safeLogger.debug('[Marketing Stats] Total suggestions for score calculation:', suggestionsForScores.length)
    
    const avgScoreAllMatches = avg(suggestionsForScores)
    safeLogger.debug('[Marketing Stats] Average score (all suggestions):', avgScoreAllMatches)

    // For confirmed matches, check both match_suggestions with status='confirmed' and match_records with locked=true
    const confirmedSuggestions = suggestionsForScores.filter(s => s.status === 'confirmed')
    safeLogger.debug('[Marketing Stats] Confirmed suggestions:', confirmedSuggestions.length)
    
    // Also check match_records for locked/confirmed matches
    // Note: match_records table may not exist in all environments (e.g., if migration hasn't run)
    // If it doesn't exist, we'll gracefully fall back to using only match_suggestions
    let lockedRecords: any[] | null = null
    try {
      const { data, error: recordsError } = await admin
        .from('match_records')
        .select('fit_score, user_ids, created_at')
        .eq('kind', 'pair')
        .eq('locked', true)
        .gte('created_at', oneYearAgoISO)

      if (recordsError) {
        // Check if it's a table-not-found error (PGRST205)
        if (recordsError.code === 'PGRST205' || recordsError.message?.includes('Could not find the table')) {
          safeLogger.debug('[Marketing Stats] match_records table not found, skipping locked records query')
        } else {
          console.warn('[Marketing Stats] Error fetching match_records:', recordsError)
        }
      } else {
        lockedRecords = data
      }
    } catch (error) {
      // Handle any unexpected errors gracefully
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('match_records') || errorMessage.includes('PGRST205')) {
        safeLogger.debug('[Marketing Stats] match_records table not available, using match_suggestions only')
      } else {
        console.warn('[Marketing Stats] Unexpected error fetching match_records:', error)
      }
    }

    safeLogger.debug('[Marketing Stats] Locked match records:', lockedRecords?.length || 0)
    
    // Combine confirmed suggestions and locked records; dedupe by pair so the same pair
    // (from both match_suggestions and match_records) is only counted once
    const pairToScore = new Map<string, number>()
    const toPairKey = (ids: string[] | null) => ids && ids.length === 2 ? [...ids].sort().join(':') : null
    confirmedSuggestions.forEach(s => {
      const key = toPairKey((s.member_ids as string[]) || null)
      if (key != null) {
        const n = Number(s.fit_score ?? 0)
        if (!Number.isNaN(n)) pairToScore.set(key, n)
      }
    })
    ;(lockedRecords || []).forEach((r: { user_ids?: string[]; fit_score?: unknown }) => {
      const key = toPairKey((r.user_ids as string[]) || null)
      if (key != null && !pairToScore.has(key)) {
        const n = Number(r.fit_score ?? 0)
        if (!Number.isNaN(n)) pairToScore.set(key, n)
      }
    })
    const allConfirmed = Array.from(pairToScore.values()).map(fit_score => ({ fit_score }))

    const avgScoreConfirmedMatches = avg(allConfirmed)
    safeLogger.debug('[Marketing Stats] Average score (confirmed matches):', avgScoreConfirmedMatches)

    // 5. Compute matches to chat conversion
    // Don't rely on chats.match_id (it's null). Instead, match by user pairs
    safeLogger.debug('[Marketing Stats] Computing chat conversion metrics...')
    
    // Get confirmed suggestions and locked records for chat conversion; dedupe by pair
    // so the same pair (from both match_suggestions and match_records) is only counted once
    const pairToMatch = new Map<
      string,
      { id: string; member_ids: string[]; created_at: string }
    >()
    suggestions
      .filter(s => s.status === 'confirmed')
      .forEach(s => {
        const ids = (s.member_ids as string[]) || []
        const key = ids.length === 2 ? [...ids].sort().join(':') : null
        if (key && !pairToMatch.has(key)) {
          pairToMatch.set(key, {
            id: s.id,
            member_ids: ids,
            created_at: s.created_at
          })
        }
      })
    ;(lockedRecords || []).forEach((r: { id?: string; user_ids?: string[]; created_at?: string }) => {
      const ids = (r.user_ids as string[]) || []
      const key = ids.length === 2 ? [...ids].sort().join(':') : null
      if (key && !pairToMatch.has(key)) {
        pairToMatch.set(key, {
          id: (r.id as string) || '',
          member_ids: ids,
          created_at: (r.created_at as string) || ''
        })
      }
    })
    const confirmedForChat = Array.from(pairToMatch.values())

    safeLogger.debug('[Marketing Stats] Confirmed matches for chat lookup (deduped):', confirmedForChat.length)

    let matchesWithChat24h = 0

    if (confirmedForChat.length === 0) {
      safeLogger.debug('[Marketing Stats] No confirmed matches found, skipping chat conversion calculation')
    } else {
      // Get all chat members to find 1:1 chats between matched users
      const { data: allChatMembers, error: chatMembersError } = await admin
        .from('chat_members')
        .select('chat_id, user_id')

      if (chatMembersError) {
        console.error('[Marketing Stats] Error fetching chat members:', chatMembersError)
        throw chatMembersError
      }

      // Get all 1:1 chats (non-group chats)
      const { data: allChats, error: chatsError } = await admin
        .from('chats')
        .select('id, is_group')
        .eq('is_group', false)

      if (chatsError) {
        console.error('[Marketing Stats] Error fetching chats:', chatsError)
        throw chatsError
      }

      const chatIds = allChats?.map(c => c.id) || []
      safeLogger.debug('[Marketing Stats] Found 1:1 chats:', chatIds.length)

      // Build map of chat_id -> [user1, user2] pairs
      const chatPairs = new Map<string, { users: string[], chatId: string }>()
      chatIds.forEach(chatId => {
        const members = allChatMembers?.filter(cm => cm.chat_id === chatId) || []
        if (members.length === 2) {
          const userIds = members.map(m => m.user_id).sort()
          const pairKey = `${userIds[0]}:${userIds[1]}`
          chatPairs.set(pairKey, { users: userIds, chatId })
        }
      })

      safeLogger.debug('[Marketing Stats] Found chat pairs:', chatPairs.size)

      // Get first message for each chat (batch query for efficiency)
      const chatIdsList = Array.from(new Set(Array.from(chatPairs.values()).map(cp => cp.chatId)))
      const { data: firstMessages, error: msgError } = chatIdsList.length > 0
        ? await admin
            .from('messages')
            .select('chat_id, created_at')
            .in('chat_id', chatIdsList)
            .order('created_at', { ascending: true })
        : { data: [], error: null }

      if (msgError) {
        console.warn('[Marketing Stats] Error fetching first messages:', msgError)
      }

      // Build map of chat_id -> first message timestamp
      const chatToFirstMessage = new Map<string, Date>()
      const messageMap = new Map<string, Date>()
      firstMessages?.forEach(msg => {
        const existing = messageMap.get(msg.chat_id)
        if (!existing || new Date(msg.created_at) < existing) {
          messageMap.set(msg.chat_id, new Date(msg.created_at))
        }
      })
      messageMap.forEach((date, chatId) => {
        chatToFirstMessage.set(chatId, date)
      })

      safeLogger.debug('[Marketing Stats] Chats with first messages:', chatToFirstMessage.size)

      // For each confirmed match, find corresponding chat and check first message timing
      for (const match of confirmedForChat) {
        const memberIds = match.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) continue

        const [userA, userB] = memberIds.sort()
        const pairKey = `${userA}:${userB}`
        const chatPair = chatPairs.get(pairKey)

        if (chatPair) {
          const firstMessageAt = chatToFirstMessage.get(chatPair.chatId)
          if (firstMessageAt) {
            const matchDate = new Date(match.created_at)
            const hoursDiff = (firstMessageAt.getTime() - matchDate.getTime()) / (1000 * 60 * 60)
            if (hoursDiff >= 0 && hoursDiff <= 24) {
              matchesWithChat24h++
            }
          }
        }
      }

      safeLogger.debug('[Marketing Stats] Matches with first message within 24h:', matchesWithChat24h)
      safeLogger.debug('[Marketing Stats] Total confirmed matches:', confirmedForChat.length)
    }

    const matchesToChatWithin24hPercent = confirmedForChat.length > 0
      ? Math.round((matchesWithChat24h / confirmedForChat.length) * 100)
      : 0
    safeLogger.debug('[Marketing Stats] Chat conversion percentage:', matchesToChatWithin24hPercent)

    // 6. Compute verified users percentage
    safeLogger.debug('[Marketing Stats] Computing verified users percentage...')
    // Get total active users (not just last 12 months for verification stat)
    const { count: totalUsers, error: totalUsersError } = await admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (totalUsersError) {
      console.error('[Marketing Stats] Error counting total users:', totalUsersError)
      throw totalUsersError
    }

    safeLogger.debug('[Marketing Stats] Total active users:', totalUsers)

    // Get verified profiles
    const { data: verifiedProfiles, error: verifiedProfilesError } = await admin
      .from('profiles')
      .select('user_id')
      .eq('verification_status', 'verified')

    if (verifiedProfilesError) {
      console.error('[Marketing Stats] Error fetching verified profiles:', verifiedProfilesError)
      throw verifiedProfilesError
    }

    safeLogger.debug('[Marketing Stats] Verified profiles:', verifiedProfiles?.length || 0)

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
        safeLogger.debug('[Marketing Stats] Email verified users:', emailVerifiedUserIds.size)
      }
    } catch (authErr) {
      console.warn('[Marketing Stats] Could not fetch auth users, using profiles only:', authErr)
    }

    const verifiedSet = new Set<string>()
    verifiedProfiles?.forEach(p => verifiedSet.add(p.user_id))
    emailVerifiedUserIds.forEach(id => verifiedSet.add(id))

    safeLogger.debug('[Marketing Stats] Total verified users (profile + email):', verifiedSet.size)

    const verifiedUsersPercent = totalUsers && totalUsers > 0
      ? Math.round((verifiedSet.size / totalUsers) * 100)
      : 0
    safeLogger.debug('[Marketing Stats] Verified users percentage:', verifiedUsersPercent)

    // 7. Compute universities and programmes count
    safeLogger.debug('[Marketing Stats] Computing universities and programmes count...')
    const { data: academicData, error: academicError } = await admin
      .from('user_academic')
      .select('university_id, program_id')
      .not('university_id', 'is', null)

    if (academicError) {
      console.error('[Marketing Stats] Error fetching academic data:', academicError)
      throw academicError
    }

    safeLogger.debug('[Marketing Stats] Academic records:', academicData?.length || 0)

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
    safeLogger.debug('[Marketing Stats] Universities count:', universitiesCount)
    safeLogger.debug('[Marketing Stats] Programmes count:', programmesCount)

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

    safeLogger.debug('[Marketing Stats] Final response:', JSON.stringify(response, null, 2))
    safeLogger.debug('[Marketing Stats] Stats calculation completed successfully')

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Marketing Stats] Error computing stats:', error)
    return NextResponse.json(
      { error: 'Failed to compute marketing stats' },
      { status: 500 }
    )
  }
}

