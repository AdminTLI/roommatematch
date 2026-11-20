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

  const status = request.nextUrl.searchParams.get('status') || 'all'
  const rejection = request.nextUrl.searchParams.get('rejection_reason') || 'all'
  const hostId = request.nextUrl.searchParams.get('host_id') || ''
  const listingId = request.nextUrl.searchParams.get('listing_id') || ''
  const aging = request.nextUrl.searchParams.get('aging') === '1'
  const q = request.nextUrl.searchParams.get('q')?.trim() || ''
  const showIds = request.nextUrl.searchParams.get('show_ids') === '1'

  const agingDays = 7
  const agingCutoff = new Date()
  agingCutoff.setDate(agingCutoff.getDate() - agingDays)

  const admin = await createAdminClient()
  let query = admin
    .from('housing_applications')
    .select(
      `id, listing_id, user_id, application_type, status, anonymous_label, fit_score, cohesion_score,
       score_breakdown, watch_outs, hard_gates_passed, verification_badges, group_size,
       rejection_reason_code, rejection_note, identity_revealed, group_members,
       shortlisted_at, offer_made_at, offer_accepted_at, created_at, updated_at,
       housing_listings!inner(
         id, title, city, host_id, host_type, rent_monthly,
         host_profiles(id, display_name, host_type, company_name)
       )`
    )
    .order('created_at', { ascending: false })
    .limit(150)

  if (status !== 'all') query = query.eq('status', status)
  if (rejection !== 'all') {
    if (rejection === 'unspecified') {
      query = query.is('rejection_reason_code', null).eq('status', 'rejected')
    } else {
      query = query.eq('rejection_reason_code', rejection)
    }
  }
  if (listingId) query = query.eq('listing_id', listingId)
  if (hostId) query = query.eq('housing_listings.host_id', hostId)
  if (aging) {
    query = query
      .in('status', ['submitted', 'under_review', 'shortlisted', 'offer_pending'])
      .lt('created_at', agingCutoff.toISOString())
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let rows = data || []
  if (q) {
    const lower = q.toLowerCase()
    rows = rows.filter((a) => {
      const listing = a.housing_listings as {
        title?: string
        city?: string
        host_profiles?: { display_name?: string }
      } | null
      return (
        (a.anonymous_label || '').toLowerCase().includes(lower) ||
        (listing?.title || '').toLowerCase().includes(lower) ||
        (listing?.city || '').toLowerCase().includes(lower) ||
        (listing?.host_profiles?.display_name || '').toLowerCase().includes(lower)
      )
    })
  }

  const applications = rows.map((a) => {
    const listing = a.housing_listings as {
      id?: string
      title?: string
      city?: string
      host_id?: string
      host_type?: string
      rent_monthly?: number
      host_profiles?: {
        id?: string
        display_name?: string
        host_type?: string
        company_name?: string | null
      } | null
    } | null

    const base: Record<string, unknown> = {
      id: a.id,
      listing_id: a.listing_id,
      listing_title: listing?.title || null,
      listing_city: listing?.city || null,
      rent_monthly: listing?.rent_monthly ?? null,
      host_id: listing?.host_id || listing?.host_profiles?.id || null,
      host_name: listing?.host_profiles?.display_name || null,
      host_type: listing?.host_type || listing?.host_profiles?.host_type || null,
      application_type: a.application_type,
      status: a.status,
      anonymous_label: a.anonymous_label,
      fit_score: a.fit_score,
      cohesion_score: a.cohesion_score,
      score_breakdown: a.score_breakdown,
      watch_outs: a.watch_outs,
      hard_gates_passed: a.hard_gates_passed,
      verification_badges: a.verification_badges,
      group_size: a.group_size,
      rejection_reason_code: a.rejection_reason_code,
      rejection_note: a.rejection_note,
      identity_revealed: a.identity_revealed,
      shortlisted_at: a.shortlisted_at,
      offer_made_at: a.offer_made_at,
      offer_accepted_at: a.offer_accepted_at,
      created_at: a.created_at,
      updated_at: a.updated_at,
      aging_days: Math.floor(
        (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }

    if (showIds || a.identity_revealed) {
      base.applicant_user_ids = [
        ...new Set([a.user_id, ...((a.group_members as string[]) || [])]),
      ]
    }

    return base
  })

  const statusCounts = new Map<string, number>()
  for (const a of applications) {
    const s = String(a.status)
    statusCounts.set(s, (statusCounts.get(s) || 0) + 1)
  }

  return NextResponse.json({
    applications,
    stats: {
      returned: applications.length,
      by_status: Object.fromEntries(statusCounts),
      aging_days: agingDays,
    },
  })
}
