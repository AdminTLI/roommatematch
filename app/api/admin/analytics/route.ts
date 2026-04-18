import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { resolveAdminAnalyticsScope, resolveScopedMetricsUserIds } from '@/lib/admin/analytics-scope'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export async function GET(request: NextRequest) {
  try {
    const scope = await resolveAdminAnalyticsScope(request)
    if (!scope.ok) {
      return NextResponse.json({ error: scope.error }, { status: scope.status })
    }

    const { universityId, filters } = scope
    const admin = createAdminClient()

    const scopedUserIds = await resolveScopedMetricsUserIds(admin, universityId, filters)
    const universityUserIds: Set<string> | null = scopedUserIds

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // 1. Total Users - count active users
    let totalUsersQuery = admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (universityUserIds) {
      if (universityUserIds.size > 0) {
        totalUsersQuery = totalUsersQuery.in('id', Array.from(universityUserIds))
      } else {
        totalUsersQuery = totalUsersQuery.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    }

    const { count: totalUsers } = await totalUsersQuery

    // 2. Verified Users - count verified profiles
    let verifiedUsersQuery = admin
      .from('profiles')
      .select('user_id', { count: 'exact', head: true })
      .eq('verification_status', 'verified')

    if (universityUserIds) {
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
    if (universityUserIds && activeChatIds.size > 0) {
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

    if (universityUserIds && universityUserIds.size === 0) {
      allMatchesQuery = allMatchesQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }

    const { data: allMatches } = await allMatchesQuery

    // Deduplicate matches by unique pairs
    const uniquePairs = new Set<string>()
    let totalMatches = 0
    if (allMatches) {
      allMatches.forEach(match => {
        if (!match.member_ids || !Array.isArray(match.member_ids)) return
        
        if (universityUserIds.size === 0) return
        const allFromUniversity = match.member_ids.every((id: string) => universityUserIds.has(id))
        if (!allFromUniversity) return

        // Create unique key for pair
        const sortedIds = [...match.member_ids].sort().join('-')
        if (!uniquePairs.has(sortedIds)) {
          uniquePairs.add(sortedIds)
          totalMatches++
        }
      })
    }

    // 5. Reports Pending — tenant-scoped (reporter or subject in cohort)
    let reportsPending = 0
    if (universityUserIds && universityUserIds.size > 0) {
      const ids = Array.from(universityUserIds)
      const seen = new Set<string>()
      for (const part of chunk(ids, 120)) {
        const { data: byReporter } = await admin
          .from('reports')
          .select('id')
          .in('status', ['open', 'pending'])
          .in('reporter_id', part)
        for (const r of byReporter || []) {
          if (r.id) seen.add(r.id)
        }
        const { data: byTarget } = await admin
          .from('reports')
          .select('id')
          .in('status', ['open', 'pending'])
          .in('target_user_id', part)
        for (const r of byTarget || []) {
          if (r.id) seen.add(r.id)
        }
      }
      reportsPending = seen.size
    }

    // 6. Signups Last 7 Days
    let signups7dQuery = admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', sevenDaysAgo.toISOString())

    if (universityUserIds.size > 0) {
      signups7dQuery = signups7dQuery.in('id', Array.from(universityUserIds))
    } else {
      signups7dQuery = signups7dQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }

    const { count: signupsLast7Days } = await signups7dQuery

    // 7. Signups Last 30 Days
    let signups30dQuery = admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (universityUserIds.size > 0) {
      signups30dQuery = signups30dQuery.in('id', Array.from(universityUserIds))
    } else {
      signups30dQuery = signups30dQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }

    const { count: signupsLast30Days } = await signups30dQuery

    // 8. Match Activity (matches created in last 7 days)
    let matchActivityQuery = admin
      .from('match_suggestions')
      .select('id, member_ids, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .eq('kind', 'pair')

    if (universityUserIds.size === 0) {
      matchActivityQuery = matchActivityQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }

    const { data: recentMatches } = await matchActivityQuery

    // Deduplicate recent matches
    const recentUniquePairs = new Set<string>()
    let matchActivity = 0
    if (recentMatches) {
      recentMatches.forEach(match => {
        if (!match.member_ids || !Array.isArray(match.member_ids)) return
        
        if (universityUserIds.size === 0) return
        const allFromUniversity = match.member_ids.every((id: string) => universityUserIds.has(id))
        if (!allFromUniversity) return

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

    const { data: allAcademicRaw } = await academicQuery
    const allAcademic = (allAcademicRaw || []).filter((a) => universityUserIds.has(a.user_id))

    // Get verified user IDs (scoped)
    let verifiedUserIds = new Set<string>()
    if (universityUserIds.size > 0) {
      const { data: verifiedProfiles } = await admin
        .from('profiles')
        .select('user_id')
        .eq('verification_status', 'verified')
        .in('user_id', Array.from(universityUserIds))
      verifiedUserIds = new Set(verifiedProfiles?.map((p) => p.user_id) || [])
    }

    // Count by university
    const universityCounts = new Map<string, { total: number; verified: number }>()
    allAcademic.forEach((a) => {
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

    const { data: academicDataRaw } = await programStatsQuery
    const academicData = (academicDataRaw || []).filter((a) => universityUserIds.has(a.user_id))

    // Get program and university names
    const programIds = new Set(academicData.map((a) => a.program_id).filter(Boolean) || [])
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
    academicData.forEach((a) => {
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

    if (universityUserIds.size > 0) {
      studyYearQuery = studyYearQuery.in('user_id', Array.from(universityUserIds))
    } else {
      studyYearQuery = studyYearQuery.eq('user_id', '00000000-0000-0000-0000-000000000000')
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
