import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
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

    const { user } = adminCheck
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const admin = createAdminClient()

    // Build query
    let query = admin
      .from('match_suggestions')
      .select(`
        id,
        run_id,
        kind,
        member_ids,
        fit_score,
        fit_index,
        section_scores,
        reasons,
        status,
        accepted_by,
        expires_at,
        created_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (minScore) {
      query = query.gte('fit_score', parseFloat(minScore))
    }

    if (maxScore) {
      query = query.lte('fit_score', parseFloat(maxScore))
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: suggestions, error } = await query

    if (error) {
      safeLogger.error('[Admin] Failed to fetch matches', error)
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 500 }
      )
    }

    // Fetch user profiles and emails for member IDs
    const allMemberIds = new Set<string>()
    suggestions?.forEach(s => {
      s.member_ids?.forEach(id => allMemberIds.add(id))
    })

    const memberIdsArray = Array.from(allMemberIds)
    
    // Fetch profiles
    const { data: profiles } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', memberIdsArray)

    // Fetch users table for emails
    const { data: users } = await admin
      .from('users')
      .select('id, email')
      .in('id', memberIdsArray)

    // Create maps for easy lookup
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
    const userMap = new Map(users?.map(u => [u.id, u]) || [])

    // Fetch from auth.users as fallback (for users not in users table or missing emails)
    // Note: Admin API doesn't support batch getUserById, so we'll use users table as primary source
    // and only fallback to auth for missing emails
    const authUsersMap = new Map<string, { email: string }>()
    
    // Only fetch from auth for users missing from users table
    const missingUserIds = memberIdsArray.filter(id => !userMap.has(id))
    for (const userId of missingUserIds.slice(0, 50)) { // Limit to 50 to avoid timeout
      try {
        const { data: authUser } = await admin.auth.admin.getUserById(userId)
        if (authUser?.user?.email) {
          authUsersMap.set(userId, { email: authUser.user.email })
        }
      } catch (error) {
        // User might not exist in auth, continue
      }
    }

    // Enrich suggestions with user names
    const enriched = suggestions?.map(s => ({
      ...s,
      members: s.member_ids?.map(id => {
        const profile = profileMap.get(id)
        const user = userMap.get(id)
        const authUser = authUsersMap.get(id)
        
        // Build name from profile if available
        let name = 'Unknown'
        if (profile?.first_name) {
          name = `${profile.first_name} ${profile.last_name || ''}`.trim()
        } else {
          // Fallback to email username if no profile name
          const email = user?.email || authUser?.email || ''
          if (email) {
            name = email.split('@')[0]
          }
        }
        
        // Get email from users table or auth.users
        const email = user?.email || authUser?.email || ''
        
        return {
          id,
          name,
          email
        }
      }) || []
    }))

    // Get total count
    let countQuery = admin.from('match_suggestions').select('id', { count: 'exact', head: true })
    if (status) countQuery = countQuery.eq('status', status)
    if (minScore) countQuery = countQuery.gte('fit_score', parseFloat(minScore))
    if (maxScore) countQuery = countQuery.lte('fit_score', parseFloat(maxScore))
    if (startDate) countQuery = countQuery.gte('created_at', startDate)
    if (endDate) countQuery = countQuery.lte('created_at', endDate)

    const { count } = await countQuery

    // Calculate statistics - fetch all matches for accurate stats
    const { data: allSuggestions } = await admin
      .from('match_suggestions')
      .select('id, status, fit_score, member_ids, accepted_by, expires_at, kind, created_at')
    
    const now = new Date().toISOString()
    
    // Deduplicate matches by unique pairs (for pair matches only)
    const uniquePairs = new Map<string, any>()
    const allMatches: any[] = []
    
    if (allSuggestions) {
      allSuggestions.forEach(match => {
        if (match.kind === 'pair' && match.member_ids && Array.isArray(match.member_ids)) {
          // Create unique key for pair (sorted to handle A-B and B-A as same pair)
          const sortedIds = [...match.member_ids].sort().join('-')
          const existing = uniquePairs.get(sortedIds)
          
          // Keep the most recent match for each unique pair
          if (!existing || new Date(match.created_at) > new Date(existing.created_at)) {
            uniquePairs.set(sortedIds, match)
          }
        } else {
          // For group matches, include all
          allMatches.push(match)
        }
      })
    }
    
    // Combine unique pairs and group matches
    const deduplicatedMatches = [...Array.from(uniquePairs.values()), ...allMatches]
    
    // Calculate statistics
    let pending = 0
    let accepted = 0
    let declined = 0
    let expired = 0
    let confirmed = 0
    let totalScore = 0
    let scoreCount = 0
    
    deduplicatedMatches.forEach(match => {
      const isExpired = match.expires_at && new Date(match.expires_at) < new Date(now)
      const status = match.status
      
      // First check if expired (takes priority)
      if (isExpired || status === 'expired') {
        expired++
      } else if (status === 'confirmed') {
        // Confirmed matches (all members accepted and confirmed)
        confirmed++
      } else if (status === 'accepted' && match.accepted_by && match.member_ids) {
        // Check if all members have accepted
        const acceptedSet = new Set(match.accepted_by)
        const isFullyAccepted = match.member_ids.every((id: string) => acceptedSet.has(id))
        if (isFullyAccepted) {
          accepted++
        } else {
          // Partially accepted - count as pending
          pending++
        }
      } else if (status === 'pending') {
        pending++
      } else if (status === 'declined') {
        declined++
      }
      
      // Calculate average score from active matches (not declined, not expired)
      if (match.fit_score != null && status !== 'declined' && !isExpired && status !== 'expired') {
        totalScore += match.fit_score
        scoreCount++
      }
    })
    
    const total = deduplicatedMatches.length
    const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0
    
    const stats = {
      total,
      pending,
      accepted,
      declined,
      expired,
      confirmed,
      avgScore
    }

    return NextResponse.json({
      matches: enriched || [],
      total: stats.total, // Use deduplicated total from stats
      limit,
      offset,
      statistics: stats
    })
  } catch (error) {
    safeLogger.error('[Admin] Matches list error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const body = await request.json()
    const { action, matchIds } = body

    if (action === 'refresh') {
      // Trigger match refresh
      await logAdminAction(user!.id, 'refresh_matches', null, null, {
        action: 'Manually refreshing matches',
        role: adminRecord!.role
      })

      // Call the match refresh endpoint logic
      const { getMatchRepo } = await import('@/lib/matching/repo.factory')
      const { runMatchingAsSuggestions } = await import('@/lib/matching/orchestrator')
      
      const repo = await getMatchRepo()
      const result = await runMatchingAsSuggestions({
        repo,
        mode: 'pairs',
        groupSize: 2,
        cohort: {}
      })

      return NextResponse.json({
        success: true,
        message: 'Matches refreshed successfully',
        runId: result.runId,
        count: result.suggestions?.length || 0
      })
    }

    if (action === 'expire' && matchIds && Array.isArray(matchIds)) {
      const admin = createAdminClient()
      const { error } = await admin
        .from('match_suggestions')
        .update({ status: 'expired', expires_at: new Date().toISOString() })
        .in('id', matchIds)

      if (error) {
        safeLogger.error('[Admin] Failed to expire matches', error)
        return NextResponse.json({ error: 'Failed to expire matches' }, { status: 500 })
      }

      await logAdminAction(user!.id, 'expire_matches', null, null, {
        action: 'Expired matches',
        match_ids: matchIds,
        count: matchIds.length,
        role: adminRecord!.role
      })

      return NextResponse.json({ success: true, message: `Expired ${matchIds.length} match(es)` })
    }

    if (action === 'archive' && matchIds && Array.isArray(matchIds)) {
      // Archive by updating status to expired (or create archive table if needed)
      const admin = createAdminClient()
      const { error } = await admin
        .from('match_suggestions')
        .update({ status: 'expired', expires_at: new Date().toISOString() })
        .in('id', matchIds)

      if (error) {
        safeLogger.error('[Admin] Failed to archive matches', error)
        return NextResponse.json({ error: 'Failed to archive matches' }, { status: 500 })
      }

      await logAdminAction(user!.id, 'archive_matches', null, null, {
        action: 'Archived matches',
        match_ids: matchIds,
        count: matchIds.length,
        role: adminRecord!.role
      })

      return NextResponse.json({ success: true, message: `Archived ${matchIds.length} match(es)` })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    safeLogger.error('[Admin] Matches action error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

