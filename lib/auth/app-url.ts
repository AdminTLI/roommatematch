/**
 * Canonical app base URL for auth redirects and email links.
 * Set NEXT_PUBLIC_APP_URL to your production origin (prefer https://www.domumatch.com).
 */
export function getAppBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')

  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_APP_URL is not set. Add it in Vercel/env (e.g. https://www.domumatch.com).'
    )
  }

  return base
}

/** Session key for post-email-verification destination (e.g. host onboarding). */
export const POST_VERIFY_REDIRECT_KEY = 'post-verify-redirect'

/**
 * Only allow same-origin relative paths (open-redirect safe).
 * Rejects protocol-relative URLs, absolute URLs, and auth loops.
 */
export function getSafeAppRedirectPath(
  value: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!value) return fallback
  const path = value.trim()
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return fallback
  }
  if (path.includes('://') || path.toLowerCase().includes('javascript:')) {
    return fallback
  }
  return path
}

/** Server-side OAuth/email callback used by Supabase Auth (PKCE `code` exchange). */
export function getAuthCallbackUrl(redirectPath: string): string {
  return `${getAppBaseUrl()}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`
}

/** Branded invite landing page — verify token_hash in the browser, then continue onboarding. */
export function getAcceptInvitationPath(): string {
  return '/auth/accept-invitation'
}

export function getAcceptInvitationUrl(): string {
  return `${getAppBaseUrl()}${getAcceptInvitationPath()}`
}
