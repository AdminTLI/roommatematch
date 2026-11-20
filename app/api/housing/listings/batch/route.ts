import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { resolveListingPhotoUrls } from '@/lib/housing/photos'
import { resolveListingHostDisplayName } from '@/lib/host/display-name'
import { isHostVerified } from '@/lib/host/verification'
import { safeLogger } from '@/lib/utils/logger'

const QuerySchema = z.object({
  ids: z.string().min(1),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = QuerySchema.safeParse({
    ids: request.nextUrl.searchParams.get('ids') || '',
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'ids required' }, { status: 400 })
  }

  const ids = [
    ...new Set(
      parsed.data.ids
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    ),
  ].slice(0, 50)

  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!ids.length || ids.some((id) => !uuidRe.test(id))) {
    return NextResponse.json({ error: 'Invalid ids' }, { status: 400 })
  }

  // Admin client avoids embed/RLS failures on host_profiles for saved-list hydration.
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('housing_listings')
    .select(
      'id, title, city, address, rent_monthly, room_type, photos, status, landlord_name, agency_name, host_profiles(display_name, company_name, email_verified)'
    )
    .in('id', ids)
    .eq('status', 'active')

  if (error) {
    safeLogger.warn('saved listings batch failed', { error: error.message, ids })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const listings = await Promise.all(
    (data || []).map(async (row) => {
      const host = row.host_profiles as {
        display_name?: string | null
        company_name?: string | null
        email_verified?: boolean | null
      } | null
      const photos = await resolveListingPhotoUrls(row.photos)
      return {
        id: row.id,
        title: row.title,
        city: row.city,
        address: row.address,
        rent_monthly: row.rent_monthly,
        room_type: row.room_type,
        photos,
        host_name: resolveListingHostDisplayName({
          landlordName: row.landlord_name,
          hostDisplayName: host?.display_name,
          agencyName: row.agency_name,
          hostCompanyName: host?.company_name,
        }),
        host_verified: isHostVerified(host),
      }
    })
  )

  const byId = new Map(listings.map((l) => [l.id, l]))
  return NextResponse.json({
    listings: ids.map((id) => byId.get(id)).filter(Boolean),
  })
}
