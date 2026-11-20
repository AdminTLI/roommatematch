import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { isHostVerified } from '@/lib/host/verification'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json({ error: adminCheck.error || 'Forbidden' }, { status: adminCheck.status })
  }

  const status = request.nextUrl.searchParams.get('moderation_status') || 'pending'
  const search = request.nextUrl.searchParams.get('q')?.trim() || ''
  const city = request.nextUrl.searchParams.get('city')?.trim() || ''
  const hostType = request.nextUrl.searchParams.get('host_type') || 'all'

  const admin = await createAdminClient()
  let query = admin
    .from('housing_listings')
    .select(
      `
      id,
      title,
      description,
      city,
      postal_code,
      address,
      latitude,
      longitude,
      rent_monthly,
      deposit_amount,
      utilities_cost,
      agency_fee,
      seeking_people,
      available_rooms,
      total_rooms,
      total_bathrooms,
      square_meters,
      property_type,
      room_type,
      host_type,
      status,
      moderation_status,
      moderation_notes,
      photos,
      amenities,
      furnished,
      utilities_included,
      pet_friendly,
      smoking_allowed,
      lifestyle_prefs,
      dealbreakers,
      available_from,
      available_until,
      min_stay_months,
      max_stay_months,
      landlord_name,
      landlord_email,
      landlord_phone,
      agency_name,
      agency_license,
      created_at,
      updated_at,
      host_id,
      host_profiles (
        id,
        display_name,
        host_type,
        company_name,
        kvk_number,
        phone,
        user_id,
        email_verified,
        id_verified,
        verification_deadline_at,
        onboarding_completed,
        created_at
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (status === 'archived') {
    query = query.eq('status', 'archived')
  } else if (status !== 'all') {
    query = query.eq('moderation_status', status).neq('status', 'archived')
  }
  if (city) {
    query = query.ilike('city', city)
  }
  if (hostType !== 'all') {
    query = query.eq('host_type', hostType)
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,city.ilike.%${search}%,landlord_name.ilike.%${search}%,landlord_email.ilike.%${search}%`
    )
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const hostIds = [
    ...new Set(
      (data || [])
        .map((row: { host_id?: string }) => row.host_id)
        .filter(Boolean) as string[]
    ),
  ]

  const listingCounts = new Map<string, { total: number; approved: number }>()
  if (hostIds.length) {
    const { data: hostListings } = await admin
      .from('housing_listings')
      .select('host_id, moderation_status')
      .in('host_id', hostIds)

    for (const row of hostListings || []) {
      const hid = row.host_id as string
      const cur = listingCounts.get(hid) || { total: 0, approved: 0 }
      cur.total += 1
      if (row.moderation_status === 'approved') cur.approved += 1
      listingCounts.set(hid, cur)
    }
  }

  // Sync email_verified from auth when stale
  const userIds = [
    ...new Set(
      (data || [])
        .map((row: any) => {
          const hp = Array.isArray(row.host_profiles) ? row.host_profiles[0] : row.host_profiles
          return hp?.user_id as string | undefined
        })
        .filter(Boolean) as string[]
    ),
  ]
  const emailByUser = new Map<string, { email?: string; confirmed: boolean }>()
  await Promise.all(
    userIds.map(async (uid) => {
      try {
        const { data: u } = await admin.auth.admin.getUserById(uid)
        emailByUser.set(uid, {
          email: u.user?.email,
          confirmed: Boolean(u.user?.email_confirmed_at),
        })
      } catch {
        emailByUser.set(uid, { confirmed: false })
      }
    })
  )

  const listings = (data || []).map((row: any) => {
    const hostRaw = row.host_profiles
    const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw
    const authInfo = host?.user_id ? emailByUser.get(host.user_id) : undefined
    const emailVerified = Boolean(host?.email_verified) || Boolean(authInfo?.confirmed)
    const counts = row.host_id ? listingCounts.get(row.host_id) : undefined
    const accountAgeDays = host?.created_at
      ? Math.floor((Date.now() - new Date(host.created_at).getTime()) / 86400000)
      : null

    return {
      ...row,
      host_profiles: host
        ? {
            ...host,
            email_verified: emailVerified,
            auth_email: authInfo?.email || row.landlord_email || null,
          }
        : null,
      host_trust: {
        display_name: host?.display_name || row.landlord_name,
        host_type: host?.host_type || row.host_type,
        email: authInfo?.email || row.landlord_email || null,
        email_verified: emailVerified,
        kvk_number: host?.kvk_number || null,
        phone: host?.phone || row.landlord_phone || null,
        account_age_days: accountAgeDays,
        prior_listings: counts?.total ?? 0,
        prior_approvals: counts?.approved ?? 0,
        id_verified: Boolean(host?.id_verified),
        host_verified: isHostVerified({ email_verified: emailVerified }),
      },
    }
  })

  const [
    { count: pending },
    { count: approved },
    { count: rejected },
    { count: needsReview },
    { count: archived },
  ] = await Promise.all([
    admin
      .from('housing_listings')
      .select('*', { count: 'exact', head: true })
      .eq('moderation_status', 'pending')
      .neq('status', 'archived'),
    admin
      .from('housing_listings')
      .select('*', { count: 'exact', head: true })
      .eq('moderation_status', 'approved')
      .neq('status', 'archived'),
    admin
      .from('housing_listings')
      .select('*', { count: 'exact', head: true })
      .eq('moderation_status', 'rejected')
      .neq('status', 'archived'),
    admin
      .from('housing_listings')
      .select('*', { count: 'exact', head: true })
      .eq('moderation_status', 'needs_review')
      .neq('status', 'archived'),
    admin
      .from('housing_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'archived'),
  ])

  return NextResponse.json({
    listings,
    stats: {
      pending: pending ?? 0,
      approved: approved ?? 0,
      rejected: rejected ?? 0,
      needs_review: needsReview ?? 0,
      archived: archived ?? 0,
      total:
        (pending ?? 0) +
        (approved ?? 0) +
        (rejected ?? 0) +
        (needsReview ?? 0) +
        (archived ?? 0),
    },
  })
}
