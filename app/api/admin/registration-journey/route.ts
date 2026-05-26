import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import {
  REGISTRATION_FUNNEL_STAGES,
  normalizeRegistrationStages,
  furthestRegistrationStage,
} from '@/lib/admin/registration-funnel'
import { questionSchemas } from '@/lib/onboarding/validation'

const TOTAL_REQUIRED_QUESTIONS = Object.keys(questionSchemas).length

interface JourneyUser {
  user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  signed_up_at: string
  email_confirmed_at: string | null
  is_active: boolean
  // Per-stage booleans, keyed by stage id (0..11)
  stages: Record<number, boolean>
  // Furthest stage reached (for sorting / heatmap)
  furthest_stage: number
  // First & last activity timestamps
  last_activity_at: string | null
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
 *   total_users: number,
 *   users: JourneyUser[],
 *   stats: {
 *     stageCounts: { [stageId: number]: number },
 *     stageRates: { [stageId: number]: number },     // % of total_users
 *     dropOffs: { from: number, to: number, lost: number, dropOffRate: number }[],
 *     biggestBottleneck: { stageId: number, dropOffRate: number } | null,
 *   }
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
        total_users: 0,
        users: [],
        stats: { stageCounts: {}, stageRates: {}, dropOffs: [], biggestBottleneck: null },
      })
    }

    // --- 3) Parallel fan-out for per-stage signals ---
    // We chunk `in()` calls to keep URLs short. For most installs the user list
    // fits in one call (Postgres allows ~32k params, Supabase encodes as
    // `in.(...)`, capped around 1MB URL length — well over what we need).
    const [
      profilesRes,
      verificationsApprovedRes,
      profilesVerifiedRes,
      academicRes,
      responsesRes,
      onboardingDoneRes,
      matchSuggestionsRes,
      chatMembersRes,
      messageSendersRes,
      settingsProfilesRes,
    ] = await Promise.all([
      admin
        .from('profiles')
        .select('user_id, first_name, last_name, bio, phone, languages, verification_status')
        .in('user_id', allUserIds),
      admin
        .from('verifications')
        .select('user_id')
        .eq('status', 'approved')
        .in('user_id', allUserIds),
      // Already covered by profiles above but included for clarity / fallback.
      Promise.resolve({ data: null as any[] | null, error: null as any }),
      admin.from('user_academic').select('user_id').in('user_id', allUserIds),
      admin.from('responses').select('user_id').in('user_id', allUserIds),
      admin.from('onboarding_submissions').select('user_id').in('user_id', allUserIds),
      // For match_suggestions we fetch all and filter in memory; using
      // `.overlaps()` with a very large uuid[] would risk overflowing the
      // REST URL length budget. The table is small relative to users.
      admin
        .from('match_suggestions')
        .select('member_ids, accepted_by, status'),
      admin.from('chat_members').select('user_id').in('user_id', allUserIds),
      admin
        .from('messages')
        .select('user_id, created_at')
        .in('user_id', allUserIds)
        .order('created_at', { ascending: false }),
      admin
        .from('profiles')
        .select('user_id, bio, phone, languages')
        .in('user_id', allUserIds),
    ])

    if (profilesRes.error) safeLogger.warn('[Admin Journey] profiles fetch', profilesRes.error)
    if (academicRes.error) safeLogger.warn('[Admin Journey] academic fetch', academicRes.error)
    if (responsesRes.error) safeLogger.warn('[Admin Journey] responses fetch', responsesRes.error)
    if (onboardingDoneRes.error)
      safeLogger.warn('[Admin Journey] onboarding_submissions fetch', onboardingDoneRes.error)
    if (matchSuggestionsRes.error)
      safeLogger.warn('[Admin Journey] match_suggestions fetch', matchSuggestionsRes.error)
    if (chatMembersRes.error)
      safeLogger.warn('[Admin Journey] chat_members fetch', chatMembersRes.error)
    if (messageSendersRes.error)
      safeLogger.warn('[Admin Journey] messages fetch', messageSendersRes.error)

    // --- 4) Build per-user state sets ---
    const profileMap = new Map<string, any>()
    ;(profilesRes.data || []).forEach((p: any) => profileMap.set(p.user_id, p))

    const verifiedSet = new Set<string>(
      (verificationsApprovedRes.data || []).map((v: any) => v.user_id)
    )
    // Fallback: profiles.verification_status === 'verified'
    ;(profilesRes.data || []).forEach((p: any) => {
      if (p.verification_status === 'verified') verifiedSet.add(p.user_id)
    })

    const academicSet = new Set<string>(
      (academicRes.data || []).map((a: any) => a.user_id)
    )

    const responseCountMap = new Map<string, number>()
    for (const r of responsesRes.data || []) {
      responseCountMap.set(r.user_id, (responseCountMap.get(r.user_id) || 0) + 1)
    }

    const submittedSet = new Set<string>(
      (onboardingDoneRes.data || []).map((o: any) => o.user_id)
    )

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
      // Treat 'confirmed' status as accepted for all participants too
      if (ms.status === 'confirmed') {
        for (const id of members) {
          if (userIdSet.has(id)) acceptedMatchSet.add(id)
        }
      }
    }

    const chatMemberSet = new Set<string>(
      (chatMembersRes.data || []).map((c: any) => c.user_id)
    )

    const senderSet = new Set<string>()
    const lastMessageMap = new Map<string, string>()
    for (const m of messageSendersRes.data || []) {
      senderSet.add(m.user_id)
      if (!lastMessageMap.has(m.user_id)) lastMessageMap.set(m.user_id, m.created_at)
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
    const halfwayThreshold = Math.ceil(TOTAL_REQUIRED_QUESTIONS / 2)
    const startedCeiling = Math.ceil(TOTAL_REQUIRED_QUESTIONS * 0.2)

    const usersOut: JourneyUser[] = workingUsers.map((u) => {
      const profile = profileMap.get(u.id)
      const responseCount = responseCountMap.get(u.id) || 0

      const stage0 = true
      const stage1 = !!u.email_confirmed_at
      const stage2 = verifiedSet.has(u.id)
      const stage3 = academicSet.has(u.id)
      const stage4 = responseCount > 0 && responseCount < startedCeiling
      const stage5 = responseCount > halfwayThreshold
      const stage6 = submittedSet.has(u.id)
      const stage7 = receivedMatchesSet.has(u.id)
      const stage8 = acceptedMatchSet.has(u.id)
      const stage9 = chatMemberSet.has(u.id)
      const stage10 = senderSet.has(u.id)
      const stage11 = settingsFilledSet.has(u.id)

      const stages = normalizeRegistrationStages({
        0: stage0,
        1: stage1,
        2: stage2,
        3: stage3,
        4: stage4,
        5: stage5,
        6: stage6,
        7: stage7,
        8: stage8,
        9: stage9,
        10: stage10,
        11: stage11,
      })

      const furthest = furthestRegistrationStage(stages)

      return {
        user_id: u.id,
        email: u.email,
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        signed_up_at: u.created_at,
        email_confirmed_at: u.email_confirmed_at,
        is_active: true,
        stages,
        furthest_stage: furthest,
        last_activity_at: lastMessageMap.get(u.id) || null,
      }
    })

    // --- 6) Aggregated funnel stats (cumulative semantics) ---
    // For the funnel we treat each stage as "user reached *at least* this
    // stage" — independent of whether they completed every prior stage. This
    // is more faithful to how users move through the product (e.g. someone
    // who skipped the questionnaire-started bucket but landed on >50% should
    // still count as having reached stage 5).
    const stageCounts: Record<number, number> = {}
    for (const stage of REGISTRATION_FUNNEL_STAGES) {
      stageCounts[stage.id] = 0
    }
    for (const u of usersOut) {
      for (const stage of REGISTRATION_FUNNEL_STAGES) {
        if (u.stages[stage.id]) stageCounts[stage.id]++
      }
    }

    const total = usersOut.length
    const stageRates: Record<number, number> = {}
    for (const stage of REGISTRATION_FUNNEL_STAGES) {
      stageRates[stage.id] = total > 0 ? (stageCounts[stage.id] / total) * 100 : 0
    }

    const dropOffs: Array<{ from: number; to: number; lost: number; dropOffRate: number }> = []
    for (let i = 0; i < REGISTRATION_FUNNEL_STAGES.length - 1; i++) {
      const from = REGISTRATION_FUNNEL_STAGES[i].id
      const to = REGISTRATION_FUNNEL_STAGES[i + 1].id
      const fromCount = stageCounts[from] || 0
      const toCount = stageCounts[to] || 0
      const lost = Math.max(fromCount - toCount, 0)
      const dropOffRate = fromCount > 0 ? (lost / fromCount) * 100 : 0
      dropOffs.push({ from, to, lost, dropOffRate })
    }

    const biggestBottleneck = dropOffs
      .filter((d) => d.lost > 0)
      .sort((a, b) => b.dropOffRate - a.dropOffRate)[0] || null

    // --- 7) Apply pagination *after* computing stats so the bottleneck
    //         numbers always reflect the full filtered population ---
    const paged = usersOut.slice(offset, offset + limit)

    return NextResponse.json({
      stages: REGISTRATION_FUNNEL_STAGES,
      total_users: total,
      users: paged,
      stats: {
        stageCounts,
        stageRates,
        dropOffs,
        biggestBottleneck: biggestBottleneck
          ? { stageId: biggestBottleneck.from, dropOffRate: biggestBottleneck.dropOffRate, lost: biggestBottleneck.lost }
          : null,
      },
    })
  } catch (err) {
    safeLogger.error('[Admin Journey] Unexpected error', { error: err })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
