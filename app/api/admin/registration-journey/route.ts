import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import {
  REGISTRATION_FUNNEL_STAGES,
  REGISTRATION_FUNNEL_SIDE_METRICS,
  normalizeRegistrationStages,
  furthestRegistrationStage,
  getRequiredFunnelDropOffPairs,
} from '@/lib/admin/registration-funnel'
import {
  hasDashboardAccess,
  isFullQuestionnaireComplete,
} from '@/lib/onboarding/completion-stage'

interface JourneyUser {
  user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  signed_up_at: string
  email_confirmed_at: string | null
  is_active: boolean
  /** Numbered funnel stages 0–9 */
  stages: Record<number, boolean>
  /** First-reach timestamps from registration_funnel_progress (ISO), keyed by stage id */
  stage_reached_at: Record<number, string | null>
  /** Side metrics (e.g. settings) — not part of numbered path */
  side_metrics: Record<string, boolean>
  side_metric_reached_at: Record<string, string | null>
  furthest_stage: number
  verification_method: string | null
  last_activity_at: string | null
}

const STAGE_PROGRESS_COLUMNS: Record<number, string> = {
  0: 'signup_submitted_at',
  1: 'email_verified_at',
  2: 'academic_filled_at',
  3: 'context_logistics_at',
  4: 'using_platform_at',
  5: 'received_matches_at',
  6: 'harmony_complete_at',
  7: 'verification_decision_at',
  8: 'accepted_match_at',
  9: 'chatted_at',
}

/**
 * GET /api/admin/registration-journey
 *
 * Returns one row per user with a boolean for each stage of the registration
 * funnel, plus aggregated funnel statistics for bottleneck analysis.
 *
 * Query params:
 *   - limit (default 500, max 2000): max users in `users` array
 *   - offset (default 0)
 *   - search: substring match against email
 *   - days: only include users created within last N days (default: all-time)
 *
 * Response: {
 *   stages: FunnelStage[],
 *   sideMetrics: FunnelSideMetric[],
 *   total_users: number,
 *   users: JourneyUser[],
 *   stats: { stageCounts, stageRates, sideMetricCounts, dropOffs, biggestBottleneck }
 * }
 */
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Admin access required' },
      { status: adminCheck.status }
    )
  }

  const { searchParams } = new URL(request.url)
  const rawLimit = parseInt(searchParams.get('limit') || '500', 10)
  const limit = Math.min(Math.max(rawLimit, 1), 2000)
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)
  const search = (searchParams.get('search') || '').trim()
  const daysParam = parseInt(searchParams.get('days') || '0', 10)
  const since =
    daysParam > 0 ? new Date(Date.now() - daysParam * 24 * 60 * 60 * 1000).toISOString() : null

  try {
    const admin = createAdminClient()

    // --- 1) Base user list with email + signup timestamp + email confirmation ---
    // Use auth.admin.listUsers to capture email_confirmed_at since the public
    // `users` table doesn't mirror it.
    const pageSize = 1000
    const allAuthUsers: Array<{
      id: string
      email: string
      created_at: string
      email_confirmed_at: string | null
    }> = []
    let page = 1
    while (page <= 20) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: pageSize })
      if (error) {
        safeLogger.error('[Admin Journey] listUsers failed', { error, page })
        break
      }
      const batch = data?.users || []
      for (const u of batch) {
        if (!u.email) continue
        allAuthUsers.push({
          id: u.id,
          email: u.email,
          created_at: u.created_at || new Date().toISOString(),
          email_confirmed_at: u.email_confirmed_at || null,
        })
      }
      if (batch.length < pageSize) break
      page++
    }

    // --- 2) Apply server-side filters early so the per-stage queries are smaller ---
    let workingUsers = allAuthUsers
    if (since) {
      workingUsers = workingUsers.filter((u) => u.created_at >= since)
    }
    if (search) {
      const needle = search.toLowerCase()
      workingUsers = workingUsers.filter((u) => u.email.toLowerCase().includes(needle))
    }

    // Newest first
    workingUsers.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))

    const allUserIds = workingUsers.map((u) => u.id)

    if (allUserIds.length === 0) {
      return NextResponse.json({
        stages: REGISTRATION_FUNNEL_STAGES,
        sideMetrics: REGISTRATION_FUNNEL_SIDE_METRICS,
        total_users: 0,
        users: [],
        stats: {
          stageCounts: {},
          stageRates: {},
          sideMetricCounts: {},
          dropOffs: [],
          biggestBottleneck: null,
        },
      })
    }

    // --- 3) Parallel fan-out for per-stage signals ---
    const [
      profilesRes,
      usersRes,
      verificationsApprovedRes,
      academicRes,
      onboardingSectionsRes,
      onboardingDoneRes,
      matchSuggestionsRes,
      messageSendersRes,
      nudgeRes,
      settingsProfilesRes,
      progressRes,
    ] = await Promise.all([
      admin
        .from('profiles')
        .select(
          'user_id, first_name, last_name, bio, phone, languages, verification_status, is_verified_student'
        )
        .in('user_id', allUserIds),
      admin
        .from('users')
        .select('id, is_verified_student, identity_verified_at')
        .in('id', allUserIds),
      admin
        .from('verifications')
        .select('user_id')
        .eq('status', 'approved')
        .in('user_id', allUserIds),
      admin.from('user_academic').select('user_id').in('user_id', allUserIds),
      admin
        .from('onboarding_sections')
        .select('user_id, section, answers')
        .in('user_id', allUserIds)
        .in('section', ['intro', 'logistics-context', 'academic']),
      admin
        .from('onboarding_submissions')
        .select('user_id, completion_stage')
        .in('user_id', allUserIds),
      admin.from('match_suggestions').select('member_ids, accepted_by, status'),
      admin
        .from('messages')
        .select('user_id, created_at')
        .in('user_id', allUserIds)
        .order('created_at', { ascending: false }),
      admin
        .from('verification_nudge_state')
        .select('user_id, last_action')
        .in('user_id', allUserIds),
      admin
        .from('profiles')
        .select('user_id, bio, phone, languages')
        .in('user_id', allUserIds),
      admin
        .from('registration_funnel_progress')
        .select('*')
        .in('user_id', allUserIds),
    ])

    if (profilesRes.error) safeLogger.warn('[Admin Journey] profiles fetch', profilesRes.error)
    if (usersRes.error) safeLogger.warn('[Admin Journey] users fetch', usersRes.error)
    if (academicRes.error) safeLogger.warn('[Admin Journey] academic fetch', academicRes.error)
    if (onboardingSectionsRes.error)
      safeLogger.warn('[Admin Journey] onboarding_sections fetch', onboardingSectionsRes.error)
    if (onboardingDoneRes.error)
      safeLogger.warn('[Admin Journey] onboarding_submissions fetch', onboardingDoneRes.error)
    if (matchSuggestionsRes.error)
      safeLogger.warn('[Admin Journey] match_suggestions fetch', matchSuggestionsRes.error)
    if (messageSendersRes.error)
      safeLogger.warn('[Admin Journey] messages fetch', messageSendersRes.error)
    if (nudgeRes.error) safeLogger.warn('[Admin Journey] nudge fetch', nudgeRes.error)
    if (progressRes.error)
      safeLogger.warn('[Admin Journey] funnel progress fetch', progressRes.error)

    // --- 4) Build per-user state sets ---
    const progressMap = new Map<string, any>()
    ;(progressRes.data || []).forEach((row: any) => progressMap.set(row.user_id, row))

    const profileMap = new Map<string, any>()
    ;(profilesRes.data || []).forEach((p: any) => profileMap.set(p.user_id, p))

    const verifiedSet = new Set<string>(
      (verificationsApprovedRes.data || []).map((v: any) => v.user_id)
    )
    ;(profilesRes.data || []).forEach((p: any) => {
      if (p.verification_status === 'verified' || p.is_verified_student === true) {
        verifiedSet.add(p.user_id)
      }
    })
    ;(usersRes.data || []).forEach((u: any) => {
      if (u.identity_verified_at || u.is_verified_student === true) {
        verifiedSet.add(u.id)
      }
    })

    const academicSet = new Set<string>(
      (academicRes.data || []).map((a: any) => a.user_id)
    )
    const logisticsContextSet = new Set<string>()
    for (const row of onboardingSectionsRes.data || []) {
      const answers = row.answers
      const hasAnswers = Array.isArray(answers) && answers.length > 0
      if (!hasAnswers) continue
      if (row.section === 'logistics-context') {
        logisticsContextSet.add(row.user_id)
      }
      // Intro / academic section also counts toward academic filled
      if (row.section === 'intro' || row.section === 'academic') {
        academicSet.add(row.user_id)
      }
    }

    const submissionStageMap = new Map<string, string | null>()
    for (const o of onboardingDoneRes.data || []) {
      submissionStageMap.set(o.user_id, o.completion_stage ?? null)
    }

    const userIdSet = new Set(allUserIds)
    const receivedMatchesSet = new Set<string>()
    const acceptedMatchSet = new Set<string>()
    for (const ms of matchSuggestionsRes.data || []) {
      const members: string[] = ms.member_ids || []
      const accepted: string[] = ms.accepted_by || []
      for (const id of members) {
        if (userIdSet.has(id)) receivedMatchesSet.add(id)
      }
      for (const id of accepted) {
        if (userIdSet.has(id)) acceptedMatchSet.add(id)
      }
      if (ms.status === 'confirmed') {
        for (const id of members) {
          if (userIdSet.has(id)) acceptedMatchSet.add(id)
        }
      }
    }

    const senderSet = new Set<string>()
    const lastMessageMap = new Map<string, string>()
    for (const m of messageSendersRes.data || []) {
      senderSet.add(m.user_id)
      if (!lastMessageMap.has(m.user_id)) lastMessageMap.set(m.user_id, m.created_at)
    }

    // Verification decision = verified badge OR skip recorded on soft-nudge
    const verificationDecisionSet = new Set<string>(verifiedSet)
    for (const row of nudgeRes.data || []) {
      const action = row.last_action
      if (
        action === 'skipped' ||
        action === 'verified_uni' ||
        action === 'verified_persona'
      ) {
        verificationDecisionSet.add(row.user_id)
      }
    }

    const settingsFilledSet = new Set<string>()
    for (const p of settingsProfilesRes.data || []) {
      const bioFilled = typeof p.bio === 'string' && p.bio.trim().length > 0
      const extra =
        (typeof p.phone === 'string' && p.phone.trim().length > 0) ||
        (Array.isArray(p.languages) && p.languages.length > 0)
      if (bioFilled && extra) settingsFilledSet.add(p.user_id)
    }

    // --- 5) Compute per-user stage booleans ---
    const usersOut: JourneyUser[] = workingUsers.map((u) => {
      const profile = profileMap.get(u.id)
      const hasSubmission = submissionStageMap.has(u.id)
      const completionStage = submissionStageMap.get(u.id)
      const usingPlatform = hasDashboardAccess(completionStage, hasSubmission)
      const harmonyDone = hasSubmission && isFullQuestionnaireComplete(completionStage)
      // Context logistics: section saved, or implied by dashboard/full submit
      const contextLogistics =
        logisticsContextSet.has(u.id) || usingPlatform || harmonyDone

      const progress = progressMap.get(u.id)
      const stages = normalizeRegistrationStages({
        0: true,
        1: !!u.email_confirmed_at || !!progress?.email_verified_at,
        2: academicSet.has(u.id) || contextLogistics || !!progress?.academic_filled_at,
        3: contextLogistics || !!progress?.context_logistics_at,
        4: usingPlatform || !!progress?.using_platform_at,
        5: receivedMatchesSet.has(u.id) || !!progress?.received_matches_at,
        6: harmonyDone || !!progress?.harmony_complete_at,
        7: verificationDecisionSet.has(u.id) || !!progress?.verification_decision_at,
        8: acceptedMatchSet.has(u.id) || !!progress?.accepted_match_at,
        9: senderSet.has(u.id) || !!progress?.chatted_at,
      })

      const stage_reached_at: Record<number, string | null> = {}
      for (const [id, col] of Object.entries(STAGE_PROGRESS_COLUMNS)) {
        const stageId = Number(id)
        stage_reached_at[stageId] = progress?.[col] ?? null
      }
      // Signup always has a timestamp from auth created_at as fallback
      if (!stage_reached_at[0]) stage_reached_at[0] = u.created_at
      if (!stage_reached_at[1] && u.email_confirmed_at) {
        stage_reached_at[1] = u.email_confirmed_at
      }

      return {
        user_id: u.id,
        email: u.email,
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        signed_up_at: u.created_at,
        email_confirmed_at: u.email_confirmed_at,
        is_active: true,
        stages,
        stage_reached_at,
        side_metrics: {
          settings_filled:
            settingsFilledSet.has(u.id) || !!progress?.settings_filled_at,
        },
        side_metric_reached_at: {
          settings_filled: progress?.settings_filled_at ?? null,
        },
        furthest_stage: furthestRegistrationStage(stages),
        verification_method: progress?.verification_method ?? null,
        last_activity_at: lastMessageMap.get(u.id) || null,
      }
    })

    // --- 6) Aggregated funnel stats ---
    const stageCounts: Record<number, number> = {}
    for (const stage of REGISTRATION_FUNNEL_STAGES) {
      stageCounts[stage.id] = 0
    }
    const sideMetricCounts: Record<string, number> = {}
    for (const metric of REGISTRATION_FUNNEL_SIDE_METRICS) {
      sideMetricCounts[metric.key] = 0
    }

    for (const u of usersOut) {
      for (const stage of REGISTRATION_FUNNEL_STAGES) {
        if (u.stages[stage.id]) stageCounts[stage.id]++
      }
      for (const metric of REGISTRATION_FUNNEL_SIDE_METRICS) {
        if (u.side_metrics[metric.key]) sideMetricCounts[metric.key]++
      }
    }

    const total = usersOut.length
    const stageRates: Record<number, number> = {}
    for (const stage of REGISTRATION_FUNNEL_STAGES) {
      stageRates[stage.id] = total > 0 ? (stageCounts[stage.id] / total) * 100 : 0
    }

    const dropOffs: Array<{ from: number; to: number; lost: number; dropOffRate: number }> = []
    for (const { from, to } of getRequiredFunnelDropOffPairs()) {
      const fromCount = stageCounts[from] || 0
      const toCount = stageCounts[to] || 0
      const lost = Math.max(fromCount - toCount, 0)
      const dropOffRate = fromCount > 0 ? (lost / fromCount) * 100 : 0
      dropOffs.push({ from, to, lost, dropOffRate })
    }

    const biggestBottleneck = dropOffs
      .filter((d) => d.lost > 0)
      .sort((a, b) => b.dropOffRate - a.dropOffRate)[0] || null

    const paged = usersOut.slice(offset, offset + limit)

    return NextResponse.json({
      stages: REGISTRATION_FUNNEL_STAGES,
      sideMetrics: REGISTRATION_FUNNEL_SIDE_METRICS,
      total_users: total,
      users: paged,
      stats: {
        stageCounts,
        stageRates,
        sideMetricCounts,
        dropOffs,
        biggestBottleneck: biggestBottleneck
          ? {
              stageId: biggestBottleneck.from,
              dropOffRate: biggestBottleneck.dropOffRate,
              lost: biggestBottleneck.lost,
            }
          : null,
      },
    })

  } catch (err) {
    safeLogger.error('[Admin Journey] Unexpected error', { error: err })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
