import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { openScopedAnalyticsSession } from '@/lib/admin/analytics-scope'

type MatchRow = {
  a_user: string
  b_user: string
  status: 'pending' | 'accepted' | 'rejected' | 'unmatched'
}

type BlocklistRow = {
  user_id: string
  blocked_user_id: string
  ended_at: string | null
}

type ReportRow = {
  reporter_id: string | null
  target_user_id: string | null
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await openScopedAnalyticsSession(request)
    if (!ctx.ok) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status })
    }

    const { admin, scopedUserIds: universityUserIds } = ctx

    if (universityUserIds.size === 0) {
      return NextResponse.json({
        totalActiveMatches: 0,
        totalBlocks: 0,
        totalReports: 0,
        harmonyScore: 0,
      })
    }

    const isPairInUniversityScope = (aUserId: string, bUserId: string): boolean =>
      universityUserIds.has(aUserId) && universityUserIds.has(bUserId)

    const isUserInUniversityScope = (userId: string | null | undefined): boolean =>
      !!userId && universityUserIds.has(userId)

    // 1) Total active matches (accepted matches, optionally scoped by university)
    const { data: matchesRows, error: matchesError } = await admin
      .from('matches')
      .select('a_user, b_user, status')

    if (matchesError) {
      safeLogger.error('[Admin Wellbeing Analytics] Failed to load matches', { error: matchesError })
      return NextResponse.json(
        { error: 'Failed to load wellbeing analytics (matches)' },
        { status: 500 }
      )
    }

    const typedMatches = (matchesRows || []) as MatchRow[]

    const scopedMatches = typedMatches.filter((m) =>
      isPairInUniversityScope(m.a_user, m.b_user)
    )

    // Treat "accepted" matches as active, exclude unmatched/rejected/pending
    const totalActiveMatches = scopedMatches.filter((m) => m.status === 'accepted').length

    // 2) Total blocks (active blocklist entries, optionally scoped by university)
    const { data: blockRows, error: blockError } = await admin
      .from('match_blocklist')
      .select('user_id, blocked_user_id, ended_at')

    if (blockError) {
      safeLogger.error('[Admin Wellbeing Analytics] Failed to load match_blocklist', {
        error: blockError,
      })
      return NextResponse.json(
        { error: 'Failed to load wellbeing analytics (blocklist)' },
        { status: 500 }
      )
    }

    const typedBlocks = (blockRows || []) as BlocklistRow[]

    const scopedBlocks = typedBlocks.filter((b) => {
      // Only count active blocks (ended_at is null or in the future)
      const isActive =
        !b.ended_at || new Date(b.ended_at).getTime() > Date.now()

      if (!isActive) return false

      return (
        isUserInUniversityScope(b.user_id) ||
        isUserInUniversityScope(b.blocked_user_id)
      )
    })

    const totalBlocks = scopedBlocks.length

    // 3) Total reports (all report rows, optionally scoped by university)
    const { data: reportRows, error: reportsError } = await admin
      .from('reports')
      .select('reporter_id, target_user_id')

    if (reportsError) {
      safeLogger.error('[Admin Wellbeing Analytics] Failed to load reports', {
        error: reportsError,
      })
      return NextResponse.json(
        { error: 'Failed to load wellbeing analytics (reports)' },
        { status: 500 }
      )
    }

    const typedReports = (reportRows || []) as ReportRow[]

    const scopedReports = typedReports.filter(
      (r) =>
        isUserInUniversityScope(r.reporter_id) ||
        isUserInUniversityScope(r.target_user_id)
    )

    const totalReports = scopedReports.length

    // 4) Harmony score: 100 - (((blocks + reports) / active_matches) * 100)
    let harmonyScore = 0

    if (totalActiveMatches > 0) {
      const conflictRatio = (totalBlocks + totalReports) / totalActiveMatches
      harmonyScore = 100 - conflictRatio * 100
      if (!Number.isFinite(harmonyScore)) {
        harmonyScore = 0
      }
      // Clamp to [0, 100] for readability
      harmonyScore = Math.max(0, Math.min(100, harmonyScore))
    }

    return NextResponse.json({
      totalActiveMatches,
      totalBlocks,
      totalReports,
      harmonyScore,
    })
  } catch (error) {
    safeLogger.error('[Admin Wellbeing Analytics] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

