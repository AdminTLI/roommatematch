/**
 * URL for the DiceBear-backed programmatic avatar (served as SVG from our API).
 * Keep seeds alphanumeric so query strings stay simple.
 */
export function programmaticAvatarUrl(avatarId: string | null | undefined, fallbackUserId?: string): string {
  const seedSource = (avatarId && String(avatarId).trim()) || fallbackUserId || 'anonymous'
  const seed = encodeURIComponent(seedSource.slice(0, 128))
  return `/api/avatar/programmatic?seed=${seed}`
}
