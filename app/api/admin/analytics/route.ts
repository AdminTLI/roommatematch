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

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Determine if we should filter by university
    const isSuperAdmin = adminRecord.role === 'super_admin'
    const universityId = isSuperAdmin ? null : adminRecord.university_id

    // Get university user IDs once (cached for all queries)
    let universityUserIds: Set<string> | null = null
    if (universityId) {
      const { data: academic } = await admin
        .from('user_academic')
        .select('user_id')
        .eq('university_id', universityId)
      
      universityUserIds = new Set(academic?.map(a => a.user_id) || [])
    }

    // 1. Total Users - count active users
    let totalUsersQuery = admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (universityId && universityUserIds) {
      if (universityUserIds.size > 0) {
        totalUsersQuery = totalUsersQuery.in('id', Array.from(universityUserIds))
      } else {
        // No users in this university
        totalUsersQuery = totalUsersQuery.eq('id', '00000000-0000-0000-0000-000000000000') // Impossible ID
      }
    }

    const { count: totalUsers } = await totalUsersQuery

    // 2. Verified Users - count verified profiles
    let verifiedUsersQuery = admin
      .from('profiles')
      .select('user_id', { count: 'exact', head: true })
      .eq('verification_status', 'verified')

    if (universityId && universityUserIds) {
      if (universityUserIds.size > 0) {
        verifiedUsersQuery = verifiedUsersQuery.in('user_id', Array.from(universityUserIds))
      } else {
        verifiedUsersQuery = verifiedUsersQuery.eq('user_id', '00000000-0000-0000-0000-000000000000')
      }
    }

    const { count: verifiedUsers } = await verifiedUsersQuery

    // 3. Active Chats - chats with messages in last 24 hours
    const { data: recentMessages } = await admin
      .from('messages')
      .select('chat_id')
      .gte('created_at', oneDayAgo.toISOString())

    const activeChatIds = new Set(recentMessages?.map(m => m.chat_id) || [])
    
    // If university filter, check if chat members are from that university
    let activeChats = activeChatIds.size
    if (universityId && universityUserIds && activeChatIds.size > 0) {
      const { data: chatMembers } = await admin
        .from('chat_members')
        .select('chat_id, user_id')
        .in('chat_id', Array.from(activeChatIds))
      
      const chatsWithUniversityUsers = new Set<string>()
      chatMembers?.forEach(cm => {
        if (universityUserIds.has(cm.user_id)) {
          chatsWithUniversityUsers.add(cm.chat_id)
        }
      })
      activeChats = chatsWithUniversityUsers.size
    }

    // 4. Total Matches - all matches (not just active), deduplicated by unique pairs
    let allMatchesQuery = admin
      .from('match_suggestions')
      .select('id, member_ids, accepted_by, status, kind, expires_at, created_at')
      .eq('kind', 'pair') // Only count pair matches for total

    if (universityId && universityUserIds && universityUserIds.size === 0) {
      allMatchesQuery = allMatchesQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }

    const { data: allMatches } = await allMatchesQuery

    // Deduplicate matches by unique pairs
    const uniquePairs = new Set<string>()
    let totalMatches = 0
    if (allMatches) {
      allMatches.forEach(match => {
        if (!match.member_ids || !Array.isArray(match.member_ids)) return
        
        // Filter by university if needed
        if (universityId && universityUserIds) {
          const allFromUniversity = match.member_ids.every(id => 
            universityUserIds.has(id)
          )
          if (!allFromUniversity) return
        }

        // Create unique key for pair
        const sortedIds = [...match.member_ids].sort().join('-')
        if (!uniquePairs.has(sortedIds)) {
          uniquePairs.add(sortedIds)
          totalMatches++
        }
      })
    }

    // 5. Reports Pending - check both 'open' and 'pending' status
    let reportsQuery = admin
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .in('status', ['open', 'pending'])

    const { count: reportsPending } = await reportsQuery

    // 6. Signups Last 7 Days
    let signups7dQuery = admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', sevenDaysAgo.toISOString())

    if (universityId && universityUserIds) {
      if (universityUserIds.size > 0) {
        signups7dQuery = signups7dQuery.in('id', Array.from(universityUserIds))
      } else {
        signups7dQuery = signups7dQuery.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    }

    const { count: signupsLast7Days } = await signups7dQuery

    // 7. Signups Last 30 Days
    let signups30dQuery = admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (universityId && universityUserIds) {
      if (universityUserIds.size > 0) {
        signups30dQuery = signups30dQuery.in('id', Array.from(universityUserIds))
      } else {
        signups30dQuery = signups30dQuery.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    }

    const { count: signupsLast30Days } = await signups30dQuery

    // 8. Match Activity (matches created in last 7 days)
    let matchActivityQuery = admin
      .from('match_suggestions')
      .select('id, member_ids, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .eq('kind', 'pair')

    if (universityId && universityUserIds && universityUserIds.size === 0) {
      matchActivityQuery = matchActivityQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }

    const { data: recentMatches } = await matchActivityQuery

    // Deduplicate recent matches
    const recentUniquePairs = new Set<string>()
    let matchActivity = 0
    if (recentMatches) {
      recentMatches.forEach(match => {
        if (!match.member_ids || !Array.isArray(match.member_ids)) return
        
        if (universityId && universityUserIds) {
          const allFromUniversity = match.member_ids.every(id => 
            universityUserIds.has(id)
          )
          if (!allFromUniversity) return
        }

        const sortedIds = [...match.member_ids].sort().join('-')
        if (!recentUniquePairs.has(sortedIds)) {
          recentUniquePairs.add(sortedIds)
          matchActivity++
        }
      })
    }

    // 9. University Statistics
    // Get all universities
    let universitiesQuery = admin
      .from('universities')
      .select('id, name')

    if (universityId) {
      universitiesQuery = universitiesQuery.eq('id', universityId)
    }

    const { data: universities } = await universitiesQuery
    const universityMap = new Map(universities?.map(u => [u.id, u.name]) || [])

    // Get all user_academic records
    let academicQuery = admin
      .from('user_academic')
      .select('user_id, university_id')

    if (universityId) {
      academicQuery = academicQuery.eq('university_id', universityId)
    }

    const { data: allAcademic } = await academicQuery

    // Get verified user IDs
    const { data: verifiedProfiles } = await admin
      .from('profiles')
      .select('user_id')
      .eq('verification_status', 'verified')

    const verifiedUserIds = new Set(verifiedProfiles?.map(p => p.user_id) || [])

    // Count by university
    const universityCounts = new Map<string, { total: number; verified: number }>()
    allAcademic?.forEach(a => {
      const uniId = a.university_id
      if (!uniId) return
      
      const current = universityCounts.get(uniId) || { total: 0, verified: 0 }
      current.total++
      if (verifiedUserIds.has(a.user_id)) {
        current.verified++
      }
      universityCounts.set(uniId, current)
    })

    const universityStats = Array.from(universityCounts.entries())
      .map(([id, counts]) => ({
        university_name: universityMap.get(id) || 'Unknown',
        total_users: counts.total,
        verified_users: counts.verified
      }))
      .sort((a, b) => b.total_users - a.total_users)
      .slice(0, 10)

    // 10. Program Statistics
    let programStatsQuery = admin
      .from('user_academic')
      .select('user_id, program_id, university_id')

    if (universityId) {
      programStatsQuery = programStatsQuery.eq('university_id', universityId)
    }

    const { data: academicData } = await programStatsQuery

    // Get program and university names
    const programIds = new Set(academicData?.map(a => a.program_id).filter(Boolean) || [])
    const programMap = new Map()
    
    if (programIds.size > 0) {
      const { data: programs } = await admin
        .from('programs')
        .select('id, name')
        .in('id', Array.from(programIds))
      
      programs?.forEach(p => {
        programMap.set(p.id, p.name)
      })
    }

    // Count by program
    const programCounts = new Map<string, { count: number; university_name: string }>()
    academicData?.forEach(a => {
      const progId = a.program_id
      if (!progId) return
      
      const current = programCounts.get(progId) || { count: 0, university_name: universityMap.get(a.university_id) || 'Unknown' }
      current.count++
      programCounts.set(progId, current)
    })

    const programStats = Array.from(programCounts.entries())
      .map(([id, data]) => ({
        program_name: programMap.get(id) || 'Unknown',
        university_name: data.university_name,
        total_users: data.count
      }))
      .sort((a, b) => b.total_users - a.total_users)
      .slice(0, 10)

    // 11. Study Year Distribution
    let studyYearQuery = admin
      .from('user_study_year_v')
      .select('user_id, study_year')

    if (universityId && universityUserIds) {
      if (universityUserIds.size > 0) {
        studyYearQuery = studyYearQuery.in('user_id', Array.from(universityUserIds))
      } else {
        studyYearQuery = studyYearQuery.eq('user_id', '00000000-0000-0000-0000-000000000000')
      }
    }

    const { data: studyYearData } = await studyYearQuery

    // Count by study year
    const studyYearCounts = new Map<number, number>()
    studyYearData?.forEach(sy => {
      const year = sy.study_year
      if (year) {
        studyYearCounts.set(year, (studyYearCounts.get(year) || 0) + 1)
      }
    })

    const studyYearDistribution = Array.from(studyYearCounts.entries())
      .map(([study_year, count]) => ({ study_year, count }))
      .sort((a, b) => a.study_year - b.study_year)

    // Calculate verification rate
    const verificationRate = totalUsers && totalUsers > 0
      ? ((verifiedUsers || 0) / totalUsers) * 100
      : 0

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      verifiedUsers: verifiedUsers || 0,
      activeChats: activeChats || 0,
      totalMatches: totalMatches || 0,
      reportsPending: reportsPending || 0,
      signupsLast7Days: signupsLast7Days || 0,
      signupsLast30Days: signupsLast30Days || 0,
      verificationRate: parseFloat(verificationRate.toFixed(1)),
      matchActivity: matchActivity || 0,
      universityStats: universityStats || [],
      programStats: programStats || [],
      studyYearDistribution: studyYearDistribution || []
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] Error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
