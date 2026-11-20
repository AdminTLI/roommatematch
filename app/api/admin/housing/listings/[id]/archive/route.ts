import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  archived: z.boolean(),
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
  const { data: existing, error: fetchError } = await admin
    .from('housing_listings')
    .select('id, status, moderation_status, moderation_notes')
    .eq('id', id)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!existing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const note = parsed.data.notes?.trim()
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (parsed.data.archived) {
    updates.status = 'archived'
    if (note) {
      updates.moderation_notes = existing.moderation_notes
        ? `${existing.moderation_notes}\n[Archived] ${note}`
        : `[Archived] ${note}`
    }
  } else {
    // Restore visibility only if moderation already approved; otherwise leave pending queue.
    updates.status =
      existing.moderation_status === 'approved' ? 'active' : 'pending'
    if (note) {
      updates.moderation_notes = existing.moderation_notes
        ? `${existing.moderation_notes}\n[Unarchived] ${note}`
        : `[Unarchived] ${note}`
    }
  }

  const { data, error } = await admin
    .from('housing_listings')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ listing: data })
}
