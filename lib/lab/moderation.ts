import { moderateByType } from '@/lib/moderation/text'
import { LAB_BODY_MAX, LAB_TITLE_MAX } from './constants'

export type LabModerationResult =
  | { ok: true; title: string; body: string }
  | { ok: false; error: string }

export function moderateLabWish(
  title: string,
  body: string
): LabModerationResult {
  const trimmedTitle = title.trim()
  const trimmedBody = body.trim()

  if (trimmedTitle.length < 3) {
    return { ok: false, error: 'Headline must be at least 3 characters' }
  }
  if (trimmedTitle.length > LAB_TITLE_MAX) {
    return {
      ok: false,
      error: `Headline must be at most ${LAB_TITLE_MAX} characters`,
    }
  }
  if (trimmedBody.length < 10) {
    return { ok: false, error: 'Description must be at least 10 characters' }
  }
  if (trimmedBody.length > LAB_BODY_MAX) {
    return {
      ok: false,
      error: `Description must be at most ${LAB_BODY_MAX} characters`,
    }
  }

  const titleMod = moderateByType(trimmedTitle, 'lab_wish')
  if (!titleMod.isAllowed) {
    return { ok: false, error: titleMod.reason || 'Headline is not allowed' }
  }

  const bodyMod = moderateByType(trimmedBody, 'lab_wish')
  if (!bodyMod.isAllowed) {
    return { ok: false, error: bodyMod.reason || 'Description is not allowed' }
  }

  return {
    ok: true,
    title: titleMod.sanitizedContent ?? trimmedTitle,
    body: bodyMod.sanitizedContent ?? trimmedBody,
  }
}
