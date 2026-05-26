import { createAdminClient } from '@/lib/supabase/server'

// Client-safe constants/types live in `./role-constants` so client
// components can import them without dragging in next/headers transitively.
export { ELEVATED_ROLES, ROLE_LABELS } from './role-constants'
export type { UserRole } from './role-constants'
import type { UserRole } from './role-constants'

/**
 * Get a user's role from the database
 * Returns 'user' as default if no role is found
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  let role: UserRole = 'user'
  if (!error && data?.role) {
    role = data.role as UserRole
  }

  // Legacy installs may only have elevated access on `admins` (see assign-super-admin.sql).
  if (role !== 'super_admin') {
    const { data: adminRow } = await adminClient
      .from('admins')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    if (adminRow?.role === 'super_admin') {
      return 'super_admin'
    }
    if (role === 'user' && adminRow?.role === 'university_admin') {
      return 'university_admin'
    }
    if (role === 'user' && adminRow?.role === 'moderator') {
      return 'moderator'
    }
  }

  return role
}

/**
 * Check if a user is a super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'super_admin'
}

/**
 * Check if a user is an admin (includes super admin)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin' || role === 'super_admin' || role === 'moderator' || role === 'university_admin'
}

/**
 * Check if a user can assign a specific role
 * Only super admins can assign roles
 */
export async function canAssignRole(assignerId: string, targetRole: UserRole): Promise<boolean> {
  // Only super admins can assign roles
  const assignerIsSuperAdmin = await isSuperAdmin(assignerId)
  
  if (!assignerIsSuperAdmin) {
    return false
  }

  // Super admins can assign any elevated role
  return (
    targetRole === 'admin' ||
    targetRole === 'super_admin' ||
    targetRole === 'moderator' ||
    targetRole === 'university_admin'
  )
}

