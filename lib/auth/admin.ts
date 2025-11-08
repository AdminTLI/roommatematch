import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'

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
 * @param request - The Next.js request object (optional, for shared secret check and logging)
 * @param requireSecret - Whether to require the x-admin-secret header. Defaults to true if request is provided, false otherwise.
 * @returns AdminAuthResult with authentication status
 */
export async function requireAdmin(request?: NextRequest, requireSecret?: boolean): Promise<AdminAuthResult> {
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

  // Validate shared secret from environment variable
  // This provides an additional layer of security for sensitive admin operations
  // Default behavior: if request is provided and requireSecret is undefined, require secret (backward compatible)
  const shouldRequireSecret = requireSecret !== undefined ? requireSecret : (request !== undefined)
  
  if (shouldRequireSecret && request) {
    // Strict enforcement: if secret is required, ADMIN_SHARED_SECRET must be set and provided
    if (!process.env.ADMIN_SHARED_SECRET) {
      safeLogger.error('[Admin] Admin shared secret not configured')
      return {
        ok: false,
        status: 500,
        error: 'Admin shared secret not configured'
      }
    }
    
    // Require the secret to be provided in the request header
    const providedSecret = request.headers.get('x-admin-secret')
    if (!providedSecret) {
      safeLogger.warn('[Admin] Admin access attempted without secret', {
        userId: user.id,
        path: request.nextUrl?.pathname || 'unknown'
      })
      return {
        ok: false,
        status: 403,
        error: 'Admin secret required'
      }
    }
    
    // Verify the provided secret matches
    if (providedSecret !== process.env.ADMIN_SHARED_SECRET) {
      safeLogger.warn('[Admin] Invalid admin secret provided', {
        userId: user.id,
        path: request.nextUrl?.pathname || 'unknown'
      })
      return {
        ok: false,
        status: 403,
        error: 'Invalid admin secret'
      }
    }
  }

  // Audit log successful admin access
  safeLogger.info('[Admin] Admin access granted', {
    userId: user.id,
    role: adminRecord.role,
    universityId: adminRecord.university_id,
    path: request?.nextUrl?.pathname || 'unknown',
    method: request?.method || 'unknown'
  })

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
  const result = await requireAdmin(request, requireSecret)
  
  if (!result.ok) {
    // Audit log failed admin access attempt
    safeLogger.warn('[Admin] Admin access denied', {
      error: result.error,
      status: result.status,
      path: request.nextUrl?.pathname || 'unknown',
      method: request.method || 'unknown'
    })
    return NextResponse.json(
      { error: result.error || 'Admin access required' },
      { status: result.status }
    )
  }
  
  return null
}

/**
 * Audit log admin action
 */
export function logAdminAction(
  action: string,
  details: Record<string, any>,
  adminUserId: string,
  adminRole?: string
): void {
  safeLogger.info('[Admin] Admin action', {
    action,
    adminUserId,
    adminRole,
    ...details,
    timestamp: new Date().toISOString()
  })
}

