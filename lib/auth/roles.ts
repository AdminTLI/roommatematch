import { createAdminClient } from '@/lib/supabase/server'

export type UserRole = 'user' | 'admin' | 'super_admin'

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

  if (error || !data) {
    // Default to 'user' if no role found
    return 'user'
  }

  return data.role as UserRole
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
  return role === 'admin' || role === 'super_admin'
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

  // Super admins can assign both 'admin' and 'super_admin' roles
  return targetRole === 'admin' || targetRole === 'super_admin'
}

