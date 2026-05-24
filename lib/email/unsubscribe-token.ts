/**
 * Opaque, HMAC-signed token for one-click email unsubscribe links.
 *
 * Goals:
 * - User can land on /unsubscribe?token=... without being signed in.
 * - The token reveals the user id to the server (so we can fetch + update prefs).
 * - The token cannot be forged or mutated to point at another user.
 *
 * Token shape: base64url(`${userId}.${hmacSha256(userId, SECRET)}`)
 *
 * We deliberately do not include an `exp` claim - unsubscribe links should
 * keep working even if the email is rediscovered months later. If we ever
 * need rotation, bump the secret env var; all old tokens become invalid.
 */

import { createHmac, timingSafeEqual } from 'crypto'

const TOKEN_SEPARATOR = '.'

function getSecret(): string {
  // Fall back to CRON_SECRET so deployments that have not yet provisioned
  // EMAIL_UNSUBSCRIBE_SECRET still work - both are platform-only secrets.
  const secret =
    process.env.EMAIL_UNSUBSCRIBE_SECRET ||
    process.env.CRON_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!secret || typeof secret !== 'string' || secret.length < 16) {
    throw new Error(
      'EMAIL_UNSUBSCRIBE_SECRET (or fallback) is not configured - refusing to sign unsubscribe tokens'
    )
  }
  return secret
}

function b64urlEncode(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function b64urlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(padded, 'base64').toString('utf8')
}

function sign(userId: string, secret: string): string {
  return createHmac('sha256', secret).update(userId).digest('hex')
}

export function createUnsubscribeToken(userId: string): string {
  if (!userId || typeof userId !== 'string') {
    throw new Error('createUnsubscribeToken: userId is required')
  }
  const secret = getSecret()
  const signature = sign(userId, secret)
  return b64urlEncode(`${userId}${TOKEN_SEPARATOR}${signature}`)
}

export interface VerifiedToken {
  userId: string
}

export function verifyUnsubscribeToken(token: string): VerifiedToken | null {
  if (!token || typeof token !== 'string') return null
  try {
    const decoded = b64urlDecode(token)
    const idx = decoded.lastIndexOf(TOKEN_SEPARATOR)
    if (idx <= 0) return null

    const userId = decoded.slice(0, idx)
    const providedSig = decoded.slice(idx + 1)
    if (!userId || !providedSig) return null

    const secret = getSecret()
    const expectedSig = sign(userId, secret)

    // Constant-time compare; reject if lengths differ.
    const a = Buffer.from(providedSig, 'hex')
    const b = Buffer.from(expectedSig, 'hex')
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null

    return { userId }
  } catch {
    return null
  }
}
