import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { openScopedAnalyticsSession } from '@/lib/admin/analytics-scope'

type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'unmatched'

interface MatchRow {
  a_user: string
  b_user: string
  status: MatchStatus
}

interface AppEventRow {
  user_id: string | null
  props: Record<string, unknown> | null
  created_at: string
}

interface IntegrationMetricsResponse {
  totalMatches: number
  crossCulturalMatches: number
  integrationRate: number
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await openScopedAnalyticsSession(request)
    if (!ctx.ok) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status })
    }

    const { admin, scopedUserIds: universityUserIds } = ctx

    if (universityUserIds.size === 0) {
      const empty: IntegrationMetricsResponse = {
        totalMatches: 0,
        crossCulturalMatches: 0,
        integrationRate: 0,
      }
      return NextResponse.json(empty)
    }

    const matchesQuery = admin
      .from('matches')
      .select('a_user, b_user, status')
      .eq('status', 'accepted')
      .in('a_user', Array.from(universityUserIds))
      .in('b_user', Array.from(universityUserIds))

    const { data: matches, error: matchesError } = await matchesQuery

    if (matchesError) {
      safeLogger.error('[Admin Integration Analytics] Failed to load matches', { error: matchesError })
      return NextResponse.json(
        { error: 'Failed to load integration analytics' },
        { status: 500 }
      )
    }

    const typedMatches = (matches || []) as MatchRow[]

    if (typedMatches.length === 0) {
      const empty: IntegrationMetricsResponse = {
        totalMatches: 0,
        crossCulturalMatches: 0,
        integrationRate: 0,
      }
      return NextResponse.json(empty)
    }

    // Collect unique user IDs participating in these matches
    const userIdSet = new Set<string>()
    for (const match of typedMatches) {
      if (match.a_user) userIdSet.add(match.a_user)
      if (match.b_user) userIdSet.add(match.b_user)
    }

    const userIds = Array.from(userIdSet)

    if (userIds.length === 0) {
      const empty: IntegrationMetricsResponse = {
        totalMatches: 0,
        crossCulturalMatches: 0,
        integrationRate: 0,
      }
      return NextResponse.json(empty)
    }

    // Load latest onboarding demographics events for these users
    // We use the `onboarding_demographics_set` event and its `student_origin` prop
    let eventsQuery = admin
      .from('app_events')
      .select('user_id, props, created_at')
      .eq('name', 'onboarding_demographics_set')
      .in('user_id', userIds)

    const { data: events, error: eventsError } = await eventsQuery

    if (eventsError) {
      safeLogger.error('[Admin Integration Analytics] Failed to load app_events', {
        error: eventsError,
      })

      const empty: IntegrationMetricsResponse = {
        totalMatches: 0,
        crossCulturalMatches: 0,
        integrationRate: 0,
      }
      return NextResponse.json(empty)
    }

    // Build per-user origin map based on the most recent demographics event
    const originByUser = new Map<string, 'dutch' | 'international'>()
    const lastSeenAt = new Map<string, string>()

    ;(events || []).forEach((event: AppEventRow) => {
      if (!event.user_id || !event.props) return

      const props = event.props as { student_origin?: unknown }
      const origin = typeof props.student_origin === 'string' ? props.student_origin : null

      if (origin !== 'dutch' && origin !== 'international') return

      const previous = lastSeenAt.get(event.user_id)
      if (!previous || new Date(event.created_at) > new Date(previous)) {
        lastSeenAt.set(event.user_id, event.created_at)
        originByUser.set(event.user_id, origin)
      }
    })

    let totalMatches = 0
    let crossCulturalMatches = 0
    let skippedForMissingOrigin = 0

    for (const match of typedMatches) {
      const originA = originByUser.get(match.a_user)
      const originB = originByUser.get(match.b_user)

      // Only include matches where we have origin data for both users
      if (!originA || !originB) {
        skippedForMissingOrigin++
        continue
      }

      totalMatches++

      if (originA !== originB) {
        crossCulturalMatches++
      }
    }

    if (skippedForMissingOrigin > 0) {
      safeLogger.warn('[Admin Integration Analytics] Matches skipped due to missing student_origin', {
        skippedForMissingOrigin,
      })
    }

    const integrationRate =
      totalMatches > 0 ? (crossCulturalMatches / totalMatches) * 100 : 0

    const response: IntegrationMetricsResponse = {
      totalMatches,
      crossCulturalMatches,
      integrationRate: parseFloat(integrationRate.toFixed(1)),
    }

    return NextResponse.json(response)
  } catch (error) {
    safeLogger.error('[Admin Integration Analytics] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

