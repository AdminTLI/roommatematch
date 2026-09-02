import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await requireSuperAdmin(request, false)
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Super admin access required' },
        { status: adminCheck.status }
      )
    }

    const { id } = await context.params
    const admin = createAdminClient()

    const { data: existing, error: fetchError } = await admin
      .from('lab_wish_reports')
      .select('id, wish_id, reporter_id')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const { error: deleteError } = await admin
      .from('lab_wish_reports')
      .delete()
      .eq('id', id)

    if (deleteError) {
      safeLogger.error('[Admin DomuLab] Dismiss report failed', { deleteError })
      return NextResponse.json(
        { error: 'Failed to dismiss report' },
        { status: 500 }
      )
    }

    if (adminCheck.user?.id) {
      await logAdminAction(
        adminCheck.user.id,
        'dismiss_lab_wish_report',
        'lab_wish_report',
        id,
        { wish_id: existing.wish_id, reporter_id: existing.reporter_id }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    safeLogger.error('[Admin DomuLab] Dismiss report error', { error })
    return NextResponse.json(
      { error: 'Failed to dismiss report' },
      { status: 500 }
    )
  }
}
