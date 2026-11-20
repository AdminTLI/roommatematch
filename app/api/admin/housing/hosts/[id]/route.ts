import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Forbidden' },
      { status: adminCheck.status }
    )
  }

  const { id } = await params
  const admin = await createAdminClient()

  const { data: host, error } = await admin
    .from('host_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!host) return NextResponse.json({ error: 'Host not found' }, { status: 404 })

  let email: string | null = null
  try {
    const { data } = await admin.auth.admin.getUserById(host.user_id)
    email = data.user?.email || null
  } catch {
    /* ignore */
  }

  const { data: listings } = await admin
    .from('housing_listings')
    .select(
      'id, title, city, rent_monthly, status, moderation_status, seeking_people, host_type, created_at, updated_at, photos'
    )
    .eq('host_id', id)
    .order('created_at', { ascending: false })

  const listingIds = (listings || []).map((l) => l.id)
  let applications: any[] = []
  if (listingIds.length) {
    const { data: apps } = await admin
      .from('housing_applications')
      .select(
        `id, listing_id, application_type, status, anonymous_label, fit_score, cohesion_score,
         group_size, verification_badges, hard_gates_passed, rejection_reason_code,
         identity_revealed, shortlisted_at, offer_made_at, offer_accepted_at, created_at,
         user_id, group_members, housing_listings(title)`
      )
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })
      .limit(100)
    applications = (apps || []).map((a) => {
      const base = {
        id: a.id,
        listing_id: a.listing_id,
        listing_title: (a.housing_listings as { title?: string } | null)?.title || null,
        application_type: a.application_type,
        status: a.status,
        anonymous_label: a.anonymous_label,
        fit_score: a.fit_score,
        cohesion_score: a.cohesion_score,
        group_size: a.group_size,
        verification_badges: a.verification_badges,
        hard_gates_passed: a.hard_gates_passed,
        rejection_reason_code: a.rejection_reason_code,
        identity_revealed: a.identity_revealed,
        shortlisted_at: a.shortlisted_at,
        offer_made_at: a.offer_made_at,
        offer_accepted_at: a.offer_accepted_at,
        created_at: a.created_at,
      }
      if (a.identity_revealed) {
        return {
          ...base,
          applicant_user_ids: [
            ...new Set([a.user_id, ...((a.group_members as string[]) || [])]),
          ],
        }
      }
      return base
    })
  }

  const rejectionCodes = new Map<string, number>()
  for (const a of applications.filter((x) => x.status === 'rejected')) {
    const code = a.rejection_reason_code || 'unspecified'
    rejectionCodes.set(code, (rejectionCodes.get(code) || 0) + 1)
  }

  return NextResponse.json({
    host: { ...host, email },
    listings: listings || [],
    applications,
    rejection_distribution: [...rejectionCodes.entries()]
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count),
  })
}
