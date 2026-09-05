export type MetricsTabId =
  | 'metrics'
  | 'executive'
  | 'engagement'
  | 'marketplace'
  | 'retention'
  | 'footprint'
  | 'questionnaire'

const VALID_TABS: MetricsTabId[] = [
  'metrics',
  'executive',
  'engagement',
  'marketplace',
  'retention',
  'footprint',
  'questionnaire',
]

export function parseMetricsTab(raw: string | null): MetricsTabId {
  if (raw && VALID_TABS.includes(raw as MetricsTabId)) {
    return raw as MetricsTabId
  }
  return 'metrics'
}

/** API suffixes to fetch for each tab (lazy loading). */
export function getAnalyticsEndpointsForTab(tab: MetricsTabId): string[] {
  switch (tab) {
    case 'metrics':
      return ['']
    case 'executive':
      return ['/executive-summary', '/at-risk', '/mediation-index', '/housing-friction', '/wellness']
    case 'engagement':
      return [
        '/realtime',
        '/traffic-sources',
        '/user-flows',
        '/geographic',
        '/user-lifecycle',
        '/security',
      ]
    case 'marketplace':
      return ['/conversion-funnel']
    case 'retention':
      return ['/cohort-retention', '/coverage']
    case 'footprint':
      return ['']
    case 'questionnaire':
      return []
    default:
      return ['']
  }
}

export function tabNeedsBaseMetrics(tab: MetricsTabId): boolean {
  return tab === 'metrics' || tab === 'footprint'
}

export function tabIsQuestionnaire(tab: MetricsTabId): boolean {
  return tab === 'questionnaire'
}
