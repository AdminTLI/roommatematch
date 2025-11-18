import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
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

    const adminClient = createAdminClient()

    // Get admin's university_id and role for filtering
    const { data: adminRecord } = await adminClient
      .from('admins')
      .select('university_id, role')
      .eq('user_id', adminCheck.user!.id)
      .single()

    // Super admins should see all data, not filtered by university
    const shouldFilterByUniversity = adminRecord?.university_id && adminRecord.role !== 'super_admin'

    // Get start of today in UTC
    const now = new Date()
    const startOfToday = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ))

    const startOfTodayISO = startOfToday.toISOString()

    // 1. New user registrations today
    let newRegistrationsQuery = adminClient
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfTodayISO)

    if (shouldFilterByUniversity) {
      // Filter by university via profiles
      const { data: profiles } = await adminClient
        .from('profiles')
        .select('user_id')
        .eq('university_id', adminRecord.university_id)
        .gte('created_at', startOfTodayISO)

      const userIds = profiles?.map(p => p.user_id) || []
      if (userIds.length > 0) {
        newRegistrationsQuery = adminClient
          .from('users')
          .select('id', { count: 'exact', head: true })
          .in('id', userIds)
          .gte('created_at', startOfTodayISO)
      } else {
        newRegistrationsQuery = adminClient
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('id', '00000000-0000-0000-0000-000000000000') // Return 0 results
      }
    }

    const { count: newRegistrations } = await newRegistrationsQuery

    // 2. Successful matches created today (where both users accepted)
    // Only count non-expired, unique pairs
    const currentTimeISO = new Date().toISOString()
    let successfulMatchesQuery = adminClient
      .from('match_suggestions')
      .select('id, member_ids, accepted_by, status, kind, expires_at')
      .gte('created_at', startOfTodayISO)
      .in('status', ['confirmed', 'accepted'])
      .gte('expires_at', currentTimeISO) // Only non-expired matches

    const { data: matchesData } = await successfulMatchesQuery

    // Get university user IDs if admin is university-specific (not super_admin)
    let universityUserIds: Set<string> | null = null
    if (shouldFilterByUniversity) {
      const { data: universityProfiles } = await adminClient
        .from('profiles')
        .select('user_id')
        .eq('university_id', adminRecord.university_id)

      universityUserIds = new Set(universityProfiles?.map(p => p.user_id) || [])
    }

    // Deduplicate by member_ids to count unique pairs only
    const uniquePairs = new Set<string>()
    let successfulMatches = 0
    if (matchesData) {
      matchesData.forEach(match => {
        // If university filtering is enabled, check if all members are from this university
        if (universityUserIds && match.member_ids && Array.isArray(match.member_ids)) {
          const allMembersFromUniversity = match.member_ids.every((id: string) => 
            universityUserIds!.has(id)
          )
          if (!allMembersFromUniversity) {
            return
          }
        }

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
            successfulMatches++
          }
        }
      })
    }

    // 3. Safety reports submitted today
    let safetyReportsQuery = adminClient
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfTodayISO)

    const { count: safetyReports } = await safetyReportsQuery

    // 4. System backup status - check admin_actions for backup events
    const { data: backupActions } = await adminClient
      .from('admin_actions')
      .select('created_at, metadata')
      .eq('action', 'system_backup')
      .order('created_at', { ascending: false })
      .limit(1)

    const lastBackup = backupActions?.[0]?.created_at
    const lastBackupDate = lastBackup ? new Date(lastBackup) : null
    const backupCompleted = lastBackupDate && lastBackupDate >= startOfToday

    // Build activity feed items
    const activities = [
      {
        id: 'new-registrations',
        type: 'user_registration',
        description: `${newRegistrations || 0} new user registration${newRegistrations !== 1 ? 's' : ''} today`,
        count: newRegistrations || 0,
        timestamp: new Date().toISOString(),
        icon: 'users'
      },
      {
        id: 'successful-matches',
        type: 'match_created',
        description: `${successfulMatches} successful match${successfulMatches !== 1 ? 'es' : ''} created`,
        count: successfulMatches,
        timestamp: new Date().toISOString(),
        icon: 'trending-up'
      },
      {
        id: 'safety-reports',
        type: 'report_submitted',
        description: `${safetyReports || 0} safety report${safetyReports !== 1 ? 's' : ''} submitted`,
        count: safetyReports || 0,
        timestamp: new Date().toISOString(),
        icon: 'shield'
      },
      {
        id: 'system-backup',
        type: 'backup_completed',
        description: backupCompleted 
          ? 'System backup completed'
          : lastBackupDate
            ? `Last backup: ${lastBackupDate.toLocaleDateString()} ${lastBackupDate.toLocaleTimeString()}`
            : 'No backup recorded',
        count: backupCompleted ? 1 : 0,
        timestamp: lastBackupDate?.toISOString() || new Date().toISOString(),
        icon: 'database',
        status: backupCompleted ? 'completed' : 'pending'
      }
    ]

    return NextResponse.json({
      activities,
      date: startOfToday.toISOString(),
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    safeLogger.error('[Admin] Activity feed error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

