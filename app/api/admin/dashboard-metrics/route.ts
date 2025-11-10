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

    const { user } = adminCheck
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Get admin's university_id for filtering
    const { data: adminRecord } = await adminClient
      .from('admins')
      .select('university_id')
      .eq('user_id', user!.id)
      .single()

    // Get time period from query params
    const searchParams = request.nextUrl.searchParams
    const period = (searchParams.get('period') || 'all') as TimePeriod
    const { startDate, endDate } = getTimePeriodDates(period)

    // Build base query conditions
    const startDateISO = startDate ? startDate.toISOString() : null

    // Filter by university if admin is university-specific
    if (adminRecord?.university_id) {
      // Query users filtered by university via profiles
      const { data: profiles } = await adminClient
        .from('profiles')
        .select('user_id, created_at')
        .eq('university_id', adminRecord.university_id)

      const userIds = profiles?.map(p => p.user_id) || []
      let totalUsers = 0
      
      if (userIds.length > 0) {
        let userQuery = adminClient
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .in('id', userIds)

        if (startDateISO) {
          // Filter by user creation date
          userQuery = userQuery.gte('created_at', startDateISO)
        }

        const { count } = await userQuery
        totalUsers = count || 0
      }

      // 2. Verified Users - count verified users within time period
      let verifiedUsersQuery = adminClient
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('university_id', adminRecord.university_id)
        .eq('verification_status', 'verified')

      if (startDateISO) {
        verifiedUsersQuery = verifiedUsersQuery.gte('created_at', startDateISO)
      }

      const { count: verifiedUsers } = await verifiedUsersQuery

      // 3. Active Matches - matches where both users accepted (status = 'confirmed' OR status = 'accepted' with all members in accepted_by)
      let activeMatchesQuery = adminClient
        .from('match_suggestions')
        .select('id, member_ids, accepted_by, status, kind', { count: 'exact' })
        .in('status', ['confirmed', 'accepted'])

      if (startDateISO) {
        activeMatchesQuery = activeMatchesQuery.gte('created_at', startDateISO)
      }

      const { data: matchesData, count: matchesCount } = await activeMatchesQuery

      // Filter to only matches where both/all users accepted
      let activeMatches = 0
      if (matchesData) {
        activeMatches = matchesData.filter(match => {
          // For confirmed status, both users have accepted
          if (match.status === 'confirmed') {
            return true
          }
          // For accepted status, check if all members are in accepted_by array
          if (match.status === 'accepted' && match.accepted_by && match.member_ids) {
            const acceptedSet = new Set(match.accepted_by)
            return match.member_ids.every((id: string) => acceptedSet.has(id))
          }
          return false
        }).length
      }

      // 4. Pending Reports - always show current pending (not time-filtered)
      const { count: pendingReports } = await adminClient
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')

      return NextResponse.json({
        totalUsers: totalUsers || 0,
        activeMatches,
        verifiedUsers: verifiedUsers || 0,
        pendingReports: pendingReports || 0,
        period,
        lastUpdated: new Date().toISOString()
      })
    } else {
      // Super admin - no university filtering
      let totalUsersQuery = adminClient
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)

      if (startDateISO) {
        totalUsersQuery = totalUsersQuery.gte('created_at', startDateISO)
      }

      const { count: totalUsers } = await totalUsersQuery

      // Verified Users
      let verifiedUsersQuery = adminClient
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('verification_status', 'verified')

      if (startDateISO) {
        verifiedUsersQuery = verifiedUsersQuery.gte('created_at', startDateISO)
      }

      const { count: verifiedUsers } = await verifiedUsersQuery

      // Active Matches
      let activeMatchesQuery = adminClient
        .from('match_suggestions')
        .select('id, member_ids, accepted_by, status, kind', { count: 'exact' })
        .in('status', ['confirmed', 'accepted'])

      if (startDateISO) {
        activeMatchesQuery = activeMatchesQuery.gte('created_at', startDateISO)
      }

      const { data: matchesData } = await activeMatchesQuery

      let activeMatches = 0
      if (matchesData) {
        activeMatches = matchesData.filter(match => {
          if (match.status === 'confirmed') {
            return true
          }
          if (match.status === 'accepted' && match.accepted_by && match.member_ids) {
            const acceptedSet = new Set(match.accepted_by)
            return match.member_ids.every((id: string) => acceptedSet.has(id))
          }
          return false
        }).length
      }

      // Pending Reports
      const { count: pendingReports } = await adminClient
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')

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

