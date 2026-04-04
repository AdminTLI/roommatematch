/** Values must match `report_category` enum in the database (see migration). */
export const CHAT_REPORT_CATEGORY_VALUES = [
  'harassment',
  'swearing',
  'account_misuse',
  'impersonation',
  'spam',
  'inappropriate',
  'threats',
  'scam_or_fraud',
  'hate_or_discrimination',
  'other',
] as const

export type ChatReportCategory = (typeof CHAT_REPORT_CATEGORY_VALUES)[number]

export const CHAT_REPORT_CATEGORIES: { value: ChatReportCategory; label: string; description?: string }[] = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'swearing', label: 'Swearing or abusive language' },
  { value: 'account_misuse', label: "Using someone else's account" },
  { value: 'impersonation', label: 'Fake profile / impersonation' },
  { value: 'threats', label: 'Threats or intimidation' },
  { value: 'scam_or_fraud', label: 'Scam, fraud, or phishing' },
  { value: 'hate_or_discrimination', label: 'Hate or discrimination' },
  { value: 'spam', label: 'Spam or unwanted contact' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
]

export const CHAT_REPORT_CATEGORY_LABELS: Record<ChatReportCategory, string> = Object.fromEntries(
  CHAT_REPORT_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<ChatReportCategory, string>

export function isValidChatReportCategory(v: string): v is ChatReportCategory {
  return (CHAT_REPORT_CATEGORY_VALUES as readonly string[]).includes(v)
}
