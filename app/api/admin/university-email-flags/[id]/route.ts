import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await requireSuperAdmin(request, false)
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Super admin access required' },
        { status: adminCheck.status }
      )
    }

    const { id } = await context.params
    let body: { status?: string; notes?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (body.status !== 'dismissed') {
      return NextResponse.json(
        { error: 'Only dismissing a flag is supported on this endpoint' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data: existing, error: fetchError } = await admin
      .from('university_email_reuse_flags')
      .select('id, status, email_normalized, attempting_user_id')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 })
    }

    const { error: updateError } = await admin
      .from('university_email_reuse_flags')
      .update({
        status: 'dismissed',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminCheck.user?.id ?? null,
        review_notes: typeof body.notes === 'string' ? body.notes.trim() || null : null,
      })
      .eq('id', id)

    if (updateError) {
      safeLogger.error('[Admin] Dismiss university email flag failed', { updateError })
      return NextResponse.json({ error: 'Failed to dismiss flag' }, { status: 500 })
    }

    if (adminCheck.user?.id) {
      await logAdminAction(
        adminCheck.user.id,
        'dismiss_university_email_flag',
        'university_email_reuse_flag',
        id,
        {
          email_normalized: existing.email_normalized,
          attempting_user_id: existing.attempting_user_id,
          previous_status: existing.status,
        }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    safeLogger.error('[Admin] Dismiss university email flag error', { error })
    return NextResponse.json({ error: 'Failed to dismiss flag' }, { status: 500 })
  }
}
