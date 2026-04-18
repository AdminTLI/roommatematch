import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import type { AdminAnalyticsFilters } from '@/lib/admin/analytics-query'
import {
  HOUSING_LOOKING_KEYS,
  HOUSING_SETTLED_KEYS,
  parseMetricsCohort,
  parseMetricsHousing,
  parseMetricsOrigin,
} from '@/lib/admin/metrics-filters'

export type { AdminAnalyticsFilters } from '@/lib/admin/analytics-query'

export type ResolvedAnalyticsScope =
  | { ok: true; universityId: string; filters: AdminAnalyticsFilters; isPlatformSuper: boolean }
  | { ok: false; status: number; error: string }

/** Opens service-role client and resolves the verified + filter-scoped user id set for analytics routes. */
export type ScopedAnalyticsSession =
  | {
      ok: true
      universityId: string
      filters: AdminAnalyticsFilters
      isPlatformSuper: boolean
      admin: SupabaseClient
      scopedUserIds: Set<string>
    }
  | { ok: false; status: number; error: string }

export async function openScopedAnalyticsSession(request: NextRequest): Promise<ScopedAnalyticsSession> {
  const scope = await resolveAdminAnalyticsScope(request)
  if (!scope.ok) {
    return { ok: false, status: scope.status, error: scope.error }
  }
  const admin = createAdminClient()
  const scopedUserIds = await resolveScopedMetricsUserIds(admin, scope.universityId, scope.filters)
  return {
    ok: true,
    universityId: scope.universityId,
    filters: scope.filters,
    isPlatformSuper: scope.isPlatformSuper,
    admin,
    scopedUserIds,
  }
}

const NL_DOMESTIC = new Set(['nl', 'nld', '528', 'netherlands', 'the netherlands', 'holland', 'dutch'])

function normalizeNationalityToken(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== 'string') return null
  const t = raw.trim().toLowerCase()
  return t.length ? t : null
}

export function isDomesticNationality(nationality: string | null | undefined): boolean | null {
  const t = normalizeNationalityToken(nationality)
  if (!t) return null
  if (NL_DOMESTIC.has(t)) return true
  if (t.length === 2 && t === 'nl') return true
  return false
}

function parseFiltersFromRequest(request: NextRequest): AdminAnalyticsFilters {
  const sp = request.nextUrl.searchParams
  return {
    cohort: parseMetricsCohort(sp.get('cohort')),
    origin: parseMetricsOrigin(sp.get('origin')),
    housing: parseMetricsHousing(sp.get('housing')),
  }
}

/** Verify university exists (blocks arbitrary UUIDs for super admin). */
export async function assertUniversityExists(
  admin: SupabaseClient,
  universityId: string
): Promise<boolean> {
  const { data, error } = await admin.from('universities').select('id').eq('id', universityId).maybeSingle()
  return !error && !!data?.id
}

/**
 * Resolves the tenant university for admin analytics.
 * - Super admins must pass requested_university_id (never default global).
 * - Scoped admins may omit it (defaults to admins.university_id); if provided it must match.
 */
export async function resolveAdminAnalyticsScope(request: NextRequest): Promise<ResolvedAnalyticsScope> {
  const adminCheck = await requireAdmin(request, false)
  if (!adminCheck.ok || !adminCheck.user) {
    return { ok: false, status: adminCheck.status, error: adminCheck.error || 'Admin access required' }
  }

  const adminsRole = adminCheck.adminRecord?.admins_table_role ?? null
  const adminsUniversityId = adminCheck.adminRecord?.university_id ?? null

  const platformSuperFromRoleTable = adminsRole === 'super_admin'
  const platformSuperFromUserRoles = adminCheck.adminRecord?.role === 'super_admin'
  const isPlatformSuper = platformSuperFromRoleTable || platformSuperFromUserRoles

  const requested = request.nextUrl.searchParams.get('requested_university_id')

  if (isPlatformSuper) {
    if (!requested || !requested.trim()) {
      return { ok: false, status: 400, error: 'Select a university to view analytics.' }
    }
    const uid = requested.trim()
    const db = createAdminClient()
    const exists = await assertUniversityExists(db, uid)
    if (!exists) {
      return { ok: false, status: 400, error: 'Unknown university.' }
    }
    return {
      ok: true,
      universityId: uid,
      filters: parseFiltersFromRequest(request),
      isPlatformSuper: true,
    }
  }

  if (!adminsUniversityId) {
    return { ok: false, status: 403, error: 'Admin tenant is not assigned to a university.' }
  }

  if (requested && requested !== adminsUniversityId) {
    return { ok: false, status: 403, error: 'Cannot access another university.' }
  }

  return {
    ok: true,
    universityId: adminsUniversityId,
    filters: parseFiltersFromRequest(request),
    isPlatformSuper: false,
  }
}

function profileHousingMatchesLooking(housing: unknown): boolean {
  if (!housing || !Array.isArray(housing)) return false
  return (housing as string[]).some((k) => HOUSING_LOOKING_KEYS.has(k))
}

function profileHousingMatchesSettled(housing: unknown): boolean {
  if (!housing || !Array.isArray(housing)) return false
  return (housing as string[]).some((k) => HOUSING_SETTLED_KEYS.has(k))
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export async function getUniversityAffiliateUserIds(
  admin: SupabaseClient,
  universityId: string
): Promise<Set<string>> {
  const { data } = await admin.from('user_academic').select('user_id').eq('university_id', universityId)
  return new Set((data || []).map((r) => r.user_id).filter(Boolean) as string[])
}

/**
 * User IDs used for aggregate admin metrics under the active filters.
 * When all filters are "all", includes every user linked to the university via `user_academic`.
 * Otherwise applies the institutional cohort rules (academic-verified + slice filters).
 */
export async function resolveScopedMetricsUserIds(
  admin: SupabaseClient,
  universityId: string,
  filters: AdminAnalyticsFilters
): Promise<Set<string>> {
  const loose = filters.cohort === 'all' && filters.origin === 'all' && filters.housing === 'all'
  if (loose) {
    return getUniversityAffiliateUserIds(admin, universityId)
  }
  return getFilteredCohortUserIds(admin, universityId, filters)
}

/**
 * Academic-verified cohort at a university, intersected with dashboard filters.
 * Uses profiles.is_verified_student as the academic verification gate.
 */
export async function getFilteredCohortUserIds(
  admin: SupabaseClient,
  universityId: string,
  filters: AdminAnalyticsFilters
): Promise<Set<string>> {
  const { data: academicRows, error: uaError } = await admin
    .from('user_academic')
    .select('user_id, degree_level')
    .eq('university_id', universityId)

  if (uaError || !academicRows?.length) {
    return new Set()
  }

  const uaByUser = new Map<string, { degree_level: string }>()
  for (const row of academicRows) {
    if (row.user_id) uaByUser.set(row.user_id, { degree_level: String(row.degree_level || '') })
  }

  const candidateIds = [...uaByUser.keys()]
  const verified = new Set<string>()

  for (const part of chunk(candidateIds, 400)) {
    const { data: profs } = await admin
      .from('profiles')
      .select('user_id, is_verified_student, housing_status, nationality')
      .in('user_id', part)

    for (const p of profs || []) {
      if (p.user_id && p.is_verified_student === true) {
        verified.add(p.user_id)
      }
    }
  }

  let ids = verified
  if (ids.size === 0) return ids

  // Cohort: masters / bachelor year
  if (filters.cohort === 'masters') {
    const next = new Set<string>()
    for (const uid of ids) {
      const dl = uaByUser.get(uid)?.degree_level
      if (dl === 'master' || dl === 'premaster') next.add(uid)
    }
    ids = next
  } else if (filters.cohort === 'bachelor_1' || filters.cohort === 'bachelor_2' || filters.cohort === 'bachelor_3') {
    const year =
      filters.cohort === 'bachelor_1' ? 1 : filters.cohort === 'bachelor_2' ? 2 : 3
    const bachelorIds = new Set<string>()
    for (const uid of ids) {
      if (uaByUser.get(uid)?.degree_level === 'bachelor') bachelorIds.add(uid)
    }
    const withYear = new Set<string>()
    for (const part of chunk([...bachelorIds], 400)) {
      const { data: sy } = await admin.from('user_study_year_v').select('user_id, study_year').in('user_id', part)
      for (const row of sy || []) {
        if (row.user_id && Number(row.study_year) === year) withYear.add(row.user_id)
      }
    }
    ids = new Set([...ids].filter((u) => withYear.has(u)))
  }

  // Origin
  if (filters.origin !== 'all') {
    const profilesByUser = new Map<string, { nationality: string | null }>()
    for (const part of chunk([...ids], 400)) {
      const { data: profs } = await admin
        .from('profiles')
        .select('user_id, nationality')
        .in('user_id', part)
      for (const p of profs || []) {
        if (p.user_id) profilesByUser.set(p.user_id, { nationality: (p as { nationality?: string }).nationality ?? null })
      }
    }
    const next = new Set<string>()
    for (const uid of ids) {
      const dom = isDomesticNationality(profilesByUser.get(uid)?.nationality ?? null)
      if (filters.origin === 'domestic' && dom === true) next.add(uid)
      if (filters.origin === 'international' && dom === false) next.add(uid)
    }
    ids = next
  }

  // Housing status on profile arrays + matched branch uses confirmed match existence
  if (filters.housing !== 'all') {
    const housingMap = new Map<string, unknown>()
    for (const part of chunk([...ids], 400)) {
      const { data: profs } = await admin.from('profiles').select('user_id, housing_status').in('user_id', part)
      for (const p of profs || []) {
        if (p.user_id) housingMap.set(p.user_id, p.housing_status)
      }
    }

    const confirmedUsers = new Set<string>()
    for (const part of chunk([...ids], 120)) {
      const { data: asA } = await admin
        .from('matches')
        .select('a_user, b_user')
        .eq('status', 'confirmed')
        .in('a_user', part)
      const { data: asB } = await admin
        .from('matches')
        .select('a_user, b_user')
        .eq('status', 'confirmed')
        .in('b_user', part)
      for (const m of [...(asA || []), ...(asB || [])]) {
        const a = (m as { a_user?: string }).a_user
        const b = (m as { b_user?: string }).b_user
        if (a && ids.has(a)) confirmedUsers.add(a)
        if (b && ids.has(b)) confirmedUsers.add(b)
      }
    }

    const next = new Set<string>()
    for (const uid of ids) {
      const hs = housingMap.get(uid)
      const looking = profileHousingMatchesLooking(hs)
      const settledKeys = profileHousingMatchesSettled(hs)
      const hasConfirmed = confirmedUsers.has(uid)

      if (filters.housing === 'looking') {
        if (looking && !hasConfirmed) next.add(uid)
      } else if (filters.housing === 'matched') {
        if (settledKeys || hasConfirmed) next.add(uid)
      }
    }
    ids = next
  }

  return ids
}
