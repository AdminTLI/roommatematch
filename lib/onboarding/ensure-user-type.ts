import type { User } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/service'
import { isUserType, type UserType } from '@/types/profile'

export type UserCohortRow = {
  user_type: UserType | null
  is_verified_student: boolean
}

/**
 * Reads cohort from public.users. If missing, backfills from auth user_metadata
 * (set at sign-up) so post-verify routing can skip /onboarding/path.
 */
export async function ensureUserTypeFromAuthMetadata(
  user: User
): Promise<UserCohortRow> {
  const service = createServiceClient()
  const { data: userRow, error } = await service
    .from('users')
    .select('user_type, is_verified_student')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[ensureUserTypeFromAuthMetadata] users select error:', error.message ?? error)
  }

  const existingType =
    userRow?.user_type === 'student' || userRow?.user_type === 'professional'
      ? userRow.user_type
      : null

  if (existingType) {
    return {
      user_type: existingType,
      is_verified_student: userRow?.is_verified_student === true,
    }
  }

  const metaType = user.user_metadata?.user_type
  if (!isUserType(metaType)) {
    return {
      user_type: null,
      is_verified_student: userRow?.is_verified_student === true,
    }
  }

  const { error: updateError } = await service
    .from('users')
    .update({
      user_type: metaType,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .is('user_type', null)

  if (updateError) {
    console.error(
      '[ensureUserTypeFromAuthMetadata] users update error:',
      updateError.message ?? updateError
    )
  }

  return {
    user_type: metaType,
    is_verified_student: userRow?.is_verified_student === true,
  }
}

/** Next onboarding URL given a known cohort. Falls back to path when unset. */
export function getCohortOnboardingPath(
  userType: UserType | null,
  options?: { isVerifiedStudent?: boolean; preferAcademicGate?: boolean }
): string {
  if (!userType) return '/onboarding/path'
  if (userType === 'professional') return '/onboarding-professional/welcome'
  if (options?.preferAcademicGate && !options.isVerifiedStudent) {
    return '/onboarding/path'
  }
  return '/onboarding/welcome'
}
