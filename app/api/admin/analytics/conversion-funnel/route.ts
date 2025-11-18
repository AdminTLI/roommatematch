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

    // Get university user IDs if filtering
    let universityUserIds: Set<string> | null = null
    if (universityId) {
      const { data: academic } = await admin
        .from('user_academic')
        .select('user_id')
        .eq('university_id', universityId)
      
      universityUserIds = new Set(academic?.map(a => a.user_id) || [])
    }

    // Get matches (all time and last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    let allMatchesQuery = admin
      .from('match_suggestions')
      .select('id, member_ids, status, created_at')
      .eq('kind', 'pair')

    const { data: allMatches } = await allMatchesQuery

    // Filter matches by university if needed and deduplicate
    const uniqueMatches = new Set<string>()
    let totalMatches = 0
    let matchesLast7Days = 0
    const weeklyConversion: { week: string; matches: number; agreements: number; rate: number }[] = []

    if (allMatches) {
      allMatches.forEach(match => {
        if (!match.member_ids || !Array.isArray(match.member_ids)) return
        
        if (universityId && universityUserIds) {
          const allFromUniversity = match.member_ids.every(id => universityUserIds.has(id))
          if (!allFromUniversity) return
        }

        const sortedIds = [...match.member_ids].sort().join('-')
        if (!uniqueMatches.has(sortedIds)) {
          uniqueMatches.add(sortedIds)
          totalMatches++
          
          const matchDate = new Date(match.created_at)
          if (matchDate >= sevenDaysAgo) {
            matchesLast7Days++
          }
        }
      })
    }

    // Get agreements
    let agreementsQuery = admin
      .from('agreements')
      .select('id, created_at')

    if (universityId) {
      agreementsQuery = agreementsQuery.eq('university_id', universityId)
    }

    const { data: agreements } = await agreementsQuery
    const totalAgreements = agreements?.length || 0

    // Calculate weekly conversion rates for sparkline
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      
      const weekMatches = allMatches?.filter(m => {
        const matchDate = new Date(m.created_at)
        return matchDate >= weekStart && matchDate < weekEnd
      }).length || 0
      
      const weekAgreements = agreements?.filter(a => {
        const agreementDate = new Date(a.created_at)
        return agreementDate >= weekStart && agreementDate < weekEnd
      }).length || 0
      
      const rate = weekMatches > 0 ? (weekAgreements / weekMatches) * 100 : 0
      
      weeklyConversion.push({
        week: weekStart.toISOString().split('T')[0],
        matches: weekMatches,
        agreements: weekAgreements,
        rate: parseFloat(rate.toFixed(1))
      })
    }

    const conversionRate = totalMatches > 0 
      ? (totalAgreements / totalMatches) * 100 
      : 0

    return NextResponse.json({
      totalMatches,
      totalAgreements,
      matchesLast7Days,
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      weeklyConversion
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] Conversion funnel error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

