import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { syncHostListingsIdentity } from '@/lib/host/sync-listing-identity'
import { safeLogger } from '@/lib/utils/logger'

const bodySchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(2000).optional().nullable(),
})

/**
 * Approve or reject a host's claimed organisation / agency name.
 */
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
  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { data: host, error } = await admin
    .from('host_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!host) return NextResponse.json({ error: 'Host not found' }, { status: 404 })

  if (host.identity_review_status !== 'pending') {
    return NextResponse.json(
      { error: 'This host has no pending identity name review' },
      { status: 400 }
    )
  }

  const now = new Date().toISOString()

  if (parsed.data.action === 'reject') {
    const { data: updated, error: updateError } = await admin
      .from('host_profiles')
      .update({
        identity_review_status: 'rejected',
        identity_reviewed_at: now,
        identity_review_notes: parsed.data.notes?.trim() || null,
        updated_at: now,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    return NextResponse.json({ host: updated })
  }

  // Approve: promote pending names onto live profile fields
  const nextDisplay =
    (host.identity_review_display_name || '').trim() || host.display_name
  const nextCompany =
    (host.identity_review_company_name || '').trim() || host.company_name || null

  const { data: updated, error: updateError } = await admin
    .from('host_profiles')
    .update({
      display_name: nextDisplay,
      company_name: nextCompany,
      identity_review_status: 'approved',
      identity_reviewed_at: now,
      identity_review_notes: parsed.data.notes?.trim() || null,
      updated_at: now,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  try {
    await syncHostListingsIdentity(admin, updated, {
      previousDisplayName: host.display_name,
      previousCompanyName: host.company_name,
      forceAll: true,
    })
  } catch (syncError) {
    safeLogger.warn('Identity approve: listing sync failed', {
      hostId: id,
      error: syncError,
    })
  }

  return NextResponse.json({ host: updated })
}
