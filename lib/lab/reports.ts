import {
  LAB_REPORT_CATEGORY_LABELS,
  type LabReportCategory,
} from '@/lib/lab/constants'

export function formatLabReportReason(
  category: LabReportCategory,
  details?: string
): string {
  const label = LAB_REPORT_CATEGORY_LABELS[category]
  const trimmed = details?.trim()
  if (trimmed) {
    return `${label}\n\n${trimmed}`
  }
  return label
}
