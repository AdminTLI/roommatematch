import type { SupabaseClient } from '@supabase/supabase-js'

export type RoleAssignmentRow = {
  status: string
  user_id: string | null
}

/** Pending invites, or active assignments where institution onboarding is not finished. */
export async function canResendInstitutionInvite(
  admin: SupabaseClient,
  assignment: RoleAssignmentRow
): Promise<boolean> {
  if (assignment.status === 'pending') return true
  if (assignment.status === 'revoked') return false
  if (assignment.status !== 'active') return false
  if (!assignment.user_id) return true

  const { data: profile } = await admin
    .from('institution_admin_profiles')
    .select('onboarding_completed_at')
    .eq('user_id', assignment.user_id)
    .maybeSingle()

  return !profile?.onboarding_completed_at
}
