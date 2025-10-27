import { createClient } from '@/lib/supabase/server'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  email_confirmed_at?: string
}

/**
 * Get user's display name from profile table, falling back to auth metadata
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  const supabase = await createClient()
  
  // Try to get name from profiles table first
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('user_id', userId)
    .maybeSingle()

  if (profile?.first_name) {
    const fullName = profile.last_name 
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : profile.first_name
    return fullName
  }

  // Fallback to auth metadata
  const { data: { user } } = await supabase.auth.getUser()
  return user?.user_metadata?.full_name || 'User'
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
    .select('first_name, last_name')
    .eq('user_id', userId)
    .maybeSingle()

  // Determine display name
  let displayName = 'User'
  if (profile?.first_name) {
    displayName = profile.last_name 
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : profile.first_name
  } else if (user.user_metadata?.full_name) {
    displayName = user.user_metadata.full_name
  }

  return {
    id: user.id,
    email: user.email || '',
    name: displayName,
    avatar: user.user_metadata?.avatar_url,
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
      full_name: fullName
    }
  })

  if (error) {
    console.error('Failed to sync profile name to auth metadata:', error)
  }
}
