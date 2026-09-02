export type AuthIdentitySource = {
  email?: string | null
  user_metadata?: Record<string, unknown> | null
}

export type ResolvedIdentityName = {
  firstName: string | null
  lastName: string | null
  displayName: string
}

const PLACEHOLDER_FIRST_NAMES = new Set(['user', 'member', 'student', 'there'])

function trimName(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function emailLocalPart(email: string | null | undefined): string | null {
  if (!email) return null
  const local = email.split('@')[0]?.trim()
  return local ? local : null
}

export function isEmailLocalPartName(
  name: string | null | undefined,
  email: string | null | undefined
): boolean {
  const trimmed = trimName(name)
  const local = emailLocalPart(email)
  if (!trimmed || !local) return false
  return trimmed.toLowerCase() === local.toLowerCase()
}

export function isPlaceholderFirstName(
  name: string | null | undefined,
  email: string | null | undefined
): boolean {
  const trimmed = trimName(name)
  if (!trimmed) return true
  if (PLACEHOLDER_FIRST_NAMES.has(trimmed.toLowerCase())) return true
  return isEmailLocalPartName(trimmed, email)
}

export function resolveAuthIdentityName(user: AuthIdentitySource): ResolvedIdentityName {
  const meta = (user.user_metadata || {}) as Record<string, unknown>
  const metaFirst = trimName(meta.first_name)
  const metaLast = trimName(meta.last_name)
  const full = trimName(meta.full_name)
  const fullParts = full ? full.split(/\s+/).filter(Boolean) : []
  const firstFromFull = fullParts[0] || null
  const lastFromFull = fullParts.length > 1 ? fullParts.slice(1).join(' ') : null

  const firstName = metaFirst || firstFromFull
  const lastName = metaLast || lastFromFull
  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'User'

  return { firstName, lastName, displayName }
}

export function resolveStoredProfileName(
  profile: { first_name?: string | null; last_name?: string | null } | null | undefined,
  user: AuthIdentitySource
): ResolvedIdentityName {
  const auth = resolveAuthIdentityName(user)
  const storedFirst = trimName(profile?.first_name)
  const storedLast = trimName(profile?.last_name)
  const storedFirstIsPlaceholder = isPlaceholderFirstName(storedFirst, user.email)

  const firstName = storedFirstIsPlaceholder ? auth.firstName : storedFirst || auth.firstName
  const lastName = storedFirstIsPlaceholder
    ? auth.lastName || storedLast
    : storedLast || auth.lastName
  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim() || auth.displayName

  return { firstName, lastName, displayName }
}
