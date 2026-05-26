/**
 * Redirect URL for Supabase Auth admin invites.
 * Routes invitees through /auth/callback so the session is established,
 * then lands them on institution onboarding.
 */
export function getAdminInviteRedirectUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_APP_URL is not set. Add it to .env.local (e.g. http://localhost:3000) so invite links redirect correctly.'
    )
  }
  const redirect = encodeURIComponent('/institution/onboarding')
  return `${base}/auth/callback?redirect=${redirect}`
}
