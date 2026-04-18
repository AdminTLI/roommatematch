import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { openScopedAnalyticsSession } from '@/lib/admin/analytics-scope'

type SuccessStatus = 'domu_match' | 'external' | 'still_looking' | null
type FeedbackStatus = 'completed' | 'dismissed'

interface PlatformFeedbackRow {
  id: string
  user_id: string
  success_status: SuccessStatus
  nps_score: number | null
  reason: string | null
  status: FeedbackStatus
  created_at: string
}

interface OverallStats {
  totalResponses: number
  completedResponses: number
  placementRate: number
  npsScore: number | null
  domuMatchCount: number
  externalCount: number
  stillLookingCount: number
  promoters: number
  passives: number
  detractors: number
}

interface RecentFeedbackItem {
  id: string
  success_status: SuccessStatus
  nps_score: number | null
  reason: string | null
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await openScopedAnalyticsSession(request)
    if (!ctx.ok) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status })
    }

    const { admin, scopedUserIds: universityUserIds } = ctx

    if (universityUserIds.size === 0) {
      const emptyOverall: OverallStats = {
        totalResponses: 0,
        completedResponses: 0,
        placementRate: 0,
        npsScore: null,
        domuMatchCount: 0,
        externalCount: 0,
        stillLookingCount: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
      }

      return NextResponse.json({
        overall: emptyOverall,
        recentFeedback: [] as RecentFeedbackItem[],
      })
    }

    const { data: rows, error } = await admin
      .from('platform_feedback')
      .select('id, user_id, success_status, nps_score, reason, status, created_at')
      .in('user_id', Array.from(universityUserIds))

    if (error) {
      safeLogger.error('[Admin Platform Feedback] Failed to load platform_feedback', { error })
      return NextResponse.json(
        { error: 'Failed to load platform feedback analytics' },
        { status: 500 }
      )
    }

    const typedRows = (rows || []) as PlatformFeedbackRow[]

    if (typedRows.length === 0) {
      const emptyOverall: OverallStats = {
        totalResponses: 0,
        completedResponses: 0,
        placementRate: 0,
        npsScore: null,
        domuMatchCount: 0,
        externalCount: 0,
        stillLookingCount: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
      }

      return NextResponse.json({
        overall: emptyOverall,
        recentFeedback: [] as RecentFeedbackItem[],
      })
    }

    const totalResponses = typedRows.length
    const completed = typedRows.filter((r) => r.status === 'completed')
    const completedResponses = completed.length

    const completedWithSuccessStatus = completed.filter(
      (r) => r.success_status === 'domu_match' || r.success_status === 'external' || r.success_status === 'still_looking'
    )

    const domuMatchCount = completedWithSuccessStatus.filter(
      (r) => r.success_status === 'domu_match'
    ).length
    const externalCount = completedWithSuccessStatus.filter(
      (r) => r.success_status === 'external'
    ).length
    const stillLookingCount = completedWithSuccessStatus.filter(
      (r) => r.success_status === 'still_looking'
    ).length

    const placementDenominator = completedWithSuccessStatus.length
    const placedCount = domuMatchCount + externalCount
    const placementRate =
      placementDenominator > 0 ? (placedCount / placementDenominator) * 100 : 0

    // NPS metrics (0–10)
    const npsRows = completed.filter(
      (r) => typeof r.nps_score === 'number' && r.nps_score !== null
    )
    const npsCount = npsRows.length
    let promoters = 0
    let passives = 0
    let detractors = 0

    if (npsCount > 0) {
      for (const row of npsRows) {
        const score = row.nps_score as number
        if (score >= 9) {
          promoters += 1
        } else if (score >= 7) {
          passives += 1
        } else {
          detractors += 1
        }
      }
    }

    const npsScore =
      npsCount > 0 ? ((promoters - detractors) / npsCount) * 100 : null

    const overall: OverallStats = {
      totalResponses,
      completedResponses,
      placementRate,
      npsScore,
      domuMatchCount,
      externalCount,
      stillLookingCount,
      promoters,
      passives,
      detractors,
    }

    // Recent feedback (most recent first), limit to 20 entries
    const recentFeedback: RecentFeedbackItem[] = typedRows
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 20)
      .map((row) => ({
        id: row.id,
        success_status: row.success_status,
        nps_score: row.nps_score,
        reason: row.reason,
        created_at: row.created_at,
      }))

    return NextResponse.json({
      overall,
      recentFeedback,
    })
  } catch (error) {
    safeLogger.error('[Admin Platform Feedback] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

