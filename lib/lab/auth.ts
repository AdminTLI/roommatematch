import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/server'

export interface LabUserContext {
  userId: string
  universityId: string
}

export async function getLabUserContext(
  supabase: SupabaseClient,
  userId: string
): Promise<LabUserContext | null> {
  const { data, error } = await supabase
    .from('user_academic')
    .select('university_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data?.university_id) {
    return null
  }

  return { userId, universityId: data.university_id }
}

export async function requireVerifiedStudent(
  supabase: SupabaseClient,
  userId: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('user_id', userId)
    .maybeSingle()

  if (!profile || profile.verification_status !== 'verified') {
    return {
      ok: false,
      status: 403,
      error: 'Verified student account required',
    }
  }

  return { ok: true }
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('email')
    .eq('id', userId)
    .maybeSingle()
  return data?.email ?? null
}
