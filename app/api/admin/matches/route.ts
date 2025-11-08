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

    // Fetch user profiles for member IDs
    const allMemberIds = new Set<string>()
    suggestions?.forEach(s => {
      s.member_ids?.forEach(id => allMemberIds.add(id))
    })

    const { data: profiles } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name, email')
      .in('user_id', Array.from(allMemberIds))

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

    // Enrich suggestions with user names
    const enriched = suggestions?.map(s => ({
      ...s,
      members: s.member_ids?.map(id => ({
        id,
        name: profileMap.get(id) 
          ? `${profileMap.get(id)!.first_name} ${profileMap.get(id)!.last_name || ''}`.trim()
          : 'Unknown',
        email: profileMap.get(id)?.email || ''
      })) || []
    }))

    // Get total count
    let countQuery = admin.from('match_suggestions').select('id', { count: 'exact', head: true })
    if (status) countQuery = countQuery.eq('status', status)
    if (minScore) countQuery = countQuery.gte('fit_score', parseFloat(minScore))
    if (maxScore) countQuery = countQuery.lte('fit_score', parseFloat(maxScore))
    if (startDate) countQuery = countQuery.gte('created_at', startDate)
    if (endDate) countQuery = countQuery.lte('created_at', endDate)

    const { count } = await countQuery

    // Calculate statistics
    const { data: allSuggestions } = await admin
      .from('match_suggestions')
      .select('status, fit_score')
    
    const stats = {
      total: count || 0,
      pending: allSuggestions?.filter(s => s.status === 'pending').length || 0,
      accepted: allSuggestions?.filter(s => s.status === 'accepted').length || 0,
      declined: allSuggestions?.filter(s => s.status === 'declined').length || 0,
      expired: allSuggestions?.filter(s => s.status === 'expired').length || 0,
      confirmed: allSuggestions?.filter(s => s.status === 'confirmed').length || 0,
      avgScore: allSuggestions && allSuggestions.length > 0
        ? allSuggestions.reduce((sum, s) => sum + (s.fit_score || 0), 0) / allSuggestions.length
        : 0
    }

    return NextResponse.json({
      matches: enriched || [],
      total: count || 0,
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

