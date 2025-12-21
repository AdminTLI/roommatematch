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

    // Get date range from query params (default to last 30 days)
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30', 10)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get user journey events with traffic source data
    let eventsQuery = admin
      .from('user_journey_events')
      .select('traffic_source, utm_source, utm_campaign, utm_medium, event_timestamp, user_id')
      .gte('event_timestamp', startDate.toISOString())
      .not('traffic_source', 'is', null)

    // Filter by university if needed
    if (universityId) {
      const { data: academic } = await admin
        .from('user_academic')
        .select('user_id')
        .eq('university_id', universityId)
      
      const universityUserIds = new Set(academic?.map(a => a.user_id) || [])
      
      if (universityUserIds.size > 0) {
        eventsQuery = eventsQuery.in('user_id', Array.from(universityUserIds))
      } else {
        return NextResponse.json({
          sources: [],
          campaigns: [],
          timeSeries: []
        })
      }
    }

    const { data: events, error } = await eventsQuery

    if (error) {
      safeLogger.error('[Admin Analytics] Traffic sources error', { error })
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Aggregate by traffic source
    const sourceCounts = new Map<string, number>()
    const campaignCounts = new Map<string, number>()
    const dailySourceCounts = new Map<string, Map<string, number>>() // date -> source -> count

    events?.forEach(event => {
      const source = event.traffic_source || 'unknown'
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1)

      // Track campaigns
      if (event.utm_campaign) {
        campaignCounts.set(
          event.utm_campaign,
          (campaignCounts.get(event.utm_campaign) || 0) + 1
        )
      }

      // Track daily counts
      const date = new Date(event.event_timestamp).toISOString().split('T')[0]
      if (!dailySourceCounts.has(date)) {
        dailySourceCounts.set(date, new Map())
      }
      const dayMap = dailySourceCounts.get(date)!
      dayMap.set(source, (dayMap.get(source) || 0) + 1)
    })

    // Convert to arrays for response
    const sources = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({
        source,
        count,
        percentage: events ? (count / events.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)

    const campaigns = Array.from(campaignCounts.entries())
      .map(([campaign, count]) => ({
        campaign,
        count,
        percentage: events ? (count / events.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 campaigns

    // Build time series data
    const timeSeries: Array<{
      date: string
      organic: number
      direct: number
      paid: number
      social: number
      email: number
      referral: number
      total: number
    }> = []

    // Fill in all dates in range
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      
      const dayMap = dailySourceCounts.get(date) || new Map()
      timeSeries.push({
        date,
        organic: dayMap.get('organic') || 0,
        direct: dayMap.get('direct') || 0,
        paid: dayMap.get('paid') || 0,
        social: dayMap.get('social') || 0,
        email: dayMap.get('email') || 0,
        referral: dayMap.get('referral') || 0,
        total: Array.from(dayMap.values()).reduce((sum, count) => sum + count, 0)
      })
    }

    return NextResponse.json({
      sources,
      campaigns,
      timeSeries
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] Traffic sources error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

