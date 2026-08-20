import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { openScopedAnalyticsSession } from '@/lib/admin/analytics-scope'
import { HARD_GATE_IDS, GATE_LABELS } from '@/lib/matching/item-weights.v2'

type TopDealbreaker = {
  key: string
  name: string
  count: number
}

// v2 platform hard gates — these replace the old per-user dealbreaker system
const V2_GATE_LABELS: Record<string, string> = {
  ...GATE_LABELS,
}

// v1 legacy labels kept for backward compatibility with old onboarding_submissions
const V1_DEALBREAKER_LABELS: Record<string, string> = {
  smoking: 'No smoking indoors',
  pets_allowed: 'No pets / strict pets policy',
  parties_max: 'Strict limit on gatherings',
  guests_max: 'Strict overnight guests policy',
  alcohol_at_home: 'Alcohol in common areas restricted',
  pets_tolerance: 'Low pets tolerance',
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
        totalUsers: 0,
        verifiedUsers: 0,
        verificationRate: 0,
        topDealbreakers: [] as TopDealbreaker[],
      })
    }

    const { data: users, error: usersError } = await admin
      .from('users')
      .select('id')
      .eq('is_active', true)
      .in('id', Array.from(universityUserIds))

    if (usersError) {
      safeLogger.error('[Admin Trust & Algorithm] Failed to fetch active users', usersError)
      return NextResponse.json(
        { error: 'Failed to load trust & algorithm metrics' },
        { status: 500 }
      )
    }

    const activeUserIds = (users || [])
      .map(u => u.id as string)
      .filter(Boolean)
    const totalUsers = activeUserIds.length

    if (totalUsers === 0) {
      return NextResponse.json({
        totalUsers: 0,
        verifiedUsers: 0,
        verificationRate: 0,
        topDealbreakers: [] as TopDealbreaker[],
      })
    }

    const activeUserIdSet = new Set(activeUserIds)

    // 2. Verified users (Persona IDV)
    // Source of truth: verifications.status='approved' OR profiles.verification_status='verified'
    const [
      { data: approvedVerifications, error: verificationsError },
      { data: verifiedProfiles, error: profilesError },
    ] = await Promise.all([
      admin
        .from('verifications')
        .select('user_id')
        .eq('status', 'approved')
        .in('user_id', activeUserIds),
      admin
        .from('profiles')
        .select('user_id')
        .eq('verification_status', 'verified')
        .in('user_id', activeUserIds),
    ])

    if (verificationsError) {
      safeLogger.error('[Admin Trust & Algorithm] Failed to fetch verifications', verificationsError)
      return NextResponse.json(
        { error: 'Failed to load trust & algorithm metrics' },
        { status: 500 }
      )
    }

    if (profilesError) {
      safeLogger.error('[Admin Trust & Algorithm] Failed to fetch verified profiles', profilesError)
      return NextResponse.json(
        { error: 'Failed to load trust & algorithm metrics' },
        { status: 500 }
      )
    }

    const verifiedUserIds = new Set<string>()

    for (const v of approvedVerifications || []) {
      const userId = v.user_id as string | null
      if (userId && activeUserIdSet.has(userId)) {
        verifiedUserIds.add(userId)
      }
    }

    for (const p of verifiedProfiles || []) {
      const userId = p.user_id as string | null
      if (userId && activeUserIdSet.has(userId)) {
        verifiedUserIds.add(userId)
      }
    }

    const verifiedUsers = verifiedUserIds.size
    const verificationRate =
      totalUsers > 0
        ? Number(((verifiedUsers / totalUsers) * 100).toFixed(1))
        : 0

    // 3a. v2 platform gate conflicts from match_suggestions.gate_conflicts
    // Count how many suggestions were blocked or soft-overridden per gate
    const { data: matchSuggestions, error: matchSuggestionsError } = await admin
      .from('match_suggestions')
      .select('user_a_id, user_b_id, gate_conflicts')
      .or(
        `user_a_id.in.(${activeUserIds.join(',')}),user_b_id.in.(${activeUserIds.join(',')})`
      )
      .not('gate_conflicts', 'is', null)

    if (matchSuggestionsError) {
      safeLogger.warn(
        '[Admin Trust & Algorithm] Failed to fetch match_suggestions gate_conflicts',
        matchSuggestionsError
      )
    }

    const v2GateCounts = new Map<string, number>()

    for (const row of matchSuggestions || []) {
      const conflicts = (row as any).gate_conflicts as string[] | null
      if (!Array.isArray(conflicts) || conflicts.length === 0) continue
      for (const gateId of conflicts) {
        if (!HARD_GATE_IDS.includes(gateId as any)) continue
        v2GateCounts.set(gateId, (v2GateCounts.get(gateId) ?? 0) + 1)
      }
    }

    // 3b. v1 legacy dealbreaker bottlenecks from onboarding_submissions
    const { data: submissions, error: submissionsError } = await admin
      .from('onboarding_submissions')
      .select('user_id, snapshot')
      .in('user_id', activeUserIds)

    if (submissionsError) {
      safeLogger.error(
        '[Admin Trust & Algorithm] Failed to fetch onboarding_submissions for dealbreakers',
        submissionsError
      )
    }

    const v1DealbreakerCounts = new Map<string, number>()

    for (const submission of submissions || []) {
      const userId = submission.user_id as string | null
      if (!userId || !activeUserIdSet.has(userId)) continue

      const snapshot = (submission as any).snapshot as {
        transformed_responses?: Array<{ question_key: string; value: any }>
      } | null

      const responses = Array.isArray(snapshot?.transformed_responses)
        ? snapshot!.transformed_responses!
        : []

      if (responses.length === 0) continue

      const seenForUser = new Set<string>()

      for (const response of responses) {
        const key = response.question_key
        if (!key || !V1_DEALBREAKER_LABELS[key]) continue

        const rawValue = (response as any).value
        if (rawValue === null || rawValue === undefined) continue

        let isStrictConstraint = false

        if (key === 'smoking') {
          if (typeof rawValue === 'boolean') isStrictConstraint = rawValue === true
          else if (typeof rawValue === 'number') isStrictConstraint = rawValue >= 7
          else isStrictConstraint = true
        } else if (key === 'pets_allowed') {
          if (typeof rawValue === 'boolean') isStrictConstraint = rawValue === false
          else if (typeof rawValue === 'number') isStrictConstraint = rawValue <= 3
          else isStrictConstraint = true
        } else if (key === 'parties_max' || key === 'guests_max') {
          if (typeof rawValue === 'number') isStrictConstraint = rawValue <= 2
          else isStrictConstraint = true
        } else if (key === 'alcohol_at_home' || key === 'pets_tolerance') {
          if (typeof rawValue === 'number') isStrictConstraint = rawValue <= 3
          else isStrictConstraint = true
        }

        if (!isStrictConstraint || seenForUser.has(key)) continue
        seenForUser.add(key)
      }

      for (const key of seenForUser) {
        v1DealbreakerCounts.set(key, (v1DealbreakerCounts.get(key) ?? 0) + 1)
      }
    }

    // Merge v2 gates (preferred) and v1 legacy, deduplicated by display name
    const mergedCounts = new Map<string, { name: string; count: number }>()

    for (const [key, count] of v2GateCounts) {
      mergedCounts.set(key, { name: V2_GATE_LABELS[key] ?? key, count })
    }

    for (const [key, count] of v1DealbreakerCounts) {
      if (!mergedCounts.has(key)) {
        mergedCounts.set(key, { name: V1_DEALBREAKER_LABELS[key] ?? key, count })
      }
    }

    const topDealbreakers: TopDealbreaker[] = Array.from(mergedCounts.entries())
      .map(([key, { name, count }]) => ({ key, name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)

    return NextResponse.json({
      totalUsers,
      verifiedUsers,
      verificationRate,
      topDealbreakers,
    })
  } catch (error) {
    safeLogger.error('[Admin Trust & Algorithm] Unexpected error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

