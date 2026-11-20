import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { enrichListingPois } from '@/lib/housing/nearby-pois'
import { safeLogger } from '@/lib/utils/logger'

/**
 * Slow cron: enrich a few listings per run to stay under HeiGIT Matrix 500/day.
 * Authorize with CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')
  const expected = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = await createAdminClient()
  const { data: listings } = await admin
    .from('housing_listings')
    .select('id')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .in('status', ['active', 'pending'])
    .order('updated_at', { ascending: true })
    .limit(10)

  const results = []
  for (const listing of listings || []) {
    try {
      const result = await enrichListingPois(listing.id, false)
      results.push({ id: listing.id, ...result })
      // polite gap between Overpass/Matrix bursts
      await new Promise((r) => setTimeout(r, 1500))
    } catch (e) {
      safeLogger.warn('cron poi enrich failed', { id: listing.id, e })
      results.push({ id: listing.id, ok: false })
    }
  }

  return NextResponse.json({ processed: results.length, results })
}
