import { V2_SECTION_KEYS, type V2SectionKey } from '@/types/questionnaire'

export type OnboardingSectionRow = {
  section: string
  answers?: unknown
}

/** Extract v2 item answers (M1_Q1 … M5_Q12) from onboarding_sections rows. */
export function extractV2ItemAnswers(sections: OnboardingSectionRow[]): Record<string, unknown> {
  const answers: Record<string, unknown> = {}

  for (const section of sections) {
    if (!Array.isArray(section.answers)) continue
    for (const raw of section.answers) {
      if (!raw || typeof raw !== 'object') continue
      const itemId = (raw as { itemId?: string }).itemId
      if (!itemId || !/^M[1-5]_Q\d+$/.test(itemId)) continue

      let value = (raw as { value?: unknown }).value
      if (value && typeof value === 'object' && value !== null && 'value' in value) {
        value = (value as { value: unknown }).value
      }
      if (value === undefined || value === null || value === '') continue
      answers[itemId] = value
    }
  }

  return answers
}

/** True when all five v2 modules have at least one saved answer (matches SQL cron gate). */
export function hasAllV2Sections(sections: OnboardingSectionRow[]): boolean {
  const answered = new Set<V2SectionKey>()
  for (const row of sections) {
    if (!V2_SECTION_KEYS.includes(row.section as V2SectionKey)) continue
    if (Array.isArray(row.answers) && row.answers.length > 0) {
      answered.add(row.section as V2SectionKey)
    }
  }
  return V2_SECTION_KEYS.every((key) => answered.has(key))
}

export function isV2QuestionnaireComplete(sections: OnboardingSectionRow[]): boolean {
  return hasAllV2Sections(sections)
}
