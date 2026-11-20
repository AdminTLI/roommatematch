import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  wws_status: z.enum(['under_review', 'certified', 'not_certified']),
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
  const updates: Record<string, unknown> = {
    wws_status: parsed.data.wws_status,
    updated_at: new Date().toISOString(),
  }

  if (parsed.data.wws_status === 'under_review') {
    updates.wws_reviewed_at = null
    updates.wws_review_notes = parsed.data.notes || null
  } else {
    updates.wws_reviewed_at = new Date().toISOString()
    updates.wws_review_notes = parsed.data.notes || null
  }

  const { data, error } = await admin
    .from('housing_listings')
    .update(updates)
    .eq('id', id)
    .select('id, wws_status, wws_documents, wws_reviewed_at, wws_review_notes')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ listing: data })
}
