import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireHostProfile } from '@/lib/host/auth'

/**
 * Host inbox: anonymous ranked applications (no names/photos until Accept).
 */
export async function GET() {
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })

  const admin = await createAdminClient()
  const { data: listings } = await admin
    .from('housing_listings')
    .select('id, title')
    .eq('host_id', hostReq.host.id)

  const listingIds = (listings || []).map((l) => l.id)
  if (!listingIds.length) {
    return NextResponse.json({ applications: [], listings: [], host_type: hostReq.host.host_type })
  }

  const { data, error } = await admin
    .from('housing_applications')
    .select(
      'id, listing_id, application_type, status, anonymous_label, fit_score, cohesion_score, score_breakdown, watch_outs, hard_gates_passed, verification_badges, group_size, identity_revealed, host_chat_id, rejection_reason_code, shortlisted_at, accepted_at, offer_made_at, offer_accepted_at, created_at, user_id, group_members, motivation_letter'
    )
    .in('listing_id', listingIds)
    .order('fit_score', { ascending: false, nullsFirst: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const listingTitle = new Map((listings || []).map((l) => [l.id, l.title]))

  const applications = await Promise.all(
    (data || []).map(async (app) => {
      const base = {
        id: app.id,
        listing_id: app.listing_id,
        listing_title: listingTitle.get(app.listing_id) || 'Listing',
        application_type: app.application_type,
        status: app.status,
        anonymous_label: app.anonymous_label,
        fit_score: app.fit_score,
        cohesion_score: app.cohesion_score,
        score_breakdown: app.score_breakdown,
        watch_outs: app.watch_outs,
        hard_gates_passed: app.hard_gates_passed,
        verification_badges: app.verification_badges,
        group_size: app.group_size,
        identity_revealed: app.identity_revealed,
        host_chat_id: app.host_chat_id,
        rejection_reason_code: app.rejection_reason_code,
        shortlisted_at: app.shortlisted_at,
        accepted_at: app.accepted_at,
        offer_made_at: app.offer_made_at,
        offer_accepted_at: app.offer_accepted_at,
        created_at: app.created_at,
        motivation_letter: app.motivation_letter,
      }

      if (!app.identity_revealed) {
        return base
      }

      // Reveal identities after Accept
      const memberIds = [
        ...new Set([app.user_id, ...((app.group_members as string[]) || [])]),
      ]
      const { data: profiles } = await admin
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url, university_email, verification_status')
        .in('user_id', memberIds)

      return { ...base, revealed_members: profiles || [] }
    })
  )

  return NextResponse.json({
    applications,
    listings: listings || [],
    host_type: hostReq.host.host_type,
  })
}
