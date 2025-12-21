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
    // Use the same deduplication and filtering logic as totalMatches
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      
      // Deduplicate matches for this week using the same logic
      const weekUniqueMatches = new Set<string>()
      let weekMatches = 0
      
      if (allMatches) {
        allMatches.forEach(match => {
          if (!match.member_ids || !Array.isArray(match.member_ids)) return
          
          // Apply university filter if needed
          if (universityId && universityUserIds) {
            const allFromUniversity = match.member_ids.every(id => universityUserIds.has(id))
            if (!allFromUniversity) return
          }
          
          // Check if match is in this week
          const matchDate = new Date(match.created_at)
          if (matchDate >= weekStart && matchDate < weekEnd) {
            const sortedIds = [...match.member_ids].sort().join('-')
            if (!weekUniqueMatches.has(sortedIds)) {
              weekUniqueMatches.add(sortedIds)
              weekMatches++
            }
          }
        })
      }
      
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

    // Calculate funnel steps and drop-offs
    // Step 1: Signups (users who completed onboarding)
    let signupsQuery = admin
      .from('profiles')
      .select('user_id, created_at')
      .not('user_id', 'is', null)

    if (universityId) {
      signupsQuery = signupsQuery.eq('university_id', universityId)
    }

    const { data: profiles } = await signupsQuery
    const totalSignups = profiles?.length || 0

    // Step 2: Users with completed onboarding
    let onboardingQuery = admin
      .from('onboarding_sections')
      .select('user_id')
      .eq('section', 'complete')
      .not('completed_at', 'is', null)

    if (universityId && universityUserIds) {
      onboardingQuery = onboardingQuery.in('user_id', Array.from(universityUserIds))
    }

    const { data: onboardingData } = await onboardingQuery
    const completedOnboarding = new Set(onboardingData?.map(o => o.user_id) || [])
    const onboardingCount = completedOnboarding.size

    // Step 3: Users who received matches (have at least one match)
    const usersWithMatches = new Set<string>()
    if (allMatches) {
      allMatches.forEach(match => {
        if (!match.member_ids || !Array.isArray(match.member_ids)) return
        
        if (universityId && universityUserIds) {
          const allFromUniversity = match.member_ids.every(id => universityUserIds.has(id))
          if (!allFromUniversity) return
        }
        
        match.member_ids.forEach((userId: string) => usersWithMatches.add(userId))
      })
    }
    const matchRecipients = usersWithMatches.size

    // Step 4: Users who accepted matches
    let acceptedMatchesQuery = admin
      .from('match_suggestions')
      .select('member_ids')
      .eq('kind', 'pair')
      .eq('status', 'accepted')

    if (universityId && universityUserIds) {
      // Filter by university users
      const acceptedMatches = await acceptedMatchesQuery
      const filteredAccepted = acceptedMatches.data?.filter(match => {
        if (!match.member_ids || !Array.isArray(match.member_ids)) return false
        return match.member_ids.every((id: string) => universityUserIds.has(id))
      }) || []
      
      const acceptedUsers = new Set<string>()
      filteredAccepted.forEach(match => {
        match.member_ids.forEach((userId: string) => acceptedUsers.add(userId))
      })
      var acceptedCount = acceptedUsers.size
    } else {
      const { data: acceptedMatches } = await acceptedMatchesQuery
      const acceptedUsers = new Set<string>()
      acceptedMatches?.forEach(match => {
        if (match.member_ids && Array.isArray(match.member_ids)) {
          match.member_ids.forEach((userId: string) => acceptedUsers.add(userId))
        }
      })
      var acceptedCount = acceptedUsers.size
    }

    // Step 5: Agreements (already calculated)
    const agreementUsers = new Set<string>()
    if (agreements) {
      // Get users from agreements (would need to join with agreement_members or similar)
      // For now, we'll use totalAgreements as a proxy
    }

    // Calculate drop-off rates
    const funnelSteps = [
      {
        step: 'Signups',
        count: totalSignups,
        dropOff: 0,
        dropOffRate: 0
      },
      {
        step: 'Completed Onboarding',
        count: onboardingCount,
        dropOff: totalSignups - onboardingCount,
        dropOffRate: totalSignups > 0 ? ((totalSignups - onboardingCount) / totalSignups) * 100 : 0
      },
      {
        step: 'Received Matches',
        count: matchRecipients,
        dropOff: onboardingCount - matchRecipients,
        dropOffRate: onboardingCount > 0 ? ((onboardingCount - matchRecipients) / onboardingCount) * 100 : 0
      },
      {
        step: 'Accepted Matches',
        count: acceptedCount,
        dropOff: matchRecipients - acceptedCount,
        dropOffRate: matchRecipients > 0 ? ((matchRecipients - acceptedCount) / matchRecipients) * 100 : 0
      },
      {
        step: 'Created Agreements',
        count: totalAgreements,
        dropOff: acceptedCount - totalAgreements,
        dropOffRate: acceptedCount > 0 ? ((acceptedCount - totalAgreements) / acceptedCount) * 100 : 0
      }
    ]

    // Calculate overall conversion rates
    const overallConversionRate = totalSignups > 0 
      ? (totalAgreements / totalSignups) * 100 
      : 0

    return NextResponse.json({
      totalMatches,
      totalAgreements,
      matchesLast7Days,
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      weeklyConversion,
      funnelSteps: funnelSteps.map(step => ({
        ...step,
        dropOffRate: parseFloat(step.dropOffRate.toFixed(1))
      })),
      overallConversionRate: parseFloat(overallConversionRate.toFixed(1)),
      totalSignups
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] Conversion funnel error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


