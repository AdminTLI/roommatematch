import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { openScopedAnalyticsSession } from '@/lib/admin/analytics-scope'

type TopDealbreaker = {
  key: string
  name: string
  count: number
}

const DEALBREAKER_LABELS: Record<string, string> = {
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

    // 3. Dealbreaker bottlenecks from onboarding_submissions.snapshot.transformed_responses
    const { data: submissions, error: submissionsError } = await admin
      .from('onboarding_submissions')
      .select('user_id, snapshot')
      .in('user_id', activeUserIds)

    if (submissionsError) {
      // Log but don't fail the entire endpoint – we can still return trust funnel metrics
      safeLogger.error(
        '[Admin Trust & Algorithm] Failed to fetch onboarding_submissions for dealbreakers',
        submissionsError
      )
    }

    const dealbreakerCounts = new Map<string, number>()

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
        if (!key || !DEALBREAKER_LABELS[key]) continue

        const rawValue = (response as any).value
        if (rawValue === null || rawValue === undefined) continue

        let isStrictConstraint = false

        // Heuristic interpretation – we don't have the original dealBreaker flag here,
        // so we approximate "strict" settings based on value shapes.
        if (key === 'smoking') {
          // Any truthy value or high smoking sensitivity is treated as a hard "no smoking" stance
          if (typeof rawValue === 'boolean') {
            isStrictConstraint = rawValue === true
          } else if (typeof rawValue === 'number') {
            // Higher values on smoking-related questions typically correspond to stricter no‑smoking preferences
            isStrictConstraint = rawValue >= 7
          } else {
            isStrictConstraint = true
          }
        } else if (key === 'pets_allowed') {
          // Treat "no pets" or very restrictive pets policy as a dealbreaker
          if (typeof rawValue === 'boolean') {
            isStrictConstraint = rawValue === false
          } else if (typeof rawValue === 'number') {
            // Lower values on pets tolerance imply stricter stance
            isStrictConstraint = rawValue <= 3
          } else {
            isStrictConstraint = true
          }
        } else if (key === 'parties_max' || key === 'guests_max') {
          if (typeof rawValue === 'number') {
            // Very low caps on parties/guests are treated as restrictive
            isStrictConstraint = rawValue <= 2
          } else {
            isStrictConstraint = true
          }
        } else if (key === 'alcohol_at_home' || key === 'pets_tolerance') {
          if (typeof rawValue === 'number') {
            // Lower values on these sliders indicate stricter constraints
            isStrictConstraint = rawValue <= 3
          } else {
            isStrictConstraint = true
          }
        }

        if (!isStrictConstraint) continue
        if (seenForUser.has(key)) continue

        seenForUser.add(key)
      }

      for (const key of seenForUser) {
        const prev = dealbreakerCounts.get(key) ?? 0
        dealbreakerCounts.set(key, prev + 1)
      }
    }

    const topDealbreakers: TopDealbreaker[] = Array.from(dealbreakerCounts.entries())
      .map(([key, count]) => ({
        key,
        name: DEALBREAKER_LABELS[key] ?? key,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

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

