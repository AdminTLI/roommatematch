import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import {
  getUniversityAffiliateUserIds,
  resolveAdminAnalyticsScope,
} from '@/lib/admin/analytics-scope'
import { HOUSING_LOOKING_KEYS } from '@/lib/admin/metrics-filters'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function profileLooksActive(housing: unknown): boolean {
  if (!housing || !Array.isArray(housing)) return false
  return (housing as string[]).some((k) => HOUSING_LOOKING_KEYS.has(k))
}

export type AtRiskStudyYearBucket = { label: string; count: number }

export type AtRiskResponse = {
  totalAtRisk: number
  byStudyYear: AtRiskStudyYearBucket[]
}

/**
 * Prolonged unmatched, academically verified students (retention risk proxy).
 * Rules: housing still "looking", zero confirmed rows in `matches`, account age > 30d,
 * activity within last 14 days (profiles.last_seen_at or users.updated_at).
 */
export async function GET(request: NextRequest) {
  try {
    const scope = await resolveAdminAnalyticsScope(request)
    if (!scope.ok) {
      return NextResponse.json({ error: scope.error }, { status: scope.status })
    }

    const { universityId } = scope
    const admin = createAdminClient()
    const affiliate = await getUniversityAffiliateUserIds(admin, universityId)
    if (affiliate.size === 0) {
      return NextResponse.json({ totalAtRisk: 0, byStudyYear: [] } satisfies AtRiskResponse)
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const cutoff = thirtyDaysAgo.toISOString()
    const activeCut = fourteenDaysAgo.toISOString()

    const atRiskUserIds: string[] = []

    for (const part of chunk([...affiliate], 200)) {
      const { data: users } = await admin.from('users').select('id, created_at, updated_at').in('id', part)

      const { data: profiles } = await admin
        .from('profiles')
        .select('user_id, housing_status, is_verified_student, last_seen_at')
        .in('user_id', part)

      const profByUser = new Map<string, { housing_status: unknown; is_verified_student: boolean | null; last_seen_at: string | null }>()
      for (const p of profiles || []) {
        if (!p.user_id) continue
        profByUser.set(p.user_id, {
          housing_status: p.housing_status,
          is_verified_student: p.is_verified_student as boolean | null,
          last_seen_at: (p as { last_seen_at?: string | null }).last_seen_at ?? null,
        })
      }

      const { data: ca } = await admin.from('matches').select('a_user, b_user').eq('status', 'confirmed').in('a_user', part)
      const { data: cb } = await admin.from('matches').select('a_user, b_user').eq('status', 'confirmed').in('b_user', part)
      const withConfirmed = new Set<string>()
      for (const m of [...(ca || []), ...(cb || [])]) {
        const a = (m as { a_user?: string }).a_user
        const b = (m as { b_user?: string }).b_user
        if (a && part.includes(a)) withConfirmed.add(a)
        if (b && part.includes(b)) withConfirmed.add(b)
      }

      for (const u of users || []) {
        if (!u.id || !u.created_at) continue
        if (new Date(u.created_at) >= thirtyDaysAgo) continue

        const pr = profByUser.get(u.id)
        if (!pr || pr.is_verified_student !== true) continue
        if (!profileLooksActive(pr.housing_status)) continue
        if (withConfirmed.has(u.id)) continue

        const lastSeen = pr.last_seen_at
        const uUpdated = (u as { updated_at?: string }).updated_at
        const activeTs = lastSeen || uUpdated
        if (!activeTs || new Date(activeTs) < fourteenDaysAgo) continue

        atRiskUserIds.push(u.id)
      }
    }

    if (atRiskUserIds.length === 0) {
      return NextResponse.json({ totalAtRisk: 0, byStudyYear: [] } satisfies AtRiskResponse)
    }

    const degreeByUser = new Map<string, string>()
    const { data: ua } = await admin.from('user_academic').select('user_id, degree_level').eq('university_id', universityId)
    for (const r of ua || []) {
      if (r.user_id) degreeByUser.set(r.user_id, String(r.degree_level || ''))
    }

    const studyYearByUser = new Map<string, number>()
    for (const part of chunk(atRiskUserIds, 250)) {
      const { data: sy } = await admin.from('user_study_year_v').select('user_id, study_year').in('user_id', part)
      for (const row of sy || []) {
        if (row.user_id && row.study_year != null) studyYearByUser.set(row.user_id, Number(row.study_year))
      }
    }

    const buckets = new Map<string, number>()
    for (const uid of atRiskUserIds) {
      const dl = degreeByUser.get(uid)
      let label = 'Other'
      if (dl === 'master' || dl === 'premaster') {
        label = "Master's / Pre-master"
      } else if (dl === 'bachelor') {
        const y = studyYearByUser.get(uid)
        label = y != null && !Number.isNaN(y) ? `Bachelor · Year ${y}` : 'Bachelor'
      }
      buckets.set(label, (buckets.get(label) || 0) + 1)
    }

    const byStudyYear: AtRiskStudyYearBucket[] = [...buckets.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      totalAtRisk: atRiskUserIds.length,
      byStudyYear,
    } satisfies AtRiskResponse)
  } catch (error) {
    safeLogger.error('[Admin At-Risk Analytics]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
