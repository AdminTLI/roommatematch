import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { getUniversityAffiliateUserIds, resolveAdminAnalyticsScope } from '@/lib/admin/analytics-scope'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/** Supports both legacy enum values and moderation workflow strings */
const RESOLVED_STATUSES = ['resolved', 'reviewed', 'closed', 'actioned', 'dismissed']

export type MediationCategoryCount = { category: string; count: number }

export type MediationIndexResponse = {
  totalReports: number
  pendingReports: number
  resolvedSampleCount: number
  averageResolutionHours: number | null
  byCategory: MediationCategoryCount[]
  /** Transparent estimate — not sourced from payroll systems */
  estimatedAdminHoursSaved: number
  estimateAssumptions: string
}

function displayCategory(raw: string | null | undefined): string {
  if (!raw) return 'Other'
  const map: Record<string, string> = {
    spam: 'Spam / noise',
    harassment: 'Harassment',
    inappropriate: 'Inappropriate behaviour',
    swearing: 'Noise / conduct',
    account_misuse: 'Account misuse',
    impersonation: 'Boundaries / impersonation',
    threats: 'Safety / threats',
    scam_or_fraud: 'Scam or fraud',
    hate_or_discrimination: 'Hate or discrimination',
    other: 'Other',
  }
  return map[raw] || raw.replace(/_/g, ' ')
}

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
      const empty: MediationIndexResponse = {
        totalReports: 0,
        pendingReports: 0,
        resolvedSampleCount: 0,
        averageResolutionHours: null,
        byCategory: [],
        estimatedAdminHoursSaved: 0,
        estimateAssumptions: 'Each resolved level-1 report assumed 2.5 staff hours if handled entirely without Domu Match workflows.',
      }
      return NextResponse.json(empty)
    }

    const ids = Array.from(affiliate)
    const reportIds = new Set<string>()
    for (const part of chunk(ids, 100)) {
      const { data: r1 } = await admin.from('reports').select('id').in('reporter_id', part)
      const { data: r2 } = await admin.from('reports').select('id').in('target_user_id', part)
      for (const r of [...(r1 || []), ...(r2 || [])]) {
        if (r.id) reportIds.add(r.id)
      }
    }

    if (reportIds.size === 0) {
      const empty: MediationIndexResponse = {
        totalReports: 0,
        pendingReports: 0,
        resolvedSampleCount: 0,
        averageResolutionHours: null,
        byCategory: [],
        estimatedAdminHoursSaved: 0,
        estimateAssumptions: 'Each resolved level-1 report assumed 2.5 staff hours if handled entirely without Domu Match workflows.',
      }
      return NextResponse.json(empty)
    }

    const rows: Array<{
      id: string
      status: string
      category: string | null
      created_at: string
      updated_at: string | null
    }> = []

    for (const part of chunk([...reportIds], 150)) {
      const { data } = await admin
        .from('reports')
        .select('id, status, category, created_at, updated_at')
        .in('id', part)
      for (const r of data || []) {
        rows.push(r as (typeof rows)[0])
      }
    }

    const totalReports = rows.length
    const pendingReports = rows.filter((r) => r.status === 'open' || r.status === 'pending').length

    const resolved = rows.filter((r) => RESOLVED_STATUSES.includes(r.status))
    let totalHours = 0
    let n = 0
    for (const r of resolved) {
      if (!r.created_at || !r.updated_at) continue
      const ms = new Date(r.updated_at).getTime() - new Date(r.created_at).getTime()
      if (ms < 0) continue
      totalHours += ms / (1000 * 60 * 60)
      n++
    }

    const catMap = new Map<string, number>()
    for (const r of rows) {
      const key = displayCategory(r.category)
      catMap.set(key, (catMap.get(key) || 0) + 1)
    }

    const byCategory: MediationCategoryCount[] = [...catMap.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    const resolvedLevel1Estimate = resolved.length
    const HOURS_PER = 2.5
    const estimatedAdminHoursSaved = resolvedLevel1Estimate * HOURS_PER

    const response: MediationIndexResponse = {
      totalReports,
      pendingReports,
      resolvedSampleCount: resolved.length,
      averageResolutionHours: n > 0 ? Number((totalHours / n).toFixed(2)) : null,
      byCategory,
      estimatedAdminHoursSaved: Number(estimatedAdminHoursSaved.toFixed(1)),
      estimateAssumptions: `Estimated as resolved reports (${resolvedLevel1Estimate}) × ${HOURS_PER} hours. This is a planning estimate, not measured staff time.`,
    }

    return NextResponse.json(response)
  } catch (error) {
    safeLogger.error('[Admin Mediation Index]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
