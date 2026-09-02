export const LAB_TITLE_MAX = 80
export const LAB_BODY_MAX = 600
export const LAB_TITLE_MIN = 3
export const LAB_BODY_MIN = 10

export const LAB_WISH_STATUSES = [
  'open',
  'looking',
  'shipped',
  'wont_do',
] as const

export const LAB_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  looking: 'Looking into it',
  shipped: 'Shipped',
  wont_do: "Won't do",
}

export const LAB_REPORT_CATEGORIES = [
  'spam',
  'harassment',
  'personal_info',
  'off_topic',
  'duplicate',
  'inappropriate',
  'other',
] as const

export type LabReportCategory = (typeof LAB_REPORT_CATEGORIES)[number]

export const LAB_REPORT_CATEGORY_LABELS: Record<LabReportCategory, string> = {
  spam: 'Spam or misleading',
  harassment: 'Harassment or hate',
  personal_info: "Shares someone's personal information",
  off_topic: 'Off-topic (not about Domu Match)',
  duplicate: 'Duplicate of another wish',
  inappropriate: 'Inappropriate or offensive content',
  other: 'Something else',
}

export const LAB_PROMPT_COPY: Record<
  string,
  { title: string; description: string; cta: string }
> = {
  onboarding_complete: {
    title: 'You’re done with the questionnaire',
    description:
      'Anything confusing, slow, or a waste of time? Your take helps us improve Domu for students.',
    cta: 'Share your thoughts',
  },
  first_match: {
    title: 'You got a new match',
    description:
      'What did you still have to figure out in chat that Domu should have shown you upfront?',
    cta: 'Tell us what’s missing',
  },
  empty_matches: {
    title: 'Still no matches?',
    description: 'What would make it easier to find the right roommate?',
    cta: 'Suggest an idea',
  },
}
