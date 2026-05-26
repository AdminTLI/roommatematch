import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserRole, type UserRole } from './roles'
import { safeLogger } from '@/lib/utils/logger'

export interface InstitutionAdminProfile {
  user_id: string
  institution_id: string
  first_name: string
  last_name: string
  job_title: string
  work_email: string
  phone: string | null
  department: string | null
  topics: string[] | null
  notes_for_support: string | null
  contact_consent: boolean
  contact_consent_at: string | null
  privacy_notice_accepted_at: string
  terms_accepted_at: string | null
  onboarding_completed_at: string | null
  created_at: string
  updated_at: string
}

export interface InstitutionAuthResult {
  ok: boolean
  status: number
  user?: { id: string; email?: string }
  role?: UserRole
  institutionId?: string | null
  institutionName?: string | null
  adminProfile?: InstitutionAdminProfile | null
  profileComplete?: boolean
  error?: string
}

const INSTITUTION_SCOPED_ROLES: ReadonlySet<UserRole> = new Set([
  'admin',
  'university_admin',
  'moderator',
])

export function isInstitutionScopedRole(role: UserRole): boolean {
  return INSTITUTION_SCOPED_ROLES.has(role)
}

export function isInstitutionProfileComplete(
  profile: InstitutionAdminProfile | null | undefined
): boolean {
  if (!profile) return false
  return Boolean(
    profile.first_name?.trim() &&
      profile.last_name?.trim() &&
      profile.job_title?.trim() &&
      profile.work_email?.trim() &&
      profile.privacy_notice_accepted_at &&
      profile.onboarding_completed_at
  )
}

/**
 * Resolve institution scope for the current user from admins + assignment tables.
 */
export async function getInstitutionScopeForUser(userId: string): Promise<{
  role: UserRole
  institutionId: string | null
  institutionName: string | null
}> {
  const adminClient = createAdminClient()
  const role = await getUserRole(userId)

  const { data: adminRow } = await adminClient
    .from('admins')
    .select('university_id, role')
    .eq('user_id', userId)
    .maybeSingle()

  let institutionId = adminRow?.university_id ?? null

  if (!institutionId) {
    const { data: assignment } = await adminClient
      .from('admin_role_assignments')
      .select('institution_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()
    institutionId = assignment?.institution_id ?? null
  }

  let institutionName: string | null = null
  if (institutionId) {
    const { data: uni } = await adminClient
      .from('universities')
      .select('name')
      .eq('id', institutionId)
      .maybeSingle()
    institutionName = uni?.name ?? null
  }

  return { role, institutionId, institutionName }
}

/**
 * Verifies the current user can access the institution portal.
 * Requires an elevated role scoped to a single institution (not super_admin-only).
 */
export async function requireInstitutionAdmin(
  request?: NextRequest
): Promise<InstitutionAuthResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, status: 401, error: 'Authentication required' }
  }

  if (!user.email_confirmed_at) {
    return { ok: false, status: 403, error: 'Email verification required' }
  }

  const { role, institutionId, institutionName } = await getInstitutionScopeForUser(user.id)

  if (role === 'super_admin') {
    return {
      ok: false,
      status: 403,
      error: 'Super admins should use the /admin portal',
    }
  }

  if (!isInstitutionScopedRole(role)) {
    return { ok: false, status: 403, error: 'Institution admin access required' }
  }

  if (!institutionId) {
    return {
      ok: false,
      status: 403,
      error: 'No institution is linked to your admin account',
    }
  }

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('institution_admin_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  safeLogger.info('[Institution] Access granted', {
    userId: user.id,
    role,
    institutionId,
    path: request?.nextUrl?.pathname || 'unknown',
  })

  return {
    ok: true,
    status: 200,
    user: { id: user.id, email: user.email },
    role,
    institutionId,
    institutionName,
    adminProfile: (profile as InstitutionAdminProfile | null) ?? null,
    profileComplete: isInstitutionProfileComplete(profile as InstitutionAdminProfile | null),
  }
}

export async function requireInstitutionAdminResponse(
  request: NextRequest
): Promise<NextResponse | null> {
  const result = await requireInstitutionAdmin(request)
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || 'Institution admin access required' },
      { status: result.status }
    )
  }
  return null
}
