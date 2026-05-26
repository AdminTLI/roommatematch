/**
 * Domu Match - email brand tokens.
 *
 * Single source of truth for colors, URLs, copy, and links used across
 * every email (Supabase Auth HTML templates and app-sent Mailjet emails).
 *
 * Why duplicate hex values from globals.css?
 * Email clients strip <link> and most class-based styles. All design tokens
 * must be inlined as hex/px values; CSS variables are not honored.
 */

export const BRAND = {
  name: 'Domu Match',
  productUrl: 'https://domumatch.com',
  /** Use www — bare domumatch.com 307-redirects and breaks images in email clients + Supabase preview. */
  logoUrl: 'https://www.domumatch.com/images/logo.png',

  /** Long tagline shown across marketing + footer. Per user direction. */
  tagline:
    'The smartest way to find compatible roommates. Science-backed matching for better living.',
  /** Short slogan used on screenshot/legacy verify email. Reserved for tight spaces. */
  sloganShort: 'Built for better living.',

  address: 'Breda, The Netherlands',
  year: new Date().getFullYear(),

  /** From-address text shown in footer ("do not reply to this address"). */
  fromAddress: 'info@domumatch.com',
  /** Public-facing support inbox (mailto + replies). */
  supportEmail: 'domumatch@gmail.com',
} as const

export const COLORS = {
  // Calmer, social-platform palette - lighter shades of the platform purple
  primary: '#7c3aed',
  primaryHover: '#6d28d9',
  primarySoft: '#f5f3ff',
  primarySoftBorder: '#ede9fe',
  primaryInk: '#5b21b6',

  accent: '#db2777',

  page: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  borderSoft: '#eef2f7',

  textHeading: '#0f172a',
  textBody: '#334155',
  textMuted: '#64748b',
  textFaint: '#94a3b8',

  successSoft: '#ecfdf5',
  successInk: '#047857',
  warnSoft: '#fef3c7',
  warnInk: '#92400e',
} as const

export const URLS = {
  home: 'https://domumatch.com',
  helpCenter: 'https://domumatch.com/help-center',
  contact: 'https://domumatch.com/contact',
  privacy: 'https://domumatch.com/privacy',
  terms: 'https://domumatch.com/terms',
  cookies: 'https://domumatch.com/cookies',
  signIn: 'https://domumatch.com/auth/sign-in',
  settings: 'https://domumatch.com/settings',
} as const

export const SOCIAL = {
  linkedin: 'https://linkedin.com/company/domumatch',
  instagram: 'https://www.instagram.com/domumatch',
} as const

/** Web-safe stack only - never @font-face in email. */
export const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

/**
 * Build the public unsubscribe URL for a given user token.
 * The token is opaque (HMAC-signed) and resolved by /api/unsubscribe.
 */
export function buildUnsubscribeUrl(token: string, appUrl?: string): string {
  const base = (appUrl || URLS.home).replace(/\/$/, '')
  return `${base}/unsubscribe?token=${encodeURIComponent(token)}`
}
