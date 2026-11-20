export const SAVED_LISTINGS_KEY = 'domu_saved_listings'

export function readSavedListingIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SAVED_LISTINGS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0)
  } catch {
    return []
  }
}

export function writeSavedListingIds(ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify([...new Set(ids)]))
  } catch {
    /* ignore quota / private mode */
  }
}

export function toggleSavedListingId(id: string): string[] {
  const current = readSavedListingIds()
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
  writeSavedListingIds(next)
  return next
}
