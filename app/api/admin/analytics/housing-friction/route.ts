import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import {
  getFilteredCohortUserIds,
  isDomesticNationality,
  resolveAdminAnalyticsScope,
} from '@/lib/admin/analytics-scope'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export type HousingFrictionResponse = {
  sufficientSample: boolean
  message?: string
  domestic: { sampleSize: number; averageDaysToFirstConfirmedMatch: number | null }
  international: { sampleSize: number; averageDaysToFirstConfirmedMatch: number | null }
}

const MIN_SAMPLE = 10

export async function GET(request: NextRequest) {
  try {
    const scope = await resolveAdminAnalyticsScope(request)
    if (!scope.ok) {
      return NextResponse.json({ error: scope.error }, { status: scope.status })
    }

    const { universityId, filters } = scope
    const admin = createAdminClient()

    const baseFilters = { ...filters, housing: 'all' as const }
    const verifiedIds = await getFilteredCohortUserIds(admin, universityId, baseFilters)
    if (verifiedIds.size === 0) {
      const body: HousingFrictionResponse = {
        sufficientSample: false,
        message: 'Insufficient Data for Safe Comparison',
        domestic: { sampleSize: 0, averageDaysToFirstConfirmedMatch: null },
        international: { sampleSize: 0, averageDaysToFirstConfirmedMatch: null },
      }
      return NextResponse.json(body)
    }

    const domesticUsers: string[] = []
    const internationalUsers: string[] = []

    for (const part of chunk([...verifiedIds], 300)) {
      const { data: profs } = await admin.from('profiles').select('user_id, nationality').in('user_id', part)
      for (const p of profs || []) {
        if (!p.user_id) continue
        const dom = isDomesticNationality((p as { nationality?: string }).nationality)
        if (dom === true) domesticUsers.push(p.user_id)
        else if (dom === false) internationalUsers.push(p.user_id)
      }
    }

    async function avgDaysFor(userIds: string[]): Promise<{ cohortSize: number; withMatch: number; avg: number | null }> {
      if (userIds.length === 0) return { cohortSize: 0, withMatch: 0, avg: null }
      let sum = 0
      let c = 0
      for (const part of chunk(userIds, 80)) {
        const { data: profiles } = await admin
          .from('profiles')
          .select('user_id, created_at')
          .in('user_id', part)

        for (const pr of profiles || []) {
          if (!pr.user_id || !pr.created_at) continue
          const uid = pr.user_id
          const { data: mA } = await admin
            .from('matches')
            .select('created_at')
            .eq('status', 'confirmed')
            .eq('a_user', uid)
            .order('created_at', { ascending: true })
            .limit(1)
          const { data: mB } = await admin
            .from('matches')
            .select('created_at')
            .eq('status', 'confirmed')
            .eq('b_user', uid)
            .order('created_at', { ascending: true })
            .limit(1)

          const t0 = new Date(pr.created_at).getTime()
          const t1a = mA?.[0]?.created_at ? new Date(mA[0].created_at as string).getTime() : null
          const t1b = mB?.[0]?.created_at ? new Date(mB[0].created_at as string).getTime() : null
          const t1 = t1a != null && t1b != null ? Math.min(t1a, t1b) : t1a ?? t1b
          if (t1 == null || t1 < t0) continue
          sum += (t1 - t0) / (1000 * 60 * 60 * 24)
          c++
        }
      }
      return {
        cohortSize: userIds.length,
        withMatch: c,
        avg: c > 0 ? Number((sum / c).toFixed(2)) : null,
      }
    }

    const d = await avgDaysFor(domesticUsers)
    const i = await avgDaysFor(internationalUsers)
    const sufficient = d.withMatch >= MIN_SAMPLE && i.withMatch >= MIN_SAMPLE

    const body: HousingFrictionResponse = {
      sufficientSample: sufficient,
      message: sufficient ? undefined : 'Insufficient Data for Safe Comparison',
      domestic: { sampleSize: d.withMatch, averageDaysToFirstConfirmedMatch: d.avg },
      international: { sampleSize: i.withMatch, averageDaysToFirstConfirmedMatch: i.avg },
    }

    return NextResponse.json(body)
  } catch (error) {
    safeLogger.error('[Admin Housing Friction]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
