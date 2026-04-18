/**
 * Shared filter enums and housing bucket keys for university admin analytics.
 * Housing keys follow product constants (lib/constants/housing-status); legacy aliases included for older rows.
 */

export const METRICS_COHORT_VALUES = [
  'all',
  'masters',
  'bachelor_1',
  'bachelor_2',
  'bachelor_3',
] as const
export type MetricsCohort = (typeof METRICS_COHORT_VALUES)[number]

export const METRICS_ORIGIN_VALUES = ['all', 'domestic', 'international'] as const
export type MetricsOrigin = (typeof METRICS_ORIGIN_VALUES)[number]

export const METRICS_HOUSING_VALUES = ['all', 'looking', 'matched'] as const
export type MetricsHousing = (typeof METRICS_HOUSING_VALUES)[number]

/** Actively searching / not yet settled — product keys + aliases from roadmap wording */
export const HOUSING_LOOKING_KEYS = new Set<string>([
  'seeking_room',
  'offering_room',
  'team_up',
  'exploring',
  'looking_for_room',
  'looking_for_roommate',
])

/** Settled cohort — when present on profile housing_status arrays */
export const HOUSING_SETTLED_KEYS = new Set<string>(['housed', 'matched'])

export function parseMetricsCohort(raw: string | null): MetricsCohort {
  if (!raw) return 'all'
  return (METRICS_COHORT_VALUES as readonly string[]).includes(raw) ? (raw as MetricsCohort) : 'all'
}

export function parseMetricsOrigin(raw: string | null): MetricsOrigin {
  if (!raw) return 'all'
  return (METRICS_ORIGIN_VALUES as readonly string[]).includes(raw) ? (raw as MetricsOrigin) : 'all'
}

export function parseMetricsHousing(raw: string | null): MetricsHousing {
  if (!raw) return 'all'
  return (METRICS_HOUSING_VALUES as readonly string[]).includes(raw) ? (raw as MetricsHousing) : 'all'
}
