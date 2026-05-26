import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { getAdminInviteRedirectUrl } from '@/lib/auth/institution-invite'

/**
 * POST /api/admin/role-assignments/resend-invite
 * Body: { id: string }
 * Re-sends the Supabase Auth invite for a pending assignment.
 */
export async function POST(request: NextRequest) {
  const adminCheck = await requireSuperAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Super admin access required' },
      { status: adminCheck.status }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const id = String(body?.id || '')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  try {
    const admin = createAdminClient()
    const { data: assignment } = await admin
      .from('admin_role_assignments')
      .select('id, email, status, role, institution_id, first_name, last_name')
      .eq('id', id)
      .maybeSingle()

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }
    if (assignment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot resend invite for an assignment that is not pending' },
        { status: 400 }
      )
    }

    let redirectTo: string
    try {
      redirectTo = getAdminInviteRedirectUrl()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid invite redirect URL'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(assignment.email, {
      redirectTo,
      data: {
        invited_role: assignment.role,
        invited_institution_id: assignment.institution_id,
        invited_first_name: assignment.first_name,
        invited_last_name: assignment.last_name,
      },
    })

    if (inviteError) {
      safeLogger.warn('[Admin] Resend invite failed', { error: inviteError, id, redirectTo })
      return NextResponse.json(
        {
          error: inviteError.message,
          hint: 'Check Supabase Auth → SMTP settings and redirect URLs. See docs/email-troubleshooting.md',
        },
        { status: 500 }
      )
    }

    const now = new Date().toISOString()
    await admin.from('admin_role_assignments').update({ invite_sent_at: now }).eq('id', id)

    return NextResponse.json({ success: true, invite_sent_at: now })
  } catch (err) {
    safeLogger.error('[Admin] Unexpected error in POST /role-assignments/resend-invite', {
      error: err,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
