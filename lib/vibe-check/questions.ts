/**
 * Vibe Check 8-question bank.
 * Copy/options are marketing 1–5 scales; weights come from item-weights.v2.ts
 * (renormalized within each module for the 8-item subset).
 */

export type VibeModule = 'environment' | 'cleanliness' | 'communication' | 'social'

export interface VibeQuestion {
  id: string
  module: VibeModule
  /** Share within module (sums to 1.0 per module). */
  inModuleWeight: number
  /** Contribution to overall harmony (sums to 1.0 across all 8). */
  overallWeight: number
  question: string
  options: { label: string; value: number }[]
}

/** Module weights aligned with MODULE_WEIGHTS in item-weights.v2.ts */
export const VIBE_MODULE_WEIGHTS: Record<VibeModule, number> = {
  environment: 0.24,
  cleanliness: 0.28,
  communication: 0.24,
  social: 0.24,
}

export const VIBE_MODULE_LABELS: Record<
  VibeModule,
  { title: string; subtitle: string }
> = {
  environment: {
    title: 'Environment & Rhythms',
    subtitle: 'Sleep and quiet hours',
  },
  cleanliness: {
    title: 'Cleanliness & Operations',
    subtitle: 'Standards and dishes',
  },
  communication: {
    title: 'Communication & Resolution',
    subtitle: 'Style and issue handling',
  },
  social: {
    title: 'Social Life & Spaces',
    subtitle: 'Guests and overnight boundaries',
  },
}

export const VIBE_CHECK_QUESTIONS: VibeQuestion[] = [
  {
    id: 'M2_Q1',
    module: 'environment',
    inModuleWeight: 0.5,
    overallWeight: 0.12,
    question: 'Are you more of a night owl or a morning person?',
    options: [
      { label: 'Early bird (usually up before 07:00)', value: 1 },
      { label: 'Morning person (around 07:00 - 08:30)', value: 2 },
      { label: 'Flexible / depends on the day', value: 3 },
      { label: 'Evening person (often up past midnight)', value: 4 },
      { label: 'Night owl (usually active until 01:00 - 02:00)', value: 5 },
    ],
  },
  {
    id: 'M2_Q13',
    module: 'environment',
    inModuleWeight: 0.5,
    overallWeight: 0.12,
    question: 'My preferred weekday quiet hours are:',
    options: [
      { label: 'Quiet after 21:00', value: 1 },
      { label: 'Quiet after 22:00', value: 2 },
      { label: 'Quiet after 23:00', value: 3 },
      { label: 'Flexible depending on study or exams', value: 4 },
      { label: 'No set quiet hours', value: 5 },
    ],
  },
  {
    id: 'M4_Q1',
    module: 'cleanliness',
    inModuleWeight: 0.5625,
    overallWeight: 0.1575,
    question: 'My cleanliness standard for shared areas is:',
    options: [
      { label: 'Always tidy and guest-ready', value: 5 },
      { label: 'Clean regularly; small clutter is fine', value: 4 },
      { label: 'Lived-in but generally under control', value: 3 },
      { label: 'Relaxed - usually a weekly tidy-up', value: 2 },
      { label: 'I clean when it starts to bother me', value: 1 },
    ],
  },
  {
    id: 'M4_Q4',
    module: 'cleanliness',
    inModuleWeight: 0.4375,
    overallWeight: 0.1225,
    question: 'How soon do you typically wash your dishes after cooking?',
    options: [
      { label: 'Right after eating or cooking', value: 5 },
      { label: 'Within a few hours / before bed', value: 4 },
      { label: 'Sometime the same day', value: 3 },
      { label: 'When the sink starts to fill up', value: 2 },
      { label: 'Often the next day', value: 1 },
    ],
  },
  {
    id: 'M6_Q9',
    module: 'communication',
    inModuleWeight: 0.5714,
    overallWeight: 0.1371,
    question: 'When something bothers me at home, I usually:',
    options: [
      { label: 'Bring it up clearly and soon', value: 5 },
      { label: 'Talk it through calmly and kindly', value: 4 },
      { label: 'Wait for a good moment, then mention it carefully', value: 3 },
      { label: 'Hint at it and hope they notice', value: 2 },
      { label: 'Keep it to myself unless it becomes serious', value: 1 },
    ],
  },
  {
    id: 'M6_Q1',
    module: 'communication',
    inModuleWeight: 0.4286,
    overallWeight: 0.1029,
    question: 'If a house rule is broken or an issue comes up, I prefer to handle it:',
    options: [
      { label: 'Face-to-face immediately', value: 5 },
      { label: 'During a scheduled weekly house dinner/meeting', value: 4 },
      { label: 'Via the house WhatsApp chat', value: 3 },
      { label: 'Text them privately', value: 2 },
      { label: 'Let it slide unless it becomes a major problem', value: 1 },
    ],
  },
  {
    id: 'M5_Q1',
    module: 'social',
    inModuleWeight: 0.5,
    overallWeight: 0.12,
    question: 'How often do you expect to have guests or friends over at home?',
    options: [
      { label: 'Rarely / Home is my private quiet space', value: 1 },
      { label: '1-2 times per week max', value: 2 },
      { label: '3-4 times per week', value: 3 },
      { label: 'Very frequently / Open door policy', value: 4 },
      { label: 'Daily pre-games and gatherings', value: 5 },
    ],
  },
  {
    id: 'M5_Q5',
    module: 'social',
    inModuleWeight: 0.5,
    overallWeight: 0.12,
    question: 'Overnight guests (friends, family, or partners) are okay with me:',
    options: [
      { label: 'Only with multi-day prior notice & agreement', value: 1 },
      { label: 'Occasional weekends with advance notice', value: 2 },
      { label: 'Fine anytime as long as communicated', value: 3 },
      { label: 'Partners welcome multiple nights a week', value: 4 },
      { label: 'Completely open / No notice needed', value: 5 },
    ],
  },
]
