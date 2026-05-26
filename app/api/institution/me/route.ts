import { NextRequest, NextResponse } from 'next/server'
import { requireInstitutionAdmin } from '@/lib/auth/institution'

/**
 * GET /api/institution/me
 * Returns institution scope + onboarding completion status for the logged-in admin.
 */
export async function GET(request: NextRequest) {
  const result = await requireInstitutionAdmin(request)
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || 'Institution admin access required' },
      { status: result.status }
    )
  }

  return NextResponse.json({
    user_id: result.user!.id,
    email: result.user!.email,
    role: result.role,
    institution_id: result.institutionId,
    institution_name: result.institutionName,
    profile: result.adminProfile,
    profile_complete: result.profileComplete,
  })
}
