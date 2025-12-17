import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { getUserRole, isSuperAdmin, type UserRole } from './roles'
import { sanitizeEmail, sanitizeUserId } from '@/lib/utils/sanitize-logs'

export interface AdminAuthResult {
  ok: boolean
  status: number
  user?: { id: string; email?: string }
  adminRecord?: { role: UserRole; university_id: string | null }
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

  // Check user role from user_roles table
  const userRole = await getUserRole(user.id)
  
  // Only admin and super_admin roles have admin access
  if (userRole !== 'admin' && userRole !== 'super_admin') {
    return {
      ok: false,
      status: 403,
      error: 'Admin access required'
    }
  }

  // Get admin record for university_id (may be null for super admins)
  const adminClient = createAdminClient()
  const { data: adminRecord } = await adminClient
    .from('admins')
    .select('university_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const universityId = adminRecord?.university_id || null

  // Validate shared secret from environment variable
  // This provides an additional layer of security for sensitive admin operations
  // Default behavior: always require secret in production, optional in development
  const shouldRequireSecret = requireSecret !== undefined 
    ? requireSecret 
    : (process.env.NODE_ENV === 'production')
  
  if (shouldRequireSecret && request) {
    // Strict enforcement: if secret is required, ADMIN_SHARED_SECRET must be set and provided
    if (!process.env.ADMIN_SHARED_SECRET) {
      safeLogger.error('[Admin] CRITICAL: Admin shared secret not configured in production! Admin access temporarily unavailable.')
      return {
        ok: false,
        status: 503, // Service Unavailable - better than 500 for missing configuration
        error: 'Admin access temporarily unavailable. Please contact support if this problem persists.'
      }
    }
    
    // Require the secret to be provided in the request header
    const providedSecret = request.headers.get('x-admin-secret')
    if (!providedSecret) {
      safeLogger.warn('[Admin] Admin access attempted without secret', {
        userId: sanitizeUserId(user.id),
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
        userId: sanitizeUserId(user.id),
        path: request.nextUrl?.pathname || 'unknown'
      })
      return {
        ok: false,
        status: 403,
        error: 'Invalid admin secret'
      }
    }
  }

  // Audit log successful admin access (sanitized)
  safeLogger.info('[Admin] Admin access granted', {
    userId: sanitizeUserId(user.id),
    email: sanitizeEmail(user.email),
    role: userRole,
    universityId: universityId,
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
      role: userRole,
      university_id: universityId
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
 * Verifies that the current user is a super admin
 * 
 * @param request - The Next.js request object (optional, for logging)
 * @param requireSecret - Whether to require the x-admin-secret header. Defaults to false.
 * @returns AdminAuthResult with authentication status
 */
export async function requireSuperAdmin(request?: NextRequest, requireSecret: boolean = false): Promise<AdminAuthResult> {
  const result = await requireAdmin(request, requireSecret)
  
  if (!result.ok) {
    return result
  }

  // Check if user is super admin
  if (result.user && !(await isSuperAdmin(result.user.id))) {
    return {
      ok: false,
      status: 403,
      error: 'Super admin access required'
    }
  }

  return result
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

