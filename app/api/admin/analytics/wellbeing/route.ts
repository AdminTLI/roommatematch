import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

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
    const adminCheck = await requireAdmin(request, false)

    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { adminRecord } = adminCheck
    const admin = createAdminClient()

    if (!adminRecord) {
      return NextResponse.json(
        { error: 'Admin record not found' },
        { status: 500 }
      )
    }

    const isSuperAdmin = adminRecord.role === 'super_admin'
    const universityId = isSuperAdmin ? null : adminRecord.university_id

    // If admin is scoped to a university, find all user_ids for that university
    let universityUserIds: Set<string> | null = null
    if (universityId) {
      const { data: academic, error: academicError } = await admin
        .from('user_academic')
        .select('user_id')
        .eq('university_id', universityId)

      if (academicError) {
        safeLogger.error('[Admin Wellbeing Analytics] Failed to load user_academic', {
          error: academicError,
          universityId,
        })
      }

      universityUserIds = new Set(academic?.map((a) => a.user_id) || [])
    }

    // Helper to decide if a pair of users belongs to this admin's university scope
    const isPairInUniversityScope = (aUserId: string, bUserId: string): boolean => {
      if (!universityId || !universityUserIds) {
        return true
      }
      if (universityUserIds.size === 0) {
        return false
      }
      // For university-scoped admins, only count pairs where both users are from their university
      return universityUserIds.has(aUserId) && universityUserIds.has(bUserId)
    }

    const isUserInUniversityScope = (userId: string | null | undefined): boolean => {
      if (!userId) return false
      if (!universityId || !universityUserIds) {
        return true
      }
      if (universityUserIds.size === 0) {
        return false
      }
      return universityUserIds.has(userId)
    }

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

      // For university-scoped admins, count blocks where at least one side is in their university
      if (universityId && universityUserIds) {
        return (
          isUserInUniversityScope(b.user_id) ||
          isUserInUniversityScope(b.blocked_user_id)
        )
      }

      return true
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

    const scopedReports = typedReports.filter((r) => {
      if (!universityId || !universityUserIds) {
        return true
      }
      if (universityUserIds.size === 0) {
        return false
      }

      return (
        isUserInUniversityScope(r.reporter_id) ||
        isUserInUniversityScope(r.target_user_id)
      )
    })

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

