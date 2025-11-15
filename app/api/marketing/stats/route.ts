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

    console.log('[Marketing Stats] Starting stats calculation...')
    console.log('[Marketing Stats] Time window: last 12 months from', oneYearAgoISO)

    // Helper to compute average score
    const avg = (rows: { score: number | string | null }[]) => {
      const nums = rows.map(r => {
        const num = Number(r.score || 0)
        if (Number.isNaN(num)) return null
        return num
      }).filter(n => n !== null) as number[]
      
      if (nums.length === 0) {
        console.log('[Marketing Stats] No valid scores found in avg calculation')
        return 0
      }
      
      // Scores are stored as DECIMAL(4,3) in range 0.000-1.000, convert to 0-100
      const mean0to1 = nums.reduce((a, b) => a + b, 0) / nums.length
      const result = Math.round(mean0to1 * 100)
      console.log('[Marketing Stats] Score calculation:', {
        count: nums.length,
        sampleScores: nums.slice(0, 5),
        mean0to1,
        result
      })
      return result
    }

    // 1. Get ALL active users (no time restriction)
    console.log('[Marketing Stats] Fetching all active users...')
    const { data: users, error: usersError } = await admin
      .from('users')
      .select('id, created_at')
      .eq('is_active', true)

    if (usersError) {
      console.error('[Marketing Stats] Error fetching users:', usersError)
      throw usersError
    }

    console.log('[Marketing Stats] Found users:', users?.length || 0)

    if (!users || users.length === 0) {
      console.log('[Marketing Stats] No active users found, returning default values')
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
    console.log('[Marketing Stats] User IDs sample:', userIds.slice(0, 5))

    // 2. Get all matches from last 12 months (for recent activity stats)
    console.log('[Marketing Stats] Fetching matches from last 12 months...')
    const { data: matchesRecent, error: matchesError } = await admin
      .from('matches')
      .select('id, a_user, b_user, created_at, score, status')
      .gte('created_at', oneYearAgoISO)

    if (matchesError) {
      console.error('[Marketing Stats] Error fetching matches:', matchesError)
      throw matchesError
    }

    console.log('[Marketing Stats] Found matches (last 12 months):', matchesRecent?.length || 0)
    if (matchesRecent && matchesRecent.length > 0) {
      console.log('[Marketing Stats] Sample match:', {
        id: matchesRecent[0].id,
        a_user: matchesRecent[0].a_user,
        b_user: matchesRecent[0].b_user,
        score: matchesRecent[0].score,
        status: matchesRecent[0].status,
        created_at: matchesRecent[0].created_at
      })
    }

    const matches = matchesRecent || []

    // 3. Compute match timing metrics
    // Find first match for each user (regardless of when user signed up)
    console.log('[Marketing Stats] Computing match timing metrics...')
    const userFirstMatchMap = new Map<string, Date>()
    const userDelays: number[] = []

    // Get ALL matches (not just last 12 months) to find first match for each user
    // Query matches where either a_user or b_user is in our user list
    console.log('[Marketing Stats] Fetching all matches to find first match per user...')
    
    // Split into two queries since Supabase .or() with .in() can be problematic
    const { data: allMatchesA, error: allMatchesAError } = await admin
      .from('matches')
      .select('a_user, b_user, created_at')
      .in('a_user', userIds)

    const { data: allMatchesB, error: allMatchesBError } = await admin
      .from('matches')
      .select('a_user, b_user, created_at')
      .in('b_user', userIds)

    if (allMatchesAError || allMatchesBError) {
      console.warn('[Marketing Stats] Error fetching all matches, using recent matches only:', allMatchesAError || allMatchesBError)
    }

    // Combine and deduplicate
    const allMatchesForTiming = new Map<string, { a_user: string; b_user: string; created_at: string }>()
    ;[...(allMatchesA || []), ...(allMatchesB || [])].forEach(match => {
      const key = `${match.a_user}:${match.b_user}`
      if (!allMatchesForTiming.has(key)) {
        allMatchesForTiming.set(key, match)
      }
    })
    const allMatchesArray = Array.from(allMatchesForTiming.values())
    
    console.log('[Marketing Stats] Found all matches:', allMatchesArray.length)

    // Track first match for each user from all matches
    allMatchesArray.forEach(match => {
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

    console.log('[Marketing Stats] Users with matches:', userFirstMatchMap.size)

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

    console.log('[Marketing Stats] Users with matches in last 12 months:', userDelays.length)
    if (userDelays.length > 0) {
      console.log('[Marketing Stats] Sample delays (hours):', userDelays.slice(0, 10))
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
    console.log('[Marketing Stats] Computing average scores...')
    const matchesForScores = matches || []
    console.log('[Marketing Stats] Total matches for score calculation:', matchesForScores.length)
    
    const avgScoreAllMatches = avg(matchesForScores)
    console.log('[Marketing Stats] Average score (all matches):', avgScoreAllMatches)

    const confirmedMatches = matchesForScores.filter(m => m.status === 'accepted')
    console.log('[Marketing Stats] Confirmed matches (accepted):', confirmedMatches.length)
    const avgScoreConfirmedMatches = avg(confirmedMatches)
    console.log('[Marketing Stats] Average score (confirmed matches):', avgScoreConfirmedMatches)

    // 5. Compute matches to chat conversion
    // Use match_id field in chats table to find chats associated with matches
    console.log('[Marketing Stats] Computing chat conversion metrics...')
    
    const matchIds = matches.map(m => m.id)
    console.log('[Marketing Stats] Match IDs for chat lookup:', matchIds.length)

    let matchesWithChat24h = 0

    if (matchIds.length === 0) {
      console.log('[Marketing Stats] No matches found, skipping chat conversion calculation')
    } else {
      // Get chats associated with matches (using match_id field)
      const { data: chats, error: chatsError } = await admin
        .from('chats')
        .select('id, match_id, first_message_at, created_at')
        .eq('is_group', false)
        .in('match_id', matchIds)

      if (chatsError) {
        console.error('[Marketing Stats] Error fetching chats:', chatsError)
        throw chatsError
      }

      console.log('[Marketing Stats] Found chats with match_id:', chats?.length || 0)

      // Build map of match_id -> first_message_at
      const matchToFirstMessage = new Map<string, Date>()
      chats?.forEach(chat => {
        if (chat.match_id && chat.first_message_at) {
          matchToFirstMessage.set(chat.match_id, new Date(chat.first_message_at))
        }
      })

      console.log('[Marketing Stats] Matches with first message:', matchToFirstMessage.size)

      // Count matches that had first message within 24h of match creation
      const totalMatches = matches.length

      matches.forEach(match => {
        const firstMessageAt = matchToFirstMessage.get(match.id)
        if (firstMessageAt) {
          const matchDate = new Date(match.created_at)
          const hoursDiff = (firstMessageAt.getTime() - matchDate.getTime()) / (1000 * 60 * 60)
          if (hoursDiff >= 0 && hoursDiff <= 24) {
            matchesWithChat24h++
          }
        }
      })

      console.log('[Marketing Stats] Matches with first message within 24h:', matchesWithChat24h)
      console.log('[Marketing Stats] Total matches:', totalMatches)
    }

    const matchesToChatWithin24hPercent = matches.length > 0
      ? Math.round((matchesWithChat24h / matches.length) * 100)
      : 0
    console.log('[Marketing Stats] Chat conversion percentage:', matchesToChatWithin24hPercent)

    // 6. Compute verified users percentage
    console.log('[Marketing Stats] Computing verified users percentage...')
    // Get total active users (not just last 12 months for verification stat)
    const { count: totalUsers, error: totalUsersError } = await admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (totalUsersError) {
      console.error('[Marketing Stats] Error counting total users:', totalUsersError)
      throw totalUsersError
    }

    console.log('[Marketing Stats] Total active users:', totalUsers)

    // Get verified profiles
    const { data: verifiedProfiles, error: verifiedProfilesError } = await admin
      .from('profiles')
      .select('user_id')
      .eq('verification_status', 'verified')

    if (verifiedProfilesError) {
      console.error('[Marketing Stats] Error fetching verified profiles:', verifiedProfilesError)
      throw verifiedProfilesError
    }

    console.log('[Marketing Stats] Verified profiles:', verifiedProfiles?.length || 0)

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
        console.log('[Marketing Stats] Email verified users:', emailVerifiedUserIds.size)
      }
    } catch (authErr) {
      console.warn('[Marketing Stats] Could not fetch auth users, using profiles only:', authErr)
    }

    const verifiedSet = new Set<string>()
    verifiedProfiles?.forEach(p => verifiedSet.add(p.user_id))
    emailVerifiedUserIds.forEach(id => verifiedSet.add(id))

    console.log('[Marketing Stats] Total verified users (profile + email):', verifiedSet.size)

    const verifiedUsersPercent = totalUsers && totalUsers > 0
      ? Math.round((verifiedSet.size / totalUsers) * 100)
      : 0
    console.log('[Marketing Stats] Verified users percentage:', verifiedUsersPercent)

    // 7. Compute universities and programmes count
    console.log('[Marketing Stats] Computing universities and programmes count...')
    const { data: academicData, error: academicError } = await admin
      .from('user_academic')
      .select('university_id, program_id')
      .not('university_id', 'is', null)

    if (academicError) {
      console.error('[Marketing Stats] Error fetching academic data:', academicError)
      throw academicError
    }

    console.log('[Marketing Stats] Academic records:', academicData?.length || 0)

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
    console.log('[Marketing Stats] Universities count:', universitiesCount)
    console.log('[Marketing Stats] Programmes count:', programmesCount)

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

    console.log('[Marketing Stats] Final response:', JSON.stringify(response, null, 2))
    console.log('[Marketing Stats] Stats calculation completed successfully')

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Marketing Stats] Error computing stats:', error)
    return NextResponse.json(
      { error: 'Failed to compute marketing stats' },
      { status: 500 }
    )
  }
}

