import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { enrichListingPois } from '@/lib/housing/nearby-pois'
import { normalizeAmenityList } from '@/lib/housing/listing-location'
import { safeLogger } from '@/lib/utils/logger'
import {
  listingDealbreakersSchema,
  listingLifestylePrefsSchema,
} from '@/lib/host/listing-prefs-schema'
import { syncHostListingsIdentity } from '@/lib/host/sync-listing-identity'

const patchSchema = z.object({
  /** Per-listing host name shown to students (list-on-behalf override). */
  landlord_name: z.string().min(1).max(200).optional(),
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
  amenities: z.array(z.string()).optional(),
  pet_friendly: z.boolean().optional(),
  smoking_allowed: z.boolean().optional(),
  furnished: z.boolean().optional(),
  utilities_included: z.boolean().optional(),
  min_stay_months: z.number().int().min(1).optional(),
  max_stay_months: z.number().int().min(1).optional().nullable(),
  available_from: z.string().optional(),
  available_until: z.string().optional().nullable(),
  lifestyle_prefs: listingLifestylePrefsSchema.optional(),
  dealbreakers: listingDealbreakersSchema.optional(),
})

/**
 * PATCH /api/admin/housing/listings/[id]
 * Admin corrections for listing content + per-listing host display name.
 */
export async function PATCH(
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
  const parsed = patchSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const fields = parsed.data
  const admin = await createAdminClient()

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    // Drop any host wizard snapshot so the next host edit loads these admin corrections
    wizard_draft: null,
    wizard_step: null,
  }

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) updates[key] = value
  }

  if (fields.amenities) {
    updates.amenities = normalizeAmenityList(fields.amenities)
  }

  if (fields.latitude != null && fields.longitude != null) {
    updates.neighborhood_lat = fields.latitude + 0.0015 * (Math.random() - 0.5)
    updates.neighborhood_lng = fields.longitude + 0.0018 * (Math.random() - 0.5)
  }

  // Keep dealbreakers aligned with house-rule toggles when those change
  if (fields.pet_friendly != null || fields.smoking_allowed != null || fields.dealbreakers) {
    const { data: existing } = await admin
      .from('housing_listings')
      .select('pet_friendly, smoking_allowed, dealbreakers, seeking_people, min_stay_months')
      .eq('id', id)
      .maybeSingle()

    const petFriendly = fields.pet_friendly ?? existing?.pet_friendly ?? false
    const smokingAllowed = fields.smoking_allowed ?? existing?.smoking_allowed ?? false
    const prevDeal =
      existing?.dealbreakers && typeof existing.dealbreakers === 'object'
        ? (existing.dealbreakers as Record<string, unknown>)
        : {}
    updates.dealbreakers = {
      ...prevDeal,
      ...(fields.dealbreakers || {}),
      no_pets: !petFriendly,
      no_smoking: !smokingAllowed,
      min_stay_months:
        fields.min_stay_months ??
        (fields.dealbreakers as { min_stay_months?: number } | undefined)?.min_stay_months ??
        prevDeal.min_stay_months ??
        existing?.min_stay_months ??
        1,
      max_group_size:
        (fields.dealbreakers as { max_group_size?: number } | undefined)?.max_group_size ??
        prevDeal.max_group_size ??
        existing?.seeking_people ??
        1,
    }
  }

  const { data, error } = await admin
    .from('housing_listings')
    .update(updates)
    .eq('id', id)
    .select('*, host_profiles(id, display_name, company_name, phone, agency_license, kvk_number)')
    .single()

  if (error) {
    safeLogger.error('[Admin] Failed to update listing', { error, id })
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }

  // Admin "host name shown to students" updates the live host profile so Host
  // Settings and student pages stay aligned (landlord_name alone was stale).
  if (fields.landlord_name && data?.host_id) {
    const hostRaw = data.host_profiles
    const hostRow = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw
    if (hostRow?.id) {
      const { data: updatedHost, error: hostError } = await admin
        .from('host_profiles')
        .update({
          display_name: fields.landlord_name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', hostRow.id)
        .select('id, display_name, company_name, phone, agency_license, kvk_number')
        .single()
      if (hostError) {
        safeLogger.warn('Admin listing edit: failed to update host display_name', {
          hostId: hostRow.id,
          error: hostError,
        })
      } else if (updatedHost) {
        try {
          await syncHostListingsIdentity(admin, updatedHost, {
            previousDisplayName: hostRow.display_name,
            forceAll: true,
          })
        } catch (syncError) {
          safeLogger.warn('Admin listing edit: failed to sync listing identity', {
            hostId: updatedHost.id,
            error: syncError,
          })
        }
      }
    }
  }

  if (fields.latitude != null || fields.longitude != null) {
    enrichListingPois(id, true).catch((err) =>
      safeLogger.warn('POI re-enrich failed after admin edit', { err, listingId: id })
    )
  }

  return NextResponse.json({ listing: data })
}
