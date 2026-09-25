import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Both users must be Persona-verified before chat can open or send messages.
 */
export async function assertBothUsersPersonaVerified(
  admin: SupabaseClient,
  userA: string,
  userB: string
): Promise<{ ok: true } | { ok: false; unverifiedUserIds: string[] }> {
  const ids = [userA, userB]
  const [{ data: profiles }, { data: users }] = await Promise.all([
    admin.from('profiles').select('user_id, verification_status').in('user_id', ids),
    admin.from('users').select('id, identity_verified_at').in('id', ids),
  ])

  const verified = new Set<string>()
  for (const p of profiles || []) {
    if (p.verification_status === 'verified') verified.add(p.user_id)
  }
  for (const u of users || []) {
    if (u.identity_verified_at) verified.add(u.id)
  }

  const unverifiedUserIds = ids.filter((id) => !verified.has(id))
  if (unverifiedUserIds.length > 0) {
    return { ok: false, unverifiedUserIds }
  }
  return { ok: true }
}
