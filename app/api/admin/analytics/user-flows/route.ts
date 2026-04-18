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
        topPaths: [],
        dropOffs: [],
        totalSessions: 0,
      })
    }

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '7', 10)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const { data: events, error } = await admin
      .from('user_journey_events')
      .select('user_id, session_id, page_url, event_timestamp')
      .eq('event_category', 'page_view')
      .gte('event_timestamp', startDate.toISOString())
      .not('page_url', 'is', null)
      .in('user_id', Array.from(scopedUserIds))
      .order('event_timestamp', { ascending: true })

    if (error) {
      safeLogger.error('[Admin Analytics] User flows error', { error })
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Build path sequences by session
    const sessionPaths = new Map<string, string[]>()
    
    events?.forEach(event => {
      if (!event.session_id || !event.page_url) return
      
      if (!sessionPaths.has(event.session_id)) {
        sessionPaths.set(event.session_id, [])
      }
      
      const path = sessionPaths.get(event.session_id)!
      // Only add if different from last page (avoid duplicates)
      if (path.length === 0 || path[path.length - 1] !== event.page_url) {
        path.push(event.page_url)
      }
    })

    // Count path patterns
    const pathCounts = new Map<string, number>()
    const pathTransitions = new Map<string, number>() // "pageA -> pageB" -> count

    sessionPaths.forEach((path) => {
      // Count full paths (up to 3 pages)
      if (path.length > 0) {
        const fullPath = path.slice(0, 3).join(' → ')
        pathCounts.set(fullPath, (pathCounts.get(fullPath) || 0) + 1)
      }

      // Count transitions
      for (let i = 0; i < path.length - 1; i++) {
        const transition = `${path[i]} → ${path[i + 1]}`
        pathTransitions.set(transition, (pathTransitions.get(transition) || 0) + 1)
      }
    })

    // Get top paths
    const topPaths = Array.from(pathCounts.entries())
      .map(([path, count]) => ({
        path,
        count,
        percentage: sessionPaths.size > 0 ? (count / sessionPaths.size) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    // Calculate drop-offs (pages where users leave)
    const pageExits = new Map<string, number>() // page -> exit count
    const pageEntries = new Map<string, number>() // page -> entry count

    sessionPaths.forEach((path) => {
      if (path.length > 0) {
        // First page is an entry
        pageEntries.set(path[0], (pageEntries.get(path[0]) || 0) + 1)
        
        // Last page is an exit
        pageExits.set(path[path.length - 1], (pageExits.get(path[path.length - 1]) || 0) + 1)
      }
    })

    // Calculate drop-off rates
    const dropOffs = Array.from(pageEntries.entries())
      .map(([page, entries]) => {
        const exits = pageExits.get(page) || 0
        const dropOffRate = entries > 0 ? ((exits / entries) * 100) : 0
        return {
          page,
          entries,
          exits,
          dropOffRate: parseFloat(dropOffRate.toFixed(1))
        }
      })
      .sort((a, b) => b.dropOffRate - a.dropOffRate)
      .slice(0, 10)

    return NextResponse.json({
      topPaths,
      dropOffs,
      totalSessions: sessionPaths.size
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] User flows error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}





