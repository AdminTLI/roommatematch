/**
 * Detect anonymized / deleted accounts (inactivity erasure or retention anonymization).
 * These profiles keep a row but use placeholder names like "Deleted User".
 */

export const DELETED_PROFILE_DISPLAY_NAME = 'Deleted Profile'

const DELETED_LAST_NAMES = new Set(['', 'user', 'profile'])

export function isAnonymizedDeletedProfile(profile: {
  first_name?: string | null
  last_name?: string | null
  is_deleted?: boolean | null
  program?: string | null
} | null | undefined): boolean {
  if (!profile) return false
  if (profile.is_deleted === true) return true

  const first = (profile.first_name || '').trim().toLowerCase()
  const last = (profile.last_name || '').trim().toLowerCase()

  if (first === 'deleted' && DELETED_LAST_NAMES.has(last)) {
    return true
  }

  // Inactivity anonymization often stores a UUID in program
  if (typeof profile.program === 'string' && /^[0-9a-f-]{36}$/i.test(profile.program.trim())) {
    return true
  }

  return false
}

/** True when a chat list / sidebar display name is the deleted-account placeholder. */
export function isDeletedPartnerLabel(name: string | null | undefined): boolean {
  if (!name) return false
  const trimmed = name.trim()
  if (!trimmed) return false
  if (trimmed.toLowerCase() === DELETED_PROFILE_DISPLAY_NAME.toLowerCase()) return true
  if (trimmed.toLowerCase() === 'deleted user') return true

  const parts = trimmed.split(/\s+/)
  return isAnonymizedDeletedProfile({
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
  })
}

/** Full display name for a deleted/anonymized chat partner. */
export function deletedProfileDisplayName(): string {
  return DELETED_PROFILE_DISPLAY_NAME
}
