import { getAuthCallbackUrl } from '@/lib/auth/app-url'

/**
 * Redirect URL for Supabase Auth admin invites (PKCE fallback).
 * Routes invitees through /auth/callback so the session is established,
 * then lands them on institution onboarding.
 */
export function getAdminInviteRedirectUrl(): string {
  return getAuthCallbackUrl('/institution/onboarding')
}
