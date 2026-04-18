import type { MetricsCohort, MetricsHousing, MetricsOrigin } from '@/lib/admin/metrics-filters'

/** Dashboard filter state for admin analytics APIs (client + server safe). */
export type AdminAnalyticsFilters = {
  cohort: MetricsCohort
  origin: MetricsOrigin
  housing: MetricsHousing
}

export function buildAdminAnalyticsQuery(
  universityId: string,
  filters: AdminAnalyticsFilters,
  isSuper: boolean
): string {
  const p = new URLSearchParams()
  if (isSuper) {
    p.set('requested_university_id', universityId)
  }
  if (filters.cohort !== 'all') p.set('cohort', filters.cohort)
  if (filters.origin !== 'all') p.set('origin', filters.origin)
  if (filters.housing !== 'all') p.set('housing', filters.housing)
  const s = p.toString()
  return s ? `?${s}` : ''
}
