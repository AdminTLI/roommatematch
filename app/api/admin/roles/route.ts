import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserRole, canAssignRole, type UserRole } from '@/lib/auth/roles'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/admin/roles
 * List all users with their roles (Super Admin only)
 * Role information is filtered/hidden for security
 */
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireSuperAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Super admin access required' },
        { status: adminCheck.status }
      )
    }

    const adminClient = createAdminClient()
    
    // Fetch all users with their roles
    // Only return minimal information for security
    const { data: users, error: usersError } = await adminClient
      .from('users')
      .select(`
        id,
        email,
        created_at,
        is_active,
        user_roles (
          role
        )
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      safeLogger.error('[Admin] Error fetching users with roles', { error: usersError })
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Format response - hide sensitive information
    const formattedUsers = users?.map(user => ({
      id: user.id,
      email: user.email,
      role: (user.user_roles as any)?.[0]?.role || 'user',
      created_at: user.created_at,
      is_active: user.is_active
    })) || []

    return NextResponse.json({ users: formattedUsers })

  } catch (error) {
    safeLogger.error('[Admin] Error in GET /api/admin/roles', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/roles
 * Assign a role to a user (Super Admin only)
 * Body: { userId: string, role: 'admin' | 'super_admin' }
 */
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireSuperAdmin(request, false)
    
    if (!adminCheck.ok || !adminCheck.user) {
      return NextResponse.json(
        { error: adminCheck.error || 'Super admin access required' },
        { status: adminCheck.status }
      )
    }

    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (role !== 'admin' && role !== 'super_admin' && role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "user", "admin", or "super_admin"' },
        { status: 400 }
      )
    }

    // Check if assigner can assign this role
    const canAssign = await canAssignRole(adminCheck.user.id, role as UserRole)
    if (!canAssign && role !== 'user') {
      return NextResponse.json(
        { error: 'You do not have permission to assign this role' },
        { status: 403 }
      )
    }

    // Prevent removing the last super admin
    if (role !== 'super_admin') {
      const currentRole = await getUserRole(userId)
      if (currentRole === 'super_admin') {
        // Check if there are other super admins
        const adminClient = createAdminClient()
        const { count } = await adminClient
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'super_admin')
          .neq('user_id', userId)

        if ((count || 0) === 0) {
          return NextResponse.json(
            { error: 'Cannot remove the last super admin' },
            { status: 400 }
          )
        }
      }
    }

    const adminClient = createAdminClient()

    // Update or insert role
    const { data, error } = await adminClient
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      safeLogger.error('[Admin] Error assigning role', { error, userId, role })
      return NextResponse.json(
        { error: 'Failed to assign role' },
        { status: 500 }
      )
    }

    // If assigning admin or super_admin role, also ensure they have an entry in admins table
    if (role === 'admin' || role === 'super_admin') {
      // Check if user has a profile to get university_id
      const { data: profile } = await adminClient
        .from('profiles')
        .select('university_id')
        .eq('user_id', userId)
        .maybeSingle()

      // For super admin, university_id must be NULL
      // For regular admin, we need a university_id (use profile's university or require it)
      const universityId = role === 'super_admin' ? null : (profile?.university_id || null)

      if (role === 'super_admin') {
        // For super admin: delete any existing admin records and insert one with NULL university_id
        await adminClient
          .from('admins')
          .delete()
          .eq('user_id', userId)

        await adminClient
          .from('admins')
          .insert({
            user_id: userId,
            university_id: null,
            role: 'super_admin',
            updated_at: new Date().toISOString()
          })
      } else if (role === 'admin' && universityId) {
        // For regular admin: upsert with specific university_id
        await adminClient
          .from('admins')
          .upsert({
            user_id: userId,
            university_id: universityId,
            role: 'university_admin',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,university_id'
          })
      } else if (role === 'admin' && !universityId) {
        // Admin role requires a university_id - if user doesn't have a profile with university, we can't assign admin
        safeLogger.warn('[Admin] Cannot assign admin role - user has no university', { userId })
        // Note: We still update the user_roles table, but don't create admin record
        // This is a data inconsistency that should be resolved by assigning a university to the user's profile
      }
    } else if (role === 'user') {
      // Remove from admins table if downgrading to user
      await adminClient
        .from('admins')
        .delete()
        .eq('user_id', userId)
    }

    // Audit log
    safeLogger.info('[Admin] Role assigned', {
      assignerId: adminCheck.user.id,
      targetUserId: userId,
      role,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        role: role
      }
    })

  } catch (error) {
    safeLogger.error('[Admin] Error in POST /api/admin/roles', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/roles
 * Remove admin/super_admin role from a user (downgrade to user)
 * Query params: userId
 */
export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireSuperAdmin(request, false)
    
    if (!adminCheck.ok || !adminCheck.user) {
      return NextResponse.json(
        { error: adminCheck.error || 'Super admin access required' },
        { status: adminCheck.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    // Prevent removing the last super admin
    const currentRole = await getUserRole(userId)
    if (currentRole === 'super_admin') {
      const adminClient = createAdminClient()
      const { count } = await adminClient
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'super_admin')
        .neq('user_id', userId)

      if ((count || 0) === 0) {
        return NextResponse.json(
          { error: 'Cannot remove the last super admin' },
          { status: 400 }
        )
      }
    }

    const adminClient = createAdminClient()

    // Update role to 'user'
    const { error: updateError } = await adminClient
      .from('user_roles')
      .update({ role: 'user', updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    if (updateError) {
      safeLogger.error('[Admin] Error removing role', { error: updateError, userId })
      return NextResponse.json(
        { error: 'Failed to remove role' },
        { status: 500 }
      )
    }

    // Remove from admins table
    await adminClient
      .from('admins')
      .delete()
      .eq('user_id', userId)

    // Audit log
    safeLogger.info('[Admin] Role removed', {
      assignerId: adminCheck.user.id,
      targetUserId: userId,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Role removed successfully'
    })

  } catch (error) {
    safeLogger.error('[Admin] Error in DELETE /api/admin/roles', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

