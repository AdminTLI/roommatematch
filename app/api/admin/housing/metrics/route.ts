import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'

type Period = '7d' | '30d' | 'all'

function periodStart(period: Period): Date | null {
  if (period === 'all') return null
  const d = new Date()
  d.setDate(d.getDate() - (period === '7d' ? 7 : 30))
  return d
}

function median(nums: number[]): number | null {
  if (!nums.length) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function hoursBetween(a: string | null | undefined, b: string | null | undefined): number | null {
  if (!a || !b) return null
  const ms = new Date(b).getTime() - new Date(a).getTime()
  if (!Number.isFinite(ms) || ms < 0) return null
  return ms / (1000 * 60 * 60)
}

function daysBetween(a: string | null | undefined, b: string | null | undefined): number | null {
  const h = hoursBetween(a, b)
  return h == null ? null : h / 24
}

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Forbidden' },
      { status: adminCheck.status }
    )
  }

  const period = (request.nextUrl.searchParams.get('period') || '30d') as Period
  const since = periodStart(period)
  const sinceIso = since?.toISOString() ?? null
  const agingDays = 7
  const agingCutoff = new Date()
  agingCutoff.setDate(agingCutoff.getDate() - agingDays)
  const rejectRateThreshold = 0.6

  const admin = await createAdminClient()

  const [
    hostsRes,
    listingsRes,
    appsRes,
    viewingsRes,
  ] = await Promise.all([
    admin.from('host_profiles').select('id, host_type, created_at, onboarding_completed'),
    admin
      .from('housing_listings')
      .select(
        'id, host_id, host_type, city, status, moderation_status, created_at, updated_at'
      ),
    admin
      .from('housing_applications')
      .select(
        `id, listing_id, user_id, application_type, status, fit_score, cohesion_score,
         hard_gates_passed, verification_badges, rejection_reason_code, group_size,
         shortlisted_at, offer_made_at, offer_accepted_at, created_at, updated_at,
         housing_listings!inner(id, host_id, title, created_at)`
      ),
    admin.from('tour_bookings').select('id, listing_id, application_id, status, created_at'),
  ])

  if (hostsRes.error) {
    return NextResponse.json({ error: hostsRes.error.message }, { status: 500 })
  }
  if (listingsRes.error) {
    return NextResponse.json({ error: listingsRes.error.message }, { status: 500 })
  }
  if (appsRes.error) {
    return NextResponse.json({ error: appsRes.error.message }, { status: 500 })
  }

  const hosts = hostsRes.data || []
  const listings = listingsRes.data || []
  const apps = appsRes.data || []
  // tour_bookings may be missing on older schemas; treat as empty rather than failing the overview
  const viewings = viewingsRes.error ? [] : viewingsRes.data || []

  const inPeriod = (iso: string | null | undefined) =>
    !sinceIso || (iso != null && iso >= sinceIso)

  const hostsInPeriod = hosts.filter((h) => inPeriod(h.created_at))
  const listingsInPeriod = listings.filter((l) => inPeriod(l.created_at))
  const appsInPeriod = apps.filter((a) => inPeriod(a.created_at))
  const viewingsInPeriod = viewings.filter((v) => inPeriod(v.created_at))

  const activeListings = listings.filter(
    (l) => l.status === 'active' && l.moderation_status === 'approved'
  )
  const pendingModeration = listings.filter((l) => l.moderation_status === 'pending')

  const landlordHosts = hosts.filter((h) => h.host_type === 'private_landlord').length
  const agencyHosts = hosts.filter((h) => h.host_type === 'agency').length

  const cityCounts = new Map<string, number>()
  for (const l of activeListings) {
    const city = (l.city || 'Unknown').trim() || 'Unknown'
    cityCounts.set(city, (cityCounts.get(city) || 0) + 1)
  }
  const citiesWithSupply = [...cityCounts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  const groupApps = appsInPeriod.filter((a) => a.application_type === 'group').length
  const individualApps = appsInPeriod.filter((a) => a.application_type === 'individual').length
  const uniqueApplicants = new Set(appsInPeriod.map((a) => a.user_id)).size

  const fitScores = appsInPeriod
    .map((a) => (a.fit_score != null ? Number(a.fit_score) : null))
    .filter((n): n is number => n != null && Number.isFinite(n))
  const hardGateFails = appsInPeriod.filter((a) => a.hard_gates_passed === false).length

  const funnel = {
    submitted: appsInPeriod.length,
    shortlisted: appsInPeriod.filter(
      (a) =>
        a.shortlisted_at ||
        ['shortlisted', 'offer_pending', 'offer_accepted', 'approved'].includes(a.status)
    ).length,
    viewingsBooked: viewingsInPeriod.length,
    offers: appsInPeriod.filter(
      (a) =>
        a.offer_made_at ||
        ['offer_pending', 'offer_accepted', 'offer_declined', 'approved'].includes(a.status)
    ).length,
    accepted: appsInPeriod.filter(
      (a) => a.offer_accepted_at || a.status === 'offer_accepted' || a.status === 'approved'
    ).length,
    rejected: appsInPeriod.filter((a) => a.status === 'rejected').length,
  }

  const rate = (num: number, den: number) => (den > 0 ? num / den : null)

  const rejectionCodes = new Map<string, number>()
  for (const a of appsInPeriod.filter((x) => x.status === 'rejected')) {
    const code = a.rejection_reason_code || 'unspecified'
    rejectionCodes.set(code, (rejectionCodes.get(code) || 0) + 1)
  }
  const rejectionDistribution = [...rejectionCodes.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)

  // Per-host decision stats
  const listingHost = new Map(listings.map((l) => [l.id, l.host_id as string | null]))
  const hostDecision = new Map<
    string,
    { total: number; rejected: number; offered: number; reasons: Map<string, number> }
  >()

  for (const a of apps) {
    const listing = a.housing_listings as { host_id?: string } | null
    const hostId = listing?.host_id || listingHost.get(a.listing_id) || null
    if (!hostId) continue
    if (!hostDecision.has(hostId)) {
      hostDecision.set(hostId, {
        total: 0,
        rejected: 0,
        offered: 0,
        reasons: new Map(),
      })
    }
    const row = hostDecision.get(hostId)!
    row.total += 1
    if (a.status === 'rejected') {
      row.rejected += 1
      const code = a.rejection_reason_code || 'unspecified'
      row.reasons.set(code, (row.reasons.get(code) || 0) + 1)
    }
    if (a.offer_made_at || ['offer_pending', 'offer_accepted', 'offer_declined'].includes(a.status)) {
      row.offered += 1
    }
  }

  const hostById = new Map(hosts.map((h) => [h.id, h]))
  const highRejectHosts = [...hostDecision.entries()]
    .map(([hostId, stats]) => {
      const rejectRate = stats.total > 0 ? stats.rejected / stats.total : 0
      const topReason =
        [...stats.reasons.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null
      return {
        host_id: hostId,
        host_type: (hostById.get(hostId) as { host_type?: string } | undefined)?.host_type || null,
        applications: stats.total,
        rejected: stats.rejected,
        reject_rate: rejectRate,
        top_rejection_reason: topReason,
      }
    })
    .filter((h) => h.applications >= 3 && h.reject_rate >= rejectRateThreshold)
    .sort((a, b) => b.reject_rate - a.reject_rate)
    .slice(0, 10)

  const decisionHours: number[] = []
  const offerHours: number[] = []
  for (const a of appsInPeriod) {
    const firstDecisionAt =
      a.shortlisted_at ||
      a.offer_made_at ||
      (a.status === 'rejected' ? a.updated_at : null)
    const d1 = hoursBetween(a.created_at, firstDecisionAt)
    if (d1 != null) decisionHours.push(d1)
    const d2 = hoursBetween(a.created_at, a.offer_made_at)
    if (d2 != null) offerHours.push(d2)
  }

  const verifiedApps = appsInPeriod.filter(
    (a) => Array.isArray(a.verification_badges) && a.verification_badges.length > 0
  ).length
  const offers = appsInPeriod.filter(
    (a) =>
      a.offer_made_at ||
      ['offer_pending', 'offer_accepted', 'offer_declined', 'approved'].includes(a.status)
  )
  const verifiedOffers = offers.filter(
    (a) => Array.isArray(a.verification_badges) && a.verification_badges.includes('id_verified')
  ).length

  const fillDays: number[] = []
  for (const a of apps.filter((x) => x.offer_accepted_at || x.status === 'offer_accepted')) {
    const listing = a.housing_listings as { created_at?: string } | null
    const days = daysBetween(listing?.created_at, a.offer_accepted_at || a.updated_at)
    if (days != null) fillDays.push(days)
  }

  const openAging = apps.filter(
    (a) =>
      ['submitted', 'under_review', 'shortlisted', 'offer_pending'].includes(a.status) &&
      a.created_at < agingCutoff.toISOString()
  ).length

  const hostsWithListings = new Set(
    listings.filter((l) => l.host_id).map((l) => l.host_id as string)
  ).size

  return NextResponse.json({
    period,
    since: sinceIso,
    generated_at: new Date().toISOString(),
    supply: {
      total_hosts: hosts.length,
      hosts_with_listings: hostsWithListings,
      new_hosts_in_period: hostsInPeriod.length,
      landlord_hosts: landlordHosts,
      agency_hosts: agencyHosts,
      active_listings: activeListings.length,
      pending_moderation: pendingModeration.length,
      new_listings_in_period: listingsInPeriod.length,
      cities_with_supply: citiesWithSupply,
    },
    demand: {
      applications_in_period: appsInPeriod.length,
      group_applications: groupApps,
      individual_applications: individualApps,
      group_share: rate(groupApps, appsInPeriod.length),
      unique_applicants: uniqueApplicants,
    },
    matching_health: {
      median_fit_score: median(fitScores),
      hard_gate_fail_count: hardGateFails,
      hard_gate_fail_rate: rate(hardGateFails, appsInPeriod.length),
    },
    funnel: {
      ...funnel,
      shortlist_rate: rate(funnel.shortlisted, funnel.submitted),
      offer_rate: rate(funnel.offers, funnel.submitted),
      accept_rate: rate(funnel.accepted, funnel.offers),
      reject_rate: rate(funnel.rejected, funnel.submitted),
      viewing_rate: rate(funnel.viewingsBooked, funnel.submitted),
    },
    fairness: {
      rejection_distribution: rejectionDistribution,
      high_reject_hosts: highRejectHosts,
      reject_rate_threshold: rejectRateThreshold,
      avg_hours_to_first_decision: avg(decisionHours),
      avg_hours_to_offer: avg(offerHours),
    },
    trust: {
      apps_with_verification_badges: verifiedApps,
      verified_application_share: rate(verifiedApps, appsInPeriod.length),
      offers_to_id_verified: verifiedOffers,
      verified_offer_share: rate(verifiedOffers, offers.length),
    },
    liquidity: {
      median_days_to_fill: median(fillDays),
      aging_open_applications: openAging,
      aging_days: agingDays,
    },
    queues: {
      pending_listings: pendingModeration.length,
      aging_applications: openAging,
      high_reject_hosts: highRejectHosts.length,
    },
  })
}
