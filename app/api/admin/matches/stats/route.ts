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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const admin = await createAdminClient()

    // Get decline statistics
    const { data: declineEvents, error: declineError } = await admin
      .from('app_events')
      .select('*')
      .in('name', ['match_declined', 'match_rejected'])
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (declineError) {
      safeLogger.error('[Admin] Failed to fetch decline events', declineError)
    }

    // Get blocklist statistics
    const { data: blocklistData, error: blocklistError } = await admin
      .from('match_blocklist')
      .select('user_id, blocked_user_id, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (blocklistError) {
      safeLogger.error('[Admin] Failed to fetch blocklist data', blocklistError)
    }

    // Get match statistics by status
    const { data: matchStats, error: matchStatsError } = await admin
      .from('match_suggestions')
      .select('status, fit_index, created_at')
      .gte('created_at', startDate.toISOString())

    if (matchStatsError) {
      safeLogger.error('[Admin] Failed to fetch match stats', matchStatsError)
    }

    // Calculate decline rate over time
    const declineByDay: Record<string, number> = {}
    const blocklistByDay: Record<string, number> = {}
    const statusByDay: Record<string, { pending: number; accepted: number; declined: number; confirmed: number }> = {}

    // Process decline events
    declineEvents?.forEach(event => {
      const day = new Date(event.created_at).toISOString().split('T')[0]
      declineByDay[day] = (declineByDay[day] || 0) + 1
    })

    // Process blocklist additions
    blocklistData?.forEach(entry => {
      const day = new Date(entry.created_at).toISOString().split('T')[0]
      blocklistByDay[day] = (blocklistByDay[day] || 0) + 1
    })

    // Process match statistics
    matchStats?.forEach(match => {
      const day = new Date(match.created_at).toISOString().split('T')[0]
      if (!statusByDay[day]) {
        statusByDay[day] = { pending: 0, accepted: 0, declined: 0, confirmed: 0 }
      }
      if (match.status === 'pending') statusByDay[day].pending++
      if (match.status === 'accepted') statusByDay[day].accepted++
      if (match.status === 'declined') statusByDay[day].declined++
      if (match.status === 'confirmed') statusByDay[day].confirmed++
    })

    // Calculate totals and averages
    const totalDeclines = declineEvents?.length || 0
    const totalBlocklistAdditions = blocklistData?.length || 0
    const totalMatches = matchStats?.length || 0
    const declinedMatches = matchStats?.filter(m => m.status === 'declined').length || 0
    const declineRate = totalMatches > 0 ? (declinedMatches / totalMatches) * 100 : 0

    // Get average match score for declined matches
    const declinedScores = matchStats?.filter(m => m.status === 'declined' && m.fit_index != null).map(m => m.fit_index) || []
    const avgDeclinedScore = declinedScores.length > 0 
      ? declinedScores.reduce((a, b) => a + b, 0) / declinedScores.length 
      : 0

    // Get recent decline events with user info
    const recentDeclines = (declineEvents || []).slice(0, 50).map(event => ({
      id: event.id,
      userId: event.user_id,
      suggestionId: event.props?.suggestion_id,
      matchScore: event.props?.match_score || event.props?.match_fit_index,
      blockedUserIds: event.props?.other_user_ids || [],
      timestamp: event.created_at
    }))

    return NextResponse.json({
      summary: {
        totalDeclines,
        totalBlocklistAdditions,
        totalMatches,
        declinedMatches,
        declineRate: Number(declineRate.toFixed(2)),
        avgDeclinedScore: Number(avgDeclinedScore.toFixed(1)),
        periodDays: days
      },
      trends: {
        declineByDay: Object.entries(declineByDay)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({ date, count })),
        blocklistByDay: Object.entries(blocklistByDay)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({ date, count })),
        statusByDay: Object.entries(statusByDay)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, statuses]) => ({ date, ...statuses }))
      },
      recentDeclines: recentDeclines.slice(0, 20)
    })

  } catch (error) {
    safeLogger.error('[Admin] Match stats error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

