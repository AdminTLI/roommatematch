import { createClient } from '@/lib/supabase/server'
import { requireAdmin, type AdminAuthResult } from '@/lib/auth/admin'
import type { NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'

export type AuthGuardResult =
  | { ok: true; user: User }
  | { ok: false; status: 401 | 403; error: string }

/**
 * Require a logged-in user for API routes (use before createAdminClient / service role).
 */
export async function requireAuthenticatedUser(): Promise<AuthGuardResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { ok: false, status: 401, error: 'Authentication required' }
  }

  return { ok: true, user }
}

/**
 * Require admin for API routes.
 */
export async function requireAdminUser(
  request?: NextRequest,
  requireSecret?: boolean
): Promise<AdminAuthResult> {
  return requireAdmin(request, requireSecret)
}

/**
 * Prevent IDOR when a route accepts a user id parameter.
 */
export function assertUserIdMatches(sessionUserId: string, resourceUserId: string): void {
  if (sessionUserId !== resourceUserId) {
    throw new Error('Forbidden')
  }
}
