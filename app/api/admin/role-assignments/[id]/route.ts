import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

/**
 * PATCH /api/admin/role-assignments/[id]
 * Update editable metadata on a role assignment. The role itself can also be
 * updated (which will be re-applied to the linked user, if any). Email cannot
 * be changed; revoke + create a new row instead.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireSuperAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Super admin access required' },
      { status: adminCheck.status }
    )
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Assignment id is required' }, { status: 400 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const updates: Record<string, any> = {}
  if (body.role !== undefined) updates.role = body.role
  if (body.first_name !== undefined) updates.first_name = body.first_name?.trim() || null
  if (body.last_name !== undefined) updates.last_name = body.last_name?.trim() || null
  if (body.institution_id !== undefined) updates.institution_id = body.institution_id || null
  if (body.department_title !== undefined)
    updates.department_title = body.department_title?.trim() || null
  if (body.notes !== undefined) updates.notes = body.notes?.trim() || null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updatable fields supplied' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()

    const { data: updated, error } = await admin
      .from('admin_role_assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !updated) {
      safeLogger.error('[Admin] Failed to update role assignment', { error, id })
      return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
    }

    // If the role changed and we have a linked user, re-sync user_roles + admins.
    if (updates.role && updated.user_id) {
      // user_roles upsert
      await admin
        .from('user_roles')
        .upsert(
          { user_id: updated.user_id, role: updated.role, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )

      // admins table re-sync
      if (updated.role === 'super_admin') {
        await admin.from('admins').delete().eq('user_id', updated.user_id)
        await admin.from('admins').insert({
          user_id: updated.user_id,
          university_id: null,
          role: 'super_admin',
          updated_at: new Date().toISOString(),
        })
      } else {
        const admins_role = updated.role === 'moderator' ? 'moderator' : 'university_admin'
        await admin
          .from('admins')
          .upsert(
            {
              user_id: updated.user_id,
              university_id: updated.institution_id,
              role: admins_role,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,university_id' }
          )
      }
    }

    return NextResponse.json({ success: true, assignment: updated })
  } catch (err) {
    safeLogger.error('[Admin] Unexpected error in PATCH /api/admin/role-assignments/[id]', {
      error: err,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/role-assignments/[id]
 * Revokes the assignment. If a user was linked, downgrades them to 'user'
 * and removes them from the admins table. Prevents removing the last super
 * admin.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireSuperAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Super admin access required' },
      { status: adminCheck.status }
    )
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Assignment id is required' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()

    const { data: assignment } = await admin
      .from('admin_role_assignments')
      .select('id, user_id, role')
      .eq('id', id)
      .maybeSingle()

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Guard: never remove the last super_admin.
    if (assignment.role === 'super_admin' && assignment.user_id) {
      const { count } = await admin
        .from('user_roles')
        .select('user_id', { count: 'exact', head: true })
        .eq('role', 'super_admin')
        .neq('user_id', assignment.user_id)
      if ((count || 0) === 0) {
        return NextResponse.json(
          { error: 'Cannot revoke the last Super Admin' },
          { status: 400 }
        )
      }
    }

    // Downgrade the linked user, if any.
    if (assignment.user_id) {
      await admin
        .from('user_roles')
        .update({ role: 'user', updated_at: new Date().toISOString() })
        .eq('user_id', assignment.user_id)

      await admin.from('admins').delete().eq('user_id', assignment.user_id)
    }

    const { error: delErr } = await admin
      .from('admin_role_assignments')
      .delete()
      .eq('id', id)

    if (delErr) {
      safeLogger.error('[Admin] Failed to delete role assignment', { error: delErr, id })
      return NextResponse.json({ error: 'Failed to revoke assignment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    safeLogger.error('[Admin] Unexpected error in DELETE /api/admin/role-assignments/[id]', {
      error: err,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
