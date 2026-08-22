import { createAdminClient } from '@/lib/supabase/server'
import { programmaticAvatarUrl } from '@/lib/avatars/programmatic'

const SIGNED_URL_TTL_SECONDS = 3600

export async function signedProfilePictureUrl(storagePath: string): Promise<string | null> {
  const path = storagePath.trim()
  if (!path) return null

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('secure_profile_pics')
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)

  if (error || !data?.signedUrl) return null
  return data.signedUrl
}

export async function resolveUserDisplayAvatarUrl(
  profile: { avatar_id?: string | null; profile_picture_url?: string | null } | null,
  userId: string
): Promise<string> {
  const path = profile?.profile_picture_url?.trim()
  if (path) {
    const signed = await signedProfilePictureUrl(path)
    if (signed) return signed
  }

  return programmaticAvatarUrl(profile?.avatar_id, userId)
}
