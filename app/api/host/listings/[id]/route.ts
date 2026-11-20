import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { assertListingOwnedByHost, requireHostProfile } from '@/lib/host/auth'
import {
  listingDealbreakersSchema,
  listingLifestylePrefsSchema,
} from '@/lib/host/listing-prefs-schema'
import { enrichListingPois } from '@/lib/housing/nearby-pois'
import { normalizeAmenityList } from '@/lib/housing/listing-location'
import { resolveListingPhotoUrls } from '@/lib/housing/photos'
import { safeLogger } from '@/lib/utils/logger'

const patchSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(20).max(10000).optional(),
  address: z.string().min(3).max(500).optional(),
  city: z.string().min(2).max(100).optional(),
  postal_code: z.string().min(4).max(10).optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  house_number: z.string().max(20).optional().nullable(),
  house_letter: z.string().max(10).optional().nullable(),
  house_number_addition: z.string().max(20).optional().nullable(),
  floor_level: z.string().max(40).optional().nullable(),
  unit_label: z.string().max(80).optional().nullable(),
  property_type: z
    .enum(['apartment', 'house', 'studio', 'shared_room', 'private_room'])
    .optional(),
  room_type: z.enum(['private', 'shared', 'studio', 'entire_place']).optional(),
  total_rooms: z.number().int().min(1).optional(),
  available_rooms: z.number().int().min(1).optional(),
  seeking_people: z.number().int().min(1).optional(),
  total_bathrooms: z.number().min(0.5).optional(),
  square_meters: z.number().int().optional().nullable(),
  rent_monthly: z.number().min(0).optional(),
  utilities_included: z.boolean().optional(),
  utilities_cost: z.number().min(0).optional(),
  deposit_amount: z.number().min(0).optional(),
  agency_fee: z.number().min(0).optional(),
  available_from: z.string().optional(),
  available_until: z.string().optional().nullable(),
  min_stay_months: z.number().int().optional(),
  max_stay_months: z.number().int().optional().nullable(),
  amenities: z.array(z.string()).optional(),
  pet_friendly: z.boolean().optional(),
  smoking_allowed: z.boolean().optional(),
  furnished: z.boolean().optional(),
  parking_available: z.boolean().optional(),
  photos: z.array(z.string()).optional(),
  wws_documents: z.array(z.string()).optional(),
  lifestyle_prefs: listingLifestylePrefsSchema.optional(),
  dealbreakers: listingDealbreakersSchema.optional(),
  status: z.enum(['active', 'pending', 'suspended', 'rented', 'expired', 'draft']).optional(),
  submit_for_review: z.boolean().optional(),
  save_as_draft: z.boolean().optional(),
  wizard_draft: z.any().optional().nullable(),
  wizard_step: z.string().max(40).optional().nullable(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })
  if (!(await assertListingOwnedByHost(id, hostReq.host.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const admin = await createAdminClient()
  const { data, error } = await admin.from('housing_listings').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: applications } = await admin
    .from('housing_applications')
    .select('status')
    .eq('listing_id', id)

  const counts = {
    total: 0,
    new: 0,
    shortlisted: 0,
    offers: 0,
  }
  for (const app of applications || []) {
    counts.total += 1
    if (app.status === 'submitted' || app.status === 'under_review') counts.new += 1
    else if (app.status === 'shortlisted') counts.shortlisted += 1
    else if (app.status === 'offer_pending' || app.status === 'offer_accepted') counts.offers += 1
  }

  const listing = {
    ...data,
    photos: await resolveListingPhotoUrls(data.photos),
  }

  return NextResponse.json({ listing, application_counts: counts })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })
  if (!(await assertListingOwnedByHost(id, hostReq.host.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const parsed = patchSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { submit_for_review, save_as_draft, ...fields } = parsed.data
  const admin = await createAdminClient()

  if (submit_for_review) {
    const { data: existing } = await admin
      .from('housing_listings')
      .select('address, city, latitude, longitude, lifestyle_prefs')
      .eq('id', id)
      .maybeSingle()
    const address = (fields.address ?? existing?.address ?? '').toString().trim()
    const city = (fields.city ?? existing?.city ?? '').toString().trim()
    const lat = fields.latitude !== undefined ? fields.latitude : existing?.latitude
    const lng = fields.longitude !== undefined ? fields.longitude : existing?.longitude
    if (lat == null || lng == null) {
      return NextResponse.json(
        {
          error:
            'Pick a full street address from the suggestions so the listing can be placed on the map.',
        },
        { status: 400 }
      )
    }
    if (address && city && address.toLowerCase() === city.toLowerCase()) {
      return NextResponse.json(
        { error: 'Street address is required (city name alone is not enough).' },
        { status: 400 }
      )
    }
    const prefs = (fields.lifestyle_prefs ?? existing?.lifestyle_prefs ?? {}) as Record<
      string,
      unknown
    >
    const prefKeys = Object.keys(prefs).filter((k) => prefs[k] != null)
    if (prefKeys.length < 5) {
      return NextResponse.json(
        { error: 'Complete the lifestyle fit questions before submitting.' },
        { status: 400 }
      )
    }
  }

  const updates: Record<string, unknown> = {
    ...fields,
    updated_at: new Date().toISOString(),
  }
  if (fields.amenities) {
    updates.amenities = normalizeAmenityList(fields.amenities)
  }
  if (submit_for_review) {
    updates.status = 'pending'
    updates.moderation_status = 'pending'
    updates.wizard_draft = null
    updates.wizard_step = null
  } else if (save_as_draft) {
    // Never demote a published / pending listing back to draft on autosave
    const { data: existing } = await admin
      .from('housing_listings')
      .select('status')
      .eq('id', id)
      .maybeSingle()
    if (!existing || existing.status === 'draft') {
      updates.status = 'draft'
    }
  }
  if (fields.wws_documents != null) {
    updates.wws_status = 'under_review'
    updates.wws_reviewed_at = null
  }
  if (fields.latitude != null && fields.longitude != null) {
    updates.neighborhood_lat = fields.latitude + 0.0015 * (Math.random() - 0.5)
    updates.neighborhood_lng = fields.longitude + 0.0018 * (Math.random() - 0.5)
  }

  const { data, error } = await admin
    .from('housing_listings')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (fields.latitude != null || fields.longitude != null) {
    enrichListingPois(id, true).catch((err) =>
      safeLogger.warn('POI re-enrich failed', { err, listingId: id })
    )
  }

  return NextResponse.json({ listing: data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })
  if (!(await assertListingOwnedByHost(id, hostReq.host.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const admin = await createAdminClient()
  const { data: existing } = await admin
    .from('housing_listings')
    .select('status')
    .eq('id', id)
    .maybeSingle()

  // Drafts are removed entirely; published listings are soft-expired
  if (existing?.status === 'draft') {
    const { error } = await admin.from('housing_listings').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await admin
      .from('housing_listings')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
