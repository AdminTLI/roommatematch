import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { enrichListingPois } from '@/lib/housing/nearby-pois'
import { safeLogger } from '@/lib/utils/logger'

const schema = z.object({
  moderation_status: z.enum(['approved', 'rejected', 'needs_review', 'pending']),
  notes: z.string().max(2000).optional(),
})

export async function POST(
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
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const admin = await createAdminClient()

  if (parsed.data.moderation_status === 'approved') {
    const { data: listingRow } = await admin
      .from('housing_listings')
      .select('host_id, host_profiles(email_verified, user_id)')
      .eq('id', id)
      .maybeSingle()

    const hostRaw = listingRow?.host_profiles as
      | { email_verified?: boolean; user_id?: string }
      | { email_verified?: boolean; user_id?: string }[]
      | null
    const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw
    let emailVerified = Boolean(host?.email_verified)
    if (!emailVerified && host?.user_id) {
      try {
        const { data: u } = await admin.auth.admin.getUserById(host.user_id)
        emailVerified = Boolean(u.user?.email_confirmed_at)
      } catch {
        /* keep false */
      }
    }
    if (!emailVerified) {
      return NextResponse.json(
        {
          error: 'host_unverified',
          message: 'Cannot approve until the host verifies their email',
        },
        { status: 403 }
      )
    }
  }

  const updates: Record<string, unknown> = {
    moderation_status: parsed.data.moderation_status,
    moderation_notes: parsed.data.notes || null,
    updated_at: new Date().toISOString(),
  }
  if (parsed.data.moderation_status === 'approved') {
    updates.status = 'active'
  }

  const { data, error } = await admin
    .from('housing_listings')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (parsed.data.moderation_status === 'approved' && data.latitude && data.longitude) {
    enrichListingPois(id).catch((e) => safeLogger.warn('poi enrich on approve', { e }))
  }

  return NextResponse.json({ listing: data })
}
