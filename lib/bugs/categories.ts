export const BUG_REPORT_CATEGORY_VALUES = [
  'ui_display',
  'loading',
  'matching',
  'chat',
  'account',
  'performance',
  'other',
] as const

export type BugReportCategory = (typeof BUG_REPORT_CATEGORY_VALUES)[number]

export const BUG_REPORT_CATEGORIES: { value: BugReportCategory; label: string }[] = [
  { value: 'ui_display', label: 'UI / display issue' },
  { value: 'loading', label: 'Something not loading / blank page' },
  { value: 'matching', label: 'Matching problem' },
  { value: 'chat', label: 'Chat / messaging' },
  { value: 'account', label: 'Account / login' },
  { value: 'performance', label: 'Performance / slow' },
  { value: 'other', label: 'Other' },
]

export const BUG_REPORT_CATEGORY_LABELS: Record<BugReportCategory, string> = Object.fromEntries(
  BUG_REPORT_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<BugReportCategory, string>

export const BUG_REPORT_STATUS_VALUES = ['open', 'triaged', 'resolved', 'dismissed'] as const
export type BugReportStatus = (typeof BUG_REPORT_STATUS_VALUES)[number]

export function isValidBugReportCategory(v: string): v is BugReportCategory {
  return (BUG_REPORT_CATEGORY_VALUES as readonly string[]).includes(v)
}

export function isValidBugReportStatus(v: string): v is BugReportStatus {
  return (BUG_REPORT_STATUS_VALUES as readonly string[]).includes(v)
}
