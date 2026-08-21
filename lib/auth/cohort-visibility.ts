/**
 * Cohort visibility: profile and settings data is only visible to users of the same role
 * (student vs professional). Used when exposing another user's profile in matches, chat, etc.
 */

import { createServiceClient } from '@/lib/supabase/service'

export type UserType = 'student' | 'professional' | null

/**
 * Returns user_type for a user (from profiles then users table).
 */
export async function getUserType(userId: string): Promise<UserType> {
  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('user_type')
    .eq('user_id', userId)
    .maybeSingle()
  if (profile?.user_type === 'student' || profile?.user_type === 'professional') {
    return profile.user_type as UserType
  }
  const { data: userRow } = await service
    .from('users')
    .select('user_type')
    .eq('id', userId)
    .maybeSingle()
  if (userRow?.user_type === 'student' || userRow?.user_type === 'professional') {
    return userRow.user_type as UserType
  }
  return null
}

/**
 * Returns true when users are in the same cohort, or when either cohort is unknown.
 * Only blocks when both have a known type and they differ (student vs professional).
 * Used to gate profile/settings visibility across matches and chat.
 */
export async function canViewCohortProfile(viewerUserId: string, targetUserId: string): Promise<boolean> {
  if (viewerUserId === targetUserId) return true
  const [viewerType, targetType] = await Promise.all([
    getUserType(viewerUserId),
    getUserType(targetUserId),
  ])
  // Legacy / incomplete profiles often lack user_type; don't block chat partners for that.
  if (viewerType == null || targetType == null) return true
  return viewerType === targetType
}
