import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export interface AdminAuthResult {
  ok: boolean
  status: number
  user?: { id: string; email?: string }
  adminRecord?: { role: string; university_id: string }
  error?: string
}

/**
 * Verifies that the current user is an admin by checking the admins table.
 * Optionally validates a shared secret from request headers for additional security.
 * 
 * @param request - The Next.js request object (optional, for shared secret check)
 * @returns AdminAuthResult with authentication status
 */
export async function requireAdmin(request?: NextRequest): Promise<AdminAuthResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      ok: false,
      status: 401,
      error: 'Authentication required'
    }
  }

  // Check if user is verified
  if (!user.email_confirmed_at) {
    return {
      ok: false,
      status: 403,
      error: 'Email verification required'
    }
  }

  // Check admin record in database
  const { data: adminRecord, error: adminError } = await supabase
    .from('admins')
    .select('role, university_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !adminRecord) {
    return {
      ok: false,
      status: 403,
      error: 'Admin access required'
    }
  }

  // Optional: Validate shared secret from environment variable
  // This provides an additional layer of security for sensitive admin operations
  if (request && process.env.ADMIN_SHARED_SECRET) {
    const providedSecret = request.headers.get('x-admin-secret')
    if (providedSecret !== process.env.ADMIN_SHARED_SECRET) {
      return {
        ok: false,
        status: 403,
        error: 'Invalid admin secret'
      }
    }
  }

  return {
    ok: true,
    status: 200,
    user: {
      id: user.id,
      email: user.email
    },
    adminRecord: {
      role: adminRecord.role,
      university_id: adminRecord.university_id
    }
  }
}

/**
 * Middleware helper that returns a 401/403 response if admin check fails
 */
export async function requireAdminResponse(
  request: NextRequest,
  requireSecret: boolean = false
): Promise<NextResponse | null> {
  const result = await requireAdmin(requireSecret ? request : undefined)
  
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || 'Admin access required' },
      { status: result.status }
    )
  }
  
  return null
}

