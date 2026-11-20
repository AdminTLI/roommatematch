import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Estimate typical host reply time (hours) from application first-action lag.
 * Uses median of recent responded applications across the host's listings.
 * Returns null when there is not enough signal yet.
 */
export async function estimateHostResponseHours(
  supabase: SupabaseClient,
  hostId: string | null | undefined,
  options?: { sampleSize?: number }
): Promise<number | null> {
  if (!hostId) return null

  const sampleSize = options?.sampleSize ?? 25

  const { data: listings, error: listingsError } = await supabase
    .from('housing_listings')
    .select('id')
    .eq('host_id', hostId)

  if (listingsError || !listings?.length) return null

  const listingIds = listings.map((l) => l.id)

  const { data: applications, error: appsError } = await supabase
    .from('housing_applications')
    .select(
      'created_at, updated_at, reviewed_at, shortlisted_at, offer_made_at, status'
    )
    .in('listing_id', listingIds)
    .neq('status', 'submitted')
    .neq('status', 'withdrawn')
    .order('updated_at', { ascending: false })
    .limit(sampleSize)

  if (appsError || !applications?.length) return null

  const hours: number[] = []
  for (const app of applications) {
    const created = app.created_at ? new Date(app.created_at).getTime() : NaN
    if (!Number.isFinite(created)) continue

    const candidates = [
      app.reviewed_at,
      app.shortlisted_at,
      app.offer_made_at,
      app.status !== 'submitted' ? app.updated_at : null,
    ]
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
      .map((iso) => new Date(iso).getTime())
      .filter((t) => Number.isFinite(t) && t >= created)

    if (!candidates.length) continue

    const firstAction = Math.min(...candidates)
    const diffHrs = (firstAction - created) / (1000 * 60 * 60)
    if (diffHrs >= 0 && diffHrs < 24 * 30) {
      hours.push(diffHrs)
    }
  }

  if (hours.length < 2) return null

  hours.sort((a, b) => a - b)
  const mid = Math.floor(hours.length / 2)
  const median =
    hours.length % 2 === 0 ? (hours[mid - 1]! + hours[mid]!) / 2 : hours[mid]!

  // Snap to friendly display buckets used in the UI
  if (median <= 6) return 6
  if (median <= 12) return 12
  if (median <= 24) return 24
  if (median <= 48) return 48
  if (median <= 72) return 72
  return Math.min(168, Math.round(median / 24) * 24)
}

export function formatResponseTimeLabel(hours: number | null | undefined): string {
  if (hours == null || !Number.isFinite(hours) || hours <= 0) {
    return 'Not enough data yet'
  }
  if (hours < 24) return `Within ${hours}h`
  const days = Math.round(hours / 24)
  return days === 1 ? 'Within 1 day' : `Within ${days} days`
}
