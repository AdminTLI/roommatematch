import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { canResendInstitutionInvite } from '@/lib/auth/institution-invite-eligibility'
import { sendInstitutionAdminInvite } from '@/lib/auth/send-institution-admin-invite'

/**
 * POST /api/admin/role-assignments/resend-invite
 * Body: { id: string }
 * Re-sends the invite for pending assignments, or active assignments that have not
 * finished institution onboarding (e.g. invite link expired after auth user was created).
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
      .select('id, email, status, role, institution_id, first_name, last_name, user_id')
      .eq('id', id)
      .maybeSingle()

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const allowed = await canResendInstitutionInvite(admin, assignment)
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            assignment.status === 'revoked'
              ? 'Cannot resend invite for a revoked assignment'
              : 'This user has already completed institution onboarding',
        },
        { status: 400 }
      )
    }

    const result = await sendInstitutionAdminInvite(admin, assignment.email, {
      invited_role: assignment.role,
      invited_institution_id: assignment.institution_id,
      invited_first_name: assignment.first_name,
      invited_last_name: assignment.last_name,
    })

    if (!result.ok) {
      safeLogger.warn('[Admin] Resend invite failed', { error: result.error, id })
      return NextResponse.json(
        {
          error: result.error || 'Failed to resend invite',
          hint: 'Check Supabase Auth → SMTP settings and redirect URLs. See docs/institution-invite-email-setup.md',
        },
        { status: 500 }
      )
    }

    const now = new Date().toISOString()
    await admin.from('admin_role_assignments').update({ invite_sent_at: now }).eq('id', id)

    return NextResponse.json({
      success: true,
      invite_sent_at: now,
      delivery: result.delivery,
    })
  } catch (err) {
    safeLogger.error('[Admin] Unexpected error in POST /role-assignments/resend-invite', {
      error: err,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
