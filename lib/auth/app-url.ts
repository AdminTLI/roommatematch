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
