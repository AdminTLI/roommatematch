import { createAdminClient } from '@/lib/supabase/server'
import {
  REGISTRATION_FUNNEL_STAGES,
  normalizeRegistrationStages,
  furthestRegistrationStage,
} from '@/lib/admin/registration-funnel'
import { questionSchemas } from '@/lib/onboarding/validation'
import {
  studentPseudoId,
  suppressSmallCount,
  suppressSmallRate,
} from '@/lib/institution/anonymization'

const TOTAL_REQUIRED_QUESTIONS = Object.keys(questionSchemas).length

export interface InstitutionJourneyStudent {
  student_pseudo_id: string
  signed_up_at: string
  email_confirmed: boolean
  verification_status: string | null
  furthest_stage: number
  stages: Record<number, boolean>
  last_activity_at: string | null
}

export interface InstitutionMetricsPayload {
  institution_id: string
  institution_name: string | null
  period: string
  summary: {
    total_students: number | string
    verified_students: number | string
    questionnaire_completed: number | string
    with_matches: number | string
    active_matches: number | string
    verification_rate_pct: number | string
    questionnaire_rate_pct: number | string
  }
  funnel: {
    stages: typeof REGISTRATION_FUNNEL_STAGES
    stageCounts: Record<number, number | string>
    stageRates: Record<number, number | string>
  }
  matches: {
    total_suggestions: number | string
    pending: number | string
    accepted: number | string
    confirmed: number | string
    avg_fit_score_pct: number | string | null
  }
  students: InstitutionJourneyStudent[]
  total_students_in_scope: number
}

function getPeriodStart(period: string): string | null {
  const days = parseInt(period, 10)
  if (!days || days <= 0) return null
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

export async function computeInstitutionMetrics(
  institutionId: string,
  institutionName: string | null,
  options?: { period?: string; limit?: number; offset?: number }
): Promise<InstitutionMetricsPayload> {
  const admin = createAdminClient()
  const period = options?.period || 'all'
  const since = period !== 'all' ? getPeriodStart(period) : null
  const limit = Math.min(Math.max(options?.limit ?? 500, 1), 2000)
  const offset = Math.max(options?.offset ?? 0, 0)

  const { data: profileRows } = await admin
    .from('profiles')
    .select('user_id, verification_status, created_at')
    .eq('university_id', institutionId)

  let workingProfiles = profileRows || []
  if (since) {
    workingProfiles = workingProfiles.filter((p) => p.created_at >= since)
  }

  const userIds = workingProfiles.map((p) => p.user_id)
  const totalInScope = userIds.length

  if (userIds.length === 0) {
    const emptyCounts: Record<number, number | string> = {}
    const emptyRates: Record<number, number | string> = {}
    for (const stage of REGISTRATION_FUNNEL_STAGES) {
      emptyCounts[stage.id] = suppressSmallCount(0)
      emptyRates[stage.id] = suppressSmallRate(0, 0)
    }
    return {
      institution_id: institutionId,
      institution_name: institutionName,
      period,
      summary: {
        total_students: suppressSmallCount(0),
        verified_students: suppressSmallCount(0),
        questionnaire_completed: suppressSmallCount(0),
        with_matches: suppressSmallCount(0),
        active_matches: suppressSmallCount(0),
        verification_rate_pct: suppressSmallRate(0, 0),
        questionnaire_rate_pct: suppressSmallRate(0, 0),
      },
      funnel: {
        stages: REGISTRATION_FUNNEL_STAGES,
        stageCounts: emptyCounts,
        stageRates: emptyRates,
      },
      matches: {
        total_suggestions: suppressSmallCount(0),
        pending: suppressSmallCount(0),
        accepted: suppressSmallCount(0),
        confirmed: suppressSmallCount(0),
        avg_fit_score_pct: null,
      },
      students: [],
      total_students_in_scope: 0,
    }
  }

  const authUsersById = new Map<
    string,
    { created_at: string; email_confirmed_at: string | null }
  >()
  {
    let page = 1
    while (page <= 20) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
      if (error || !data?.users?.length) break
      for (const u of data.users) {
        if (userIds.includes(u.id)) {
          authUsersById.set(u.id, {
            created_at: u.created_at || new Date().toISOString(),
            email_confirmed_at: u.email_confirmed_at || null,
          })
        }
      }
      if (data.users.length < 1000) break
      page++
    }
  }

  const [
    verificationsApprovedRes,
    academicRes,
    responsesRes,
    onboardingDoneRes,
    matchSuggestionsRes,
    chatMembersRes,
    messageSendersRes,
    settingsProfilesRes,
  ] = await Promise.all([
    admin.from('verifications').select('user_id').eq('status', 'approved').in('user_id', userIds),
    admin.from('user_academic').select('user_id').in('user_id', userIds),
    admin.from('responses').select('user_id').in('user_id', userIds),
    admin.from('onboarding_submissions').select('user_id').in('user_id', userIds),
    admin.from('match_suggestions').select('member_ids, accepted_by, status, fit_score, fit_index'),
    admin.from('chat_members').select('user_id').in('user_id', userIds),
    admin
      .from('messages')
      .select('user_id, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false }),
    admin.from('profiles').select('user_id, bio, phone, languages').in('user_id', userIds),
  ])

  const profileMap = new Map(workingProfiles.map((p) => [p.user_id, p]))
  const verifiedSet = new Set<string>(
    (verificationsApprovedRes.data || []).map((v: { user_id: string }) => v.user_id)
  )
  workingProfiles.forEach((p) => {
    if (p.verification_status === 'verified') verifiedSet.add(p.user_id)
  })

  const academicSet = new Set<string>(
    (academicRes.data || []).map((a: { user_id: string }) => a.user_id)
  )
  const responseCountMap = new Map<string, number>()
  for (const r of responsesRes.data || []) {
    responseCountMap.set(r.user_id, (responseCountMap.get(r.user_id) || 0) + 1)
  }
  const submittedSet = new Set<string>(
    (onboardingDoneRes.data || []).map((o: { user_id: string }) => o.user_id)
  )

  const userIdSet = new Set(userIds)
  const receivedMatchesSet = new Set<string>()
  const acceptedMatchSet = new Set<string>()
  let matchPending = 0
  let matchAccepted = 0
  let matchConfirmed = 0
  let fitScoreSum = 0
  let fitScoreCount = 0

  for (const ms of matchSuggestionsRes.data || []) {
    const members: string[] = ms.member_ids || []
    const inScope = members.filter((id) => userIdSet.has(id))
    if (inScope.length === 0) continue

    if (ms.status === 'pending') matchPending++
    if (ms.status === 'accepted') matchAccepted++
    if (ms.status === 'confirmed') matchConfirmed++

    const fitIndex = Number(ms.fit_index ?? 0)
    const fitScore = fitIndex > 0 ? fitIndex / 100 : Number(ms.fit_score || 0)
    if (fitScore > 0) {
      fitScoreSum += fitScore
      fitScoreCount++
    }

    for (const id of members) {
      if (userIdSet.has(id)) receivedMatchesSet.add(id)
    }
    const accepted: string[] = ms.accepted_by || []
    for (const id of accepted) {
      if (userIdSet.has(id)) acceptedMatchSet.add(id)
    }
    if (ms.status === 'confirmed') {
      for (const id of members) {
        if (userIdSet.has(id)) acceptedMatchSet.add(id)
      }
    }
  }

  const chatMemberSet = new Set<string>(
    (chatMembersRes.data || []).map((c: { user_id: string }) => c.user_id)
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

  const halfwayThreshold = Math.ceil(TOTAL_REQUIRED_QUESTIONS / 2)
  const startedCeiling = Math.ceil(TOTAL_REQUIRED_QUESTIONS * 0.2)

  const studentsOut: InstitutionJourneyStudent[] = userIds.map((uid) => {
    const authUser = authUsersById.get(uid)
    const profile = profileMap.get(uid)
    const responseCount = responseCountMap.get(uid) || 0

    const stages = normalizeRegistrationStages({
      0: true,
      1: !!authUser?.email_confirmed_at,
      2: verifiedSet.has(uid),
      3: academicSet.has(uid),
      4: responseCount > 0 && responseCount < startedCeiling,
      5: responseCount > halfwayThreshold,
      6: submittedSet.has(uid),
      7: receivedMatchesSet.has(uid),
      8: acceptedMatchSet.has(uid),
      9: chatMemberSet.has(uid),
      10: senderSet.has(uid),
      11: settingsFilledSet.has(uid),
    })

    return {
      student_pseudo_id: studentPseudoId(uid, institutionId),
      signed_up_at: authUser?.created_at || profile?.created_at || new Date().toISOString(),
      email_confirmed: !!authUser?.email_confirmed_at,
      verification_status: profile?.verification_status || null,
      furthest_stage: furthestRegistrationStage(stages),
      stages,
      last_activity_at: lastMessageMap.get(uid) || null,
    }
  })

  studentsOut.sort((a, b) => (a.signed_up_at < b.signed_up_at ? 1 : -1))

  const stageCountsRaw: Record<number, number> = {}
  for (const stage of REGISTRATION_FUNNEL_STAGES) stageCountsRaw[stage.id] = 0
  for (const s of studentsOut) {
    for (const stage of REGISTRATION_FUNNEL_STAGES) {
      if (s.stages[stage.id]) stageCountsRaw[stage.id]++
    }
  }

  const verifiedCount = verifiedSet.size
  const questionnaireDone = submittedSet.size
  const withMatches = receivedMatchesSet.size
  const activeMatches = matchConfirmed

  const stageCounts: Record<number, number | string> = {}
  const stageRates: Record<number, number | string> = {}
  for (const stage of REGISTRATION_FUNNEL_STAGES) {
    stageCounts[stage.id] = suppressSmallCount(stageCountsRaw[stage.id] || 0)
    stageRates[stage.id] = suppressSmallRate(stageCountsRaw[stage.id] || 0, totalInScope)
  }

  const avgFit =
    fitScoreCount > 0
      ? Math.round((fitScoreSum / fitScoreCount) * 1000) / 10
      : null

  return {
    institution_id: institutionId,
    institution_name: institutionName,
    period,
    summary: {
      total_students: suppressSmallCount(totalInScope),
      verified_students: suppressSmallCount(verifiedCount),
      questionnaire_completed: suppressSmallCount(questionnaireDone),
      with_matches: suppressSmallCount(withMatches),
      active_matches: suppressSmallCount(activeMatches),
      verification_rate_pct: suppressSmallRate(verifiedCount, totalInScope),
      questionnaire_rate_pct: suppressSmallRate(questionnaireDone, totalInScope),
    },
    funnel: {
      stages: REGISTRATION_FUNNEL_STAGES,
      stageCounts,
      stageRates,
    },
    matches: {
      total_suggestions: suppressSmallCount(
        matchPending + matchAccepted + matchConfirmed
      ),
      pending: suppressSmallCount(matchPending),
      accepted: suppressSmallCount(matchAccepted),
      confirmed: suppressSmallCount(matchConfirmed),
      avg_fit_score_pct:
        avgFit !== null && fitScoreCount >= 5 ? avgFit : avgFit !== null ? '<5' : null,
    },
    students: studentsOut.slice(offset, offset + limit),
    total_students_in_scope: totalInScope,
  }
}
