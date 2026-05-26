import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import type { UserRole } from '@/lib/auth/roles'
import { getAdminInviteRedirectUrl } from '@/lib/auth/institution-invite'

const ALLOWED_ROLES: ReadonlyArray<Exclude<UserRole, 'user'>> = [
  'admin',
  'super_admin',
  'moderator',
  'university_admin',
]

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * GET /api/admin/role-assignments
 * List every role assignment manually created by a Super Admin.
 */
export async function GET(request: NextRequest) {
  const adminCheck = await requireSuperAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Super admin access required' },
      { status: adminCheck.status }
    )
  }

  try {
    const admin = createAdminClient()

    const { data: assignments, error } = await admin
      .from('admin_role_assignments')
      .select(
        `
        id,
        email,
        role,
        user_id,
        first_name,
        last_name,
        institution_id,
        department_title,
        notes,
        status,
        invite_sent_at,
        activated_at,
        created_at,
        updated_at,
        universities:institution_id ( id, name )
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      safeLogger.error('[Admin] Failed to fetch role assignments', { error })
      return NextResponse.json({ error: 'Failed to load role assignments' }, { status: 500 })
    }

    const formatted = (assignments || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      role: row.role as UserRole,
      user_id: row.user_id,
      first_name: row.first_name,
      last_name: row.last_name,
      institution_id: row.institution_id,
      institution_name: row.universities?.name || null,
      department_title: row.department_title,
      notes: row.notes,
      status: row.status,
      invite_sent_at: row.invite_sent_at,
      activated_at: row.activated_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    return NextResponse.json({ assignments: formatted })
  } catch (err) {
    safeLogger.error('[Admin] Unexpected error in GET /api/admin/role-assignments', { error: err })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/role-assignments
 * Create a new role assignment for an email. Behavior:
 *  - If the email matches an existing auth user → reject (409).
 *  - If not → mark pending and send a Supabase Auth invite.
 *    A DB trigger will auto-promote the assignment as soon as the user signs
 *    up or confirms their email.
 *
 * Body: {
 *   email: string,
 *   role: 'admin' | 'super_admin' | 'moderator' | 'university_admin',
 *   first_name?: string,
 *   last_name?: string,
 *   institution_id?: string | null,
 *   department_title?: string,
 *   notes?: string,
 *   send_invite?: boolean (defaults to true when email is not registered)
 * }
 */
export async function POST(request: NextRequest) {
  const adminCheck = await requireSuperAdmin(request, false)
  if (!adminCheck.ok || !adminCheck.user) {
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

  const email = String(body?.email || '').trim()
  const role = body?.role as UserRole | undefined
  const firstName = body?.first_name ? String(body.first_name).trim() : null
  const lastName = body?.last_name ? String(body.last_name).trim() : null
  const institutionId = body?.institution_id || null
  const departmentTitle = body?.department_title ? String(body.department_title).trim() : null
  const notes = body?.notes ? String(body.notes).trim() : null
  const sendInvite = body?.send_invite !== false // default to true

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }
  if (!role || !ALLOWED_ROLES.includes(role as any)) {
    return NextResponse.json(
      { error: `Role must be one of: ${ALLOWED_ROLES.join(', ')}` },
      { status: 400 }
    )
  }
  if ((role === 'admin' || role === 'university_admin') && !institutionId) {
    return NextResponse.json(
      { error: 'Institution is required for Admin and University Admin roles' },
      { status: 400 }
    )
  }

  try {
    const admin = createAdminClient()
    const normalizedEmail = email.toLowerCase()

    // Reject duplicates up front so the unique index doesn't surface as a 500.
    const { data: existing } = await admin
      .from('admin_role_assignments')
      .select('id')
      .eq('email_normalized', normalizedEmail)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        {
          error:
            'An assignment for this email already exists. Edit or revoke it from the table instead of re-adding.',
        },
        { status: 409 }
      )
    }

    // Reject if email already belongs to a registered platform user.
    {
      const { data: usersPage, error: listError } =
        await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
      if (listError) {
        safeLogger.warn('[Admin] Failed to list auth users while resolving email', {
          error: listError,
        })
      } else {
        const match = usersPage?.users?.find((u) => (u.email || '').toLowerCase() === normalizedEmail)
        if (match) {
          return NextResponse.json(
            {
              error:
                'This email already belongs to an existing platform account. Invite a different email address.',
            },
            { status: 409 }
          )
        }
      }
    }

    // Insert the assignment row.
    const insertRow = {
      email,
      role,
      user_id: null,
      first_name: firstName,
      last_name: lastName,
      institution_id: institutionId,
      department_title: departmentTitle,
      notes,
      status: 'pending',
      activated_at: null,
      assigned_by: adminCheck.user.id,
    } as Record<string, any>

    const { data: created, error: insertError } = await admin
      .from('admin_role_assignments')
      .insert(insertRow)
      .select()
      .single()

    if (insertError || !created) {
      safeLogger.error('[Admin] Failed to insert admin_role_assignments row', {
        error: insertError,
        email: normalizedEmail,
      })
      return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
    }

    // Optionally send a Supabase Auth invite for pending assignments.
    let inviteSentAt: string | null = null
    let inviteErrorMessage: string | null = null
    if (sendInvite) {
      try {
        const redirectTo = getAdminInviteRedirectUrl()
        const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
          redirectTo,
          data: {
            invited_role: role,
            invited_institution_id: institutionId,
            invited_first_name: firstName,
            invited_last_name: lastName,
          },
        })
        if (inviteError) {
          inviteErrorMessage = inviteError.message
          safeLogger.warn('[Admin] Supabase Auth invite failed; assignment remains pending', {
            error: inviteError,
            email: normalizedEmail,
            redirectTo,
          })
        } else {
          inviteSentAt = new Date().toISOString()
          await admin
            .from('admin_role_assignments')
            .update({ invite_sent_at: inviteSentAt })
            .eq('id', created.id)
        }
      } catch (redirectErr) {
        inviteErrorMessage =
          redirectErr instanceof Error ? redirectErr.message : 'Invalid invite redirect URL'
        safeLogger.warn('[Admin] Invite redirect URL misconfigured', {
          error: redirectErr,
          email: normalizedEmail,
        })
      }
    }

    safeLogger.info('[Admin] Role assignment created', {
      assignmentId: created.id,
      role,
      status: insertRow.status,
      inviteSent: !!inviteSentAt,
      inviteError: inviteErrorMessage,
    })

    return NextResponse.json({
      success: true,
      invite_sent: !!inviteSentAt,
      invite_error: inviteErrorMessage,
      assignment: { ...created, invite_sent_at: inviteSentAt ?? created.invite_sent_at },
    })
  } catch (err) {
    safeLogger.error('[Admin] Unexpected error in POST /api/admin/role-assignments', { error: err })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
