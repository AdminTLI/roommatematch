import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { requireHostProfile } from '@/lib/host/auth'
import {
  listingDealbreakersSchema,
  listingLifestylePrefsSchema,
} from '@/lib/host/listing-prefs-schema'
import { enrichListingPois } from '@/lib/housing/nearby-pois'
import { normalizeAmenityList } from '@/lib/housing/listing-location'
import { resolveListingPhotoUrls } from '@/lib/housing/photos'
import { safeLogger } from '@/lib/utils/logger'

const listingSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(20).max(10000),
  address: z.string().min(3).max(500),
  city: z.string().min(2).max(100),
  postal_code: z.string().min(4).max(10),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  house_number: z.string().max(20).optional().nullable(),
  house_letter: z.string().max(10).optional().nullable(),
  house_number_addition: z.string().max(20).optional().nullable(),
  floor_level: z.string().max(40).optional().nullable(),
  unit_label: z.string().max(80).optional().nullable(),
  property_type: z.enum(['apartment', 'house', 'studio', 'shared_room', 'private_room']),
  room_type: z.enum(['private', 'shared', 'studio', 'entire_place']),
  total_rooms: z.number().int().min(1).max(50),
  available_rooms: z.number().int().min(1).max(50),
  seeking_people: z.number().int().min(1).max(20).default(1),
  total_bathrooms: z.number().min(0.5).max(20),
  square_meters: z.number().int().optional().nullable(),
  rent_monthly: z.number().min(0),
  utilities_included: z.boolean().optional(),
  utilities_cost: z.number().min(0).optional(),
  deposit_amount: z.number().min(0).optional(),
  agency_fee: z.number().min(0).optional(),
  available_from: z.string(),
  available_until: z.string().optional().nullable(),
  min_stay_months: z.number().int().min(1).optional(),
  max_stay_months: z.number().int().optional().nullable(),
  amenities: z.array(z.string()).optional(),
  pet_friendly: z.boolean().optional(),
  smoking_allowed: z.boolean().optional(),
  furnished: z.boolean().optional(),
  parking_available: z.boolean().optional(),
  photos: z.array(z.string().url()).optional(),
  wws_documents: z.array(z.string().url()).optional(),
  lifestyle_prefs: listingLifestylePrefsSchema.optional(),
  dealbreakers: listingDealbreakersSchema.optional(),
  status: z.enum(['active', 'pending', 'suspended', 'rented', 'expired', 'draft']).optional(),
  submit_for_review: z.boolean().optional(),
  save_as_draft: z.boolean().optional(),
  wizard_draft: z.any().optional(),
  wizard_step: z.string().max(40).optional(),
})

export async function GET() {
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('housing_listings')
    .select('*')
    .eq('host_id', hostReq.host.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const listings = await Promise.all(
    (data || []).map(async (listing) => ({
      ...listing,
      photos: await resolveListingPhotoUrls(listing.photos),
    }))
  )

  return NextResponse.json({ listings })
}

export async function POST(request: NextRequest) {
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })

  const body = await request.json()
  const parsed = listingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { submit_for_review, save_as_draft, wizard_draft, wizard_step, ...fields } = parsed.data
  const admin = await createAdminClient()

  if (submit_for_review) {
    if (fields.latitude == null || fields.longitude == null) {
      return NextResponse.json(
        {
          error:
            'Pick a full street address from the suggestions so the listing can be placed on the map.',
        },
        { status: 400 }
      )
    }
    const cityOnly =
      fields.address.trim().toLowerCase() === fields.city.trim().toLowerCase()
    if (cityOnly) {
      return NextResponse.json(
        { error: 'Street address is required (city name alone is not enough).' },
        { status: 400 }
      )
    }
    const prefs = fields.lifestyle_prefs || {}
    const prefKeys = Object.keys(prefs).filter(
      (k) => (prefs as Record<string, unknown>)[k] != null
    )
    if (prefKeys.length < 5) {
      return NextResponse.json(
        { error: 'Complete the lifestyle fit questions before submitting.' },
        { status: 400 }
      )
    }
  }

  // Neighborhood jitter (~150–300m) for public browse privacy
  let neighborhood_lat = fields.latitude ?? null
  let neighborhood_lng = fields.longitude ?? null
  if (fields.latitude != null && fields.longitude != null) {
    const jitter = 0.0015 * (Math.random() - 0.5)
    neighborhood_lat = fields.latitude + jitter
    neighborhood_lng = fields.longitude + jitter * 1.2
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const status = submit_for_review
    ? 'pending'
    : save_as_draft
      ? 'draft'
      : fields.status || 'pending'

  const row = {
    ...fields,
    host_id: hostReq.host.id,
    host_type: hostReq.host.host_type,
    landlord_name: hostReq.host.display_name,
    landlord_email: user?.email || 'host@domumatch.com',
    agency_name: hostReq.host.company_name || null,
    agency_license: hostReq.host.agency_license || hostReq.host.kvk_number || null,
    neighborhood_lat,
    neighborhood_lng,
    status,
    moderation_status: 'pending',
    lifestyle_prefs: fields.lifestyle_prefs || {},
    dealbreakers: fields.dealbreakers || {},
    amenities: normalizeAmenityList(fields.amenities || []),
    photos: fields.photos || [],
    wws_documents: fields.wws_documents || [],
    wws_status: 'under_review',
    wizard_draft: wizard_draft ?? null,
    wizard_step: wizard_step ?? null,
  }

  const { data, error } = await admin.from('housing_listings').insert(row).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (data.latitude && data.longitude) {
    enrichListingPois(data.id).catch((err) =>
      safeLogger.warn('POI enrich failed', { err, listingId: data.id })
    )
  }

  return NextResponse.json({ listing: data }, { status: 201 })
}
