import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'

type DsarStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'

const VALID_TRANSITIONS: Record<DsarStatus, DsarStatus[]> = {
  pending: ['in_progress', 'rejected', 'cancelled'],
  in_progress: ['completed', 'rejected'],
  completed: [],
  rejected: [],
  cancelled: [],
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const check = await requireAdmin(req, false)
  if (!check.ok || !check.user) {
    return NextResponse.json(
      { error: check.error || 'Admin access required' },
      { status: check.status }
    )
  }

  const { id } = await Promise.resolve(params)
  const admin = createAdminClient()

  const { data: request, error } = await admin
    .from('dsar_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch DSAR request' }, { status: 500 })
  }

  if (!request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  await logAdminAction(check.user.id, 'view_dsar', 'dsar_request', id, {
    request_type: request.request_type,
    status: request.status,
  })

  return NextResponse.json({ success: true, request })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const check = await requireAdmin(req, false)
  if (!check.ok || !check.user) {
    return NextResponse.json(
      { error: check.error || 'Admin access required' },
      { status: check.status }
    )
  }

  const { id } = await Promise.resolve(params)
  const body = (await req.json()) as {
    status?: DsarStatus
    admin_notes?: string
  }

  const admin = createAdminClient()
  const { data: existing, error: fetchError } = await admin
    .from('dsar_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: 'Failed to fetch DSAR request' }, { status: 500 })
  }

  if (!existing) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const currentStatus = existing.status as DsarStatus
  const nextStatus = body.status

  if (nextStatus) {
    const allowed = VALID_TRANSITIONS[currentStatus] ?? []
    if (!allowed.includes(nextStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${nextStatus}` },
        { status: 400 }
      )
    }
  }

  const updates: Record<string, unknown> = {
    admin_id: check.user.id,
  }

  if (nextStatus) {
    updates.status = nextStatus
    if (nextStatus === 'completed') {
      updates.completed_at = new Date().toISOString()
    }
  }

  if (body.admin_notes !== undefined) {
    updates.admin_notes = body.admin_notes
  }

  const { data: updated, error: updateError } = await admin
    .from('dsar_requests')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update DSAR request' }, { status: 500 })
  }

  await logAdminAction(check.user.id, 'update_dsar', 'dsar_request', id, {
    previous_status: currentStatus,
    new_status: updated.status,
    admin_notes: body.admin_notes ?? null,
  })

  return NextResponse.json({ success: true, request: updated })
}
