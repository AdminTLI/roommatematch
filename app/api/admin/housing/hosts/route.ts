import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Forbidden' },
      { status: adminCheck.status }
    )
  }

  const q = request.nextUrl.searchParams.get('q')?.trim() || ''
  const hostType = request.nextUrl.searchParams.get('host_type') || 'all'

  const admin = await createAdminClient()
  let hostQuery = admin
    .from('host_profiles')
    .select(
      'id, user_id, host_type, display_name, company_name, kvk_number, phone, email_verified, onboarding_completed, identity_review_status, identity_review_matched_org, created_at, updated_at'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (hostType !== 'all') {
    hostQuery = hostQuery.eq('host_type', hostType)
  }
  if (q) {
    hostQuery = hostQuery.or(
      `display_name.ilike.%${q}%,company_name.ilike.%${q}%,kvk_number.ilike.%${q}%`
    )
  }

  const { data: hosts, error } = await hostQuery
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const hostIds = (hosts || []).map((h) => h.id)
  if (!hostIds.length) {
    return NextResponse.json({ hosts: [], stats: { total: 0 } })
  }

  const { data: listings } = await admin
    .from('housing_listings')
    .select('id, host_id, status, moderation_status')
    .in('host_id', hostIds)

  const listingIdsByHost = new Map<string, string[]>()
  const listingStats = new Map<
    string,
    { active: number; pending: number; rejected: number; total: number }
  >()
  const hostByListing = new Map<string, string>()
  for (const l of listings || []) {
    const hostId = l.host_id as string
    hostByListing.set(l.id, hostId)
    if (!listingIdsByHost.has(hostId)) listingIdsByHost.set(hostId, [])
    listingIdsByHost.get(hostId)!.push(l.id)
    if (!listingStats.has(hostId)) {
      listingStats.set(hostId, { active: 0, pending: 0, rejected: 0, total: 0 })
    }
    const s = listingStats.get(hostId)!
    s.total += 1
    if (l.moderation_status === 'pending') s.pending += 1
    if (l.moderation_status === 'rejected') s.rejected += 1
    if (l.status === 'active' && l.moderation_status === 'approved') s.active += 1
  }

  const allListingIds = [...hostByListing.keys()]
  const { data: apps } = allListingIds.length
    ? await admin
        .from('housing_applications')
        .select('id, listing_id, status, rejection_reason_code, offer_made_at')
        .in('listing_id', allListingIds)
    : { data: [] as { id: string; listing_id: string; status: string; rejection_reason_code: string | null; offer_made_at: string | null }[] }

  // Resolve emails via auth for display
  const emailByUser = new Map<string, string>()
  await Promise.all(
    (hosts || []).map(async (h) => {
      try {
        const { data } = await admin.auth.admin.getUserById(h.user_id)
        if (data.user?.email) emailByUser.set(h.user_id, data.user.email)
      } catch {
        /* ignore */
      }
    })
  )

  const appStats = new Map<
    string,
    {
      received: number
      shortlisted: number
      offered: number
      rejected: number
      reasons: Map<string, number>
    }
  >()
  for (const a of apps || []) {
    const hostId = hostByListing.get(a.listing_id)
    if (!hostId) continue
    if (!appStats.has(hostId)) {
      appStats.set(hostId, {
        received: 0,
        shortlisted: 0,
        offered: 0,
        rejected: 0,
        reasons: new Map(),
      })
    }
    const s = appStats.get(hostId)!
    s.received += 1
    if (
      a.status === 'shortlisted' ||
      ['offer_pending', 'offer_accepted', 'approved'].includes(a.status)
    ) {
      s.shortlisted += 1
    }
    if (
      a.offer_made_at ||
      ['offer_pending', 'offer_accepted', 'offer_declined', 'approved'].includes(a.status)
    ) {
      s.offered += 1
    }
    if (a.status === 'rejected') {
      s.rejected += 1
      const code = a.rejection_reason_code || 'unspecified'
      s.reasons.set(code, (s.reasons.get(code) || 0) + 1)
    }
  }

  const rows = (hosts || []).map((h) => {
    const ls = listingStats.get(h.id) || { active: 0, pending: 0, rejected: 0, total: 0 }
    const as = appStats.get(h.id) || {
      received: 0,
      shortlisted: 0,
      offered: 0,
      rejected: 0,
      reasons: new Map(),
    }
    const topReason =
      [...as.reasons.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null
    const rate = (n: number, d: number) => (d > 0 ? n / d : null)
    return {
      ...h,
      email: emailByUser.get(h.user_id) || null,
      listings: ls,
      applications: {
        received: as.received,
        shortlisted: as.shortlisted,
        offered: as.offered,
        rejected: as.rejected,
        shortlist_rate: rate(as.shortlisted, as.received),
        offer_rate: rate(as.offered, as.received),
        reject_rate: rate(as.rejected, as.received),
        top_rejection_reason: topReason,
      },
    }
  })

  return NextResponse.json({
    hosts: rows,
    stats: {
      total: rows.length,
      landlords: rows.filter((h) => h.host_type === 'private_landlord').length,
      agencies: rows.filter((h) => h.host_type === 'agency').length,
    },
  })
}
