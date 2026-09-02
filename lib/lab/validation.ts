import {
  LAB_WISH_STATUSES,
  LAB_VOTE_INTENSITIES,
  LAB_PROMPT_KEYS,
} from './types'
import { LAB_REPORT_CATEGORIES } from './constants'

export function isValidLabWishStatus(v: string): boolean {
  return (LAB_WISH_STATUSES as readonly string[]).includes(v)
}

export function isValidLabVoteIntensity(v: string): boolean {
  return (LAB_VOTE_INTENSITIES as readonly string[]).includes(v)
}

export function isValidLabPromptKey(v: string): boolean {
  return (LAB_PROMPT_KEYS as readonly string[]).includes(v)
}

export function isValidLabReportCategory(v: string): boolean {
  return (LAB_REPORT_CATEGORIES as readonly string[]).includes(v)
}
