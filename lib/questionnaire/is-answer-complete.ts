import type { Answer, AnswerValue } from '@/store/onboarding'

export function typedAnswer<K extends AnswerValue['kind']>(
  sectionAnswer: Answer | undefined,
  kind: K
): Extract<AnswerValue, { kind: K }> | undefined {
  const v = sectionAnswer?.value
  if (!v || v.kind !== kind) return undefined
  return v as Extract<AnswerValue, { kind: K }>
}

export function isAnswerValueComplete(val: AnswerValue | undefined): boolean {
  if (!val) return false
  switch (val.kind) {
    case 'date':
      return typeof val.value === 'string' && val.value.length > 0
    case 'number':
      return typeof val.value === 'number' && !Number.isNaN(val.value)
    case 'timeRange':
      return !!(val.start && val.end)
    case 'stringArray':
      return Array.isArray(val.value) && val.value.length > 0
    default:
      return val.value !== undefined && val.value !== null
  }
}
