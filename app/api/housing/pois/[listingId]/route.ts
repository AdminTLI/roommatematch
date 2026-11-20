import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import {
  enrichListingPois,
  getOrCreatePoiRoute,
  POI_ENRICHMENT_VERSION,
} from '@/lib/housing/nearby-pois'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

  const { data: academic } = await admin
    .from('user_academic')
    .select('university_id')
    .eq('user_id', user.id)
    .maybeSingle()
  const plannedUniversityId = academic?.university_id ?? null

  let plannedUniversityName: string | null = null
  if (plannedUniversityId) {
    const { data: uni } = await admin
      .from('universities')
      .select('name')
      .eq('id', plannedUniversityId)
      .maybeSingle()
    plannedUniversityName = uni?.name ?? null
  }

  let { data: pois } = await admin
    .from('listing_nearby_pois')
    .select('*')
    .eq('listing_id', listingId)
    .order('distance_m', { ascending: true })

  const uniCount = (pois || []).filter((p) => p.category === 'university').length
  const versionTag = `_v${POI_ENRICHMENT_VERSION}`
  const hasCurrentSchema = (pois || []).some((p) =>
    String(p.source || '').includes(versionTag)
  )
  const needsRefresh =
    !pois?.length || uniCount === 0 || uniCount > 12 || !hasCurrentSchema

  if (needsRefresh) {
    await enrichListingPois(listingId, true, { plannedUniversityId })
    const refreshed = await admin
      .from('listing_nearby_pois')
      .select('*')
      .eq('listing_id', listingId)
      .order('distance_m', { ascending: true })
    pois = refreshed.data || []
  }

  const poiId = request.nextUrl.searchParams.get('route_poi_id')
  const profile = (request.nextUrl.searchParams.get('profile') || 'foot-walking') as
    | 'foot-walking'
    | 'cycling-regular'

  let route = null
  if (poiId) {
    route = await getOrCreatePoiRoute(listingId, poiId, profile)
  }

  return NextResponse.json({
    pois: pois || [],
    route,
    plannedUniversityId,
    plannedUniversityName,
    attribution: '© OpenStreetMap contributors · Routing © HeiGIT / openrouteservice',
  })
}
