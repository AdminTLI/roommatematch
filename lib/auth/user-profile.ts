import { resolveUserDisplayAvatarUrl } from '@/lib/avatars/resolve-user-avatar'
import { createClient } from '@/lib/supabase/server'
import {
  isPlaceholderFirstName,
  resolveStoredProfileName,
} from '@/lib/auth/identity-name'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  email_confirmed_at?: string
}

async function repairPlaceholderProfileName(
  userId: string,
  email: string | null | undefined,
  profile: { first_name?: string | null; last_name?: string | null } | null,
  userMetadata: Record<string, unknown>
) {
  const resolved = resolveStoredProfileName(profile, {
    email,
    user_metadata: userMetadata,
  })
  if (!profile || !resolved.firstName) return resolved

  const storedFirstIsPlaceholder = isPlaceholderFirstName(profile?.first_name, email)
  const storedLastMissing = !profile?.last_name?.trim() && !!resolved.lastName
  if (!storedFirstIsPlaceholder && !storedLastMissing) return resolved

  const supabase = await createClient()
  const updates: { first_name: string; last_name?: string; updated_at: string } = {
    first_name: resolved.firstName,
    updated_at: new Date().toISOString(),
  }
  if (resolved.lastName) updates.last_name = resolved.lastName

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to repair placeholder profile name:', error)
  }

  return resolved
}

/**
 * Get user's display name from profile table, falling back to auth metadata
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  const supabase = await createClient()

  const [{ data: profile }, { data: { user } }] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ])

  const resolved = resolveStoredProfileName(profile, {
    email: user?.email,
    user_metadata: (user?.user_metadata || {}) as Record<string, unknown>,
  })

  return resolved.displayName
}

/**
 * Get complete user profile with display name
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  // Get auth user data
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return null
  }

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_id, profile_picture_url')
    .eq('user_id', userId)
    .maybeSingle()

  const resolved = await repairPlaceholderProfileName(
    userId,
    user.email,
    profile,
    (user.user_metadata || {}) as Record<string, unknown>
  )

  const avatar = await resolveUserDisplayAvatarUrl(profile, userId)

  return {
    id: user.id,
    email: user.email || '',
    name: resolved.displayName,
    avatar,
    email_confirmed_at: user.email_confirmed_at
  }
}

/**
 * Update auth metadata when profile name changes
 */
export async function syncProfileNameToAuth(userId: string, firstName: string, lastName?: string): Promise<void> {
  const supabase = await createClient()
  
  const fullName = lastName ? `${firstName} ${lastName}`.trim() : firstName
  
  // Update auth metadata
  const { error } = await supabase.auth.updateUser({
    data: {
      // Keep both naming schemes in sync since different parts of the app
      // read from different metadata keys.
      full_name: fullName,
      first_name: firstName,
      last_name: lastName || null
    }
  })

  if (error) {
    console.error('Failed to sync profile name to auth metadata:', error)
  }
}
