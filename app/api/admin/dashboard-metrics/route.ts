import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

type TimePeriod = '24h' | '7d' | '1m' | '3m' | '6m' | '1y' | 'all'

function getTimePeriodDates(period: TimePeriod): { startDate: Date | null; endDate: Date } {
  const endDate = new Date()
  let startDate: Date | null = null

  switch (period) {
    case '24h':
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '1m':
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '3m':
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case '6m':
      startDate = new Date(endDate.getTime() - 180 * 24 * 60 * 60 * 1000)
      break
    case '1y':
      startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    case 'all':
      startDate = null // No filter, get all data
      break
  }

  return { startDate, endDate }
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const supabase = await createClient()
    const adminClient = createAdminClient()

    if (!adminRecord) {
      safeLogger.error('[Admin] Admin record not found in requireAdmin result')
      return NextResponse.json(
        { error: 'Admin record not found' },
        { status: 500 }
      )
    }

    safeLogger.info('[Admin] Admin record found', {
      userId: user!.id,
      role: adminRecord.role,
      university_id: adminRecord.university_id || 'null/undefined'
    })

    // Get time period from query params
    const searchParams = request.nextUrl.searchParams
    const period = (searchParams.get('period') || 'all') as TimePeriod
    const { startDate, endDate } = getTimePeriodDates(period)

    // Build base query conditions
    const startDateISO = startDate ? startDate.toISOString() : null

    // First, let's check if there's ANY data at all (for debugging)
    const { count: totalProfilesAny, error: anyProfilesError } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalUsersAny, error: anyUsersError } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    safeLogger.info('[Admin] Total data in database (no filters)', {
      totalProfiles: totalProfilesAny || 0,
      totalActiveUsers: totalUsersAny || 0,
      profilesError: anyProfilesError?.message,
      usersError: anyUsersError?.message
    })

    // Filter by university if admin is university-specific (not super_admin)
    // Super admins should see all data regardless of university_id
    if (adminRecord?.university_id && adminRecord.role !== 'super_admin') {
      safeLogger.info('[Admin] Loading metrics for university', { university_id: adminRecord.university_id, period })
      
      // 1. Total Users - count active users with profiles for this university
      // Simplified: Count profiles directly and join with users to check is_active
      // First, let's try a simpler approach - count profiles for this university
      let totalUsersQuery = adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', adminRecord.university_id)

      if (startDateISO) {
        totalUsersQuery = totalUsersQuery.gte('created_at', startDateISO)
      }

      const { count: totalProfiles, error: totalProfilesError } = await totalUsersQuery
      
      if (totalProfilesError) {
        safeLogger.error('[Admin] Error counting profiles', totalProfilesError)
      } else {
        safeLogger.info('[Admin] Profile count for university', {
          university_id: adminRecord.university_id,
          count: totalProfiles || 0,
          hasDateFilter: !!startDateISO
        })
      }

      // Now get the actual user IDs and check if they're active
      let profilesQuery = adminClient
        .from('profiles')
        .select('user_id, created_at')
        .eq('university_id', adminRecord.university_id)

      if (startDateISO) {
        profilesQuery = profilesQuery.gte('created_at', startDateISO)
      }

      const { data: profileData, error: profileError } = await profilesQuery
      
      if (profileError) {
        safeLogger.error('[Admin] Error fetching profiles for total users', profileError)
      }
      
      const userIds = profileData?.map(p => p.user_id) || []
      
      let totalUsers = 0
      if (userIds.length > 0) {
        // Count active users from this list
        const { count, error: usersError } = await adminClient
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .in('id', userIds)
        
        if (usersError) {
          safeLogger.error('[Admin] Error counting active users', usersError)
        }
        
        totalUsers = count || 0
      } else {
        safeLogger.warn('[Admin] No profiles found for university', { 
          university_id: adminRecord.university_id,
          totalProfilesCount: totalProfiles || 0
        })
      }

      // 2. Verified Users - count verified users (all time if no period filter, or within period)
      let verifiedUsersQuery = adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', adminRecord.university_id)
        .eq('verification_status', 'verified')

      if (startDateISO) {
        // For verified users, we want to count all verified users regardless of when verified
        // But if time period is specified, we can filter by profile creation date
        verifiedUsersQuery = verifiedUsersQuery.gte('created_at', startDateISO)
      }

      const { count: verifiedUsers, error: verifiedUsersError } = await verifiedUsersQuery
      
      if (verifiedUsersError) {
        safeLogger.error('[Admin] Error counting verified users', verifiedUsersError)
      }

      // 3. Active Matches - matches where both users accepted and both are from this university
      // First get all user IDs for this university
      const { data: universityProfiles, error: universityProfilesError } = await adminClient
        .from('profiles')
        .select('user_id')
        .eq('university_id', adminRecord.university_id)

      if (universityProfilesError) {
        safeLogger.error('[Admin] Error fetching university profiles for matches', universityProfilesError)
      }

      const universityUserIds = new Set(universityProfiles?.map(p => p.user_id) || [])

      // Only get non-expired matches
      const now = new Date().toISOString()
      let activeMatchesQuery = adminClient
        .from('match_suggestions')
        .select('id, member_ids, accepted_by, status, kind, expires_at')
        .in('status', ['confirmed', 'accepted'])
        .gte('expires_at', now) // Only non-expired matches

      if (startDateISO) {
        activeMatchesQuery = activeMatchesQuery.gte('created_at', startDateISO)
      }

      const { data: matchesData, error: matchesError } = await activeMatchesQuery
      
      if (matchesError) {
        safeLogger.error('[Admin] Error fetching matches', matchesError)
      }

      // Filter to only matches where both/all users accepted AND both are from this university
      // Also deduplicate by member_ids to count unique pairs only
      const uniquePairs = new Set<string>()
      let activeMatches = 0
      if (matchesData) {
        matchesData.forEach(match => {
          // Check if all members are from this university
          if (!match.member_ids || !Array.isArray(match.member_ids)) {
            return
          }
          
          const allMembersFromUniversity = match.member_ids.every((id: string) => 
            universityUserIds.has(id)
          )
          
          if (!allMembersFromUniversity) {
            return
          }

          // Check if both users accepted
          let isAccepted = false
          if (match.status === 'confirmed') {
            isAccepted = true
          } else if (match.status === 'accepted' && match.accepted_by && match.member_ids) {
            const acceptedSet = new Set(match.accepted_by)
            isAccepted = match.member_ids.every((id: string) => acceptedSet.has(id))
          }

          if (isAccepted) {
            // Create a unique key for this pair (sorted to handle A-B and B-A as same pair)
            const sortedIds = [...match.member_ids].sort().join('-')
            if (!uniquePairs.has(sortedIds)) {
              uniquePairs.add(sortedIds)
              activeMatches++
            }
          }
        })
      }

      // 4. Pending Reports - always show current pending (not time-filtered)
      // Check both 'open' and 'pending' status values for compatibility
      const { count: pendingReportsOpen, error: reportsOpenError } = await adminClient
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')

      const { count: pendingReportsPending, error: reportsPendingError } = await adminClient
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (reportsOpenError) {
        safeLogger.error('[Admin] Error counting open reports', reportsOpenError)
      }
      if (reportsPendingError) {
        safeLogger.error('[Admin] Error counting pending reports', reportsPendingError)
      }

      const pendingReports = (pendingReportsOpen || 0) + (pendingReportsPending || 0)

      // Debug logging
      safeLogger.info('[Admin] Dashboard metrics calculated (university-specific)', {
        university_id: adminRecord.university_id,
        period,
        totalUsers,
        verifiedUsers: verifiedUsers || 0,
        activeMatches,
        pendingReports,
        profileDataCount: profileData?.length || 0,
        userIdsCount: userIds.length,
        universityUserIdsCount: universityUserIds.size,
        matchesDataCount: matchesData?.length || 0
      })

      return NextResponse.json({
        totalUsers: totalUsers || 0,
        activeMatches,
        verifiedUsers: verifiedUsers || 0,
        pendingReports: pendingReports || 0,
        period,
        lastUpdated: new Date().toISOString()
      })
    } else {
      // Super admin or no university_id - show all data without filtering
      safeLogger.info('[Admin] Loading metrics as super admin (no university filter)', { period })
      let totalUsersQuery = adminClient
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (startDateISO) {
        totalUsersQuery = totalUsersQuery.gte('created_at', startDateISO)
      }

      const { count: totalUsers, error: totalUsersError } = await totalUsersQuery
      
      if (totalUsersError) {
        safeLogger.error('[Admin] Error counting total users (super admin)', totalUsersError)
      }

      // Verified Users
      let verifiedUsersQuery = adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified')

      if (startDateISO) {
        verifiedUsersQuery = verifiedUsersQuery.gte('created_at', startDateISO)
      }

      const { count: verifiedUsers, error: verifiedUsersError } = await verifiedUsersQuery
      
      if (verifiedUsersError) {
        safeLogger.error('[Admin] Error counting verified users (super admin)', verifiedUsersError)
      }

      // Active Matches - only count unique, non-expired pairs where both users accepted
      const now = new Date().toISOString()
      let activeMatchesQuery = adminClient
        .from('match_suggestions')
        .select('id, member_ids, accepted_by, status, kind, expires_at')
        .in('status', ['confirmed', 'accepted'])
        .gte('expires_at', now) // Only non-expired matches

      if (startDateISO) {
        activeMatchesQuery = activeMatchesQuery.gte('created_at', startDateISO)
      }

      const { data: matchesData, error: matchesError } = await activeMatchesQuery
      
      if (matchesError) {
        safeLogger.error('[Admin] Error fetching matches (super admin)', matchesError)
      }

      // Deduplicate by member_ids to count unique pairs only
      const uniquePairs = new Set<string>()
      let activeMatches = 0
      if (matchesData) {
        matchesData.forEach(match => {
          // Check if both users accepted
          let isAccepted = false
          if (match.status === 'confirmed') {
            isAccepted = true
          } else if (match.status === 'accepted' && match.accepted_by && match.member_ids) {
            const acceptedSet = new Set(match.accepted_by)
            isAccepted = match.member_ids.every((id: string) => acceptedSet.has(id))
          }

          if (isAccepted && match.member_ids && Array.isArray(match.member_ids)) {
            // Create a unique key for this pair (sorted to handle A-B and B-A as same pair)
            const sortedIds = [...match.member_ids].sort().join('-')
            if (!uniquePairs.has(sortedIds)) {
              uniquePairs.add(sortedIds)
              activeMatches++
            }
          }
        })
      }

      // Pending Reports - check both 'open' and 'pending' status values for compatibility
      const { count: pendingReportsOpen } = await adminClient
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')

      const { count: pendingReportsPending } = await adminClient
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')

      const pendingReports = (pendingReportsOpen || 0) + (pendingReportsPending || 0)

      safeLogger.info('[Admin] Dashboard metrics calculated (super admin)', {
        period,
        totalUsers: totalUsers || 0,
        verifiedUsers: verifiedUsers || 0,
        activeMatches,
        pendingReports,
        matchesDataCount: matchesData?.length || 0
      })

      return NextResponse.json({
        totalUsers: totalUsers || 0,
        activeMatches,
        verifiedUsers: verifiedUsers || 0,
        pendingReports: pendingReports || 0,
        period,
        lastUpdated: new Date().toISOString()
      })
    }
  } catch (error) {
    safeLogger.error('[Admin] Dashboard metrics error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

