import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { openScopedAnalyticsSession } from '@/lib/admin/analytics-scope'

export async function GET(request: NextRequest) {
  try {
    const ctx = await openScopedAnalyticsSession(request)
    if (!ctx.ok) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status })
    }

    const { admin, scopedUserIds } = ctx

    if (scopedUserIds.size === 0) {
      return NextResponse.json({
        sources: [],
        campaigns: [],
        timeSeries: [],
      })
    }

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30', 10)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const { data: events, error } = await admin
      .from('user_journey_events')
      .select('traffic_source, utm_source, utm_campaign, utm_medium, event_timestamp, user_id')
      .gte('event_timestamp', startDate.toISOString())
      .not('traffic_source', 'is', null)
      .in('user_id', Array.from(scopedUserIds))

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





