/**
 * CSRF Protection Utility
 * Generates and validates CSRF tokens for state-changing requests
 */

import { randomBytes, createHmac } from 'crypto'

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXT_PUBLIC_SUPABASE_URL || 'default-secret-change-in-production'
const CSRF_TOKEN_COOKIE = 'csrf-token'
const CSRF_HEADER = 'x-csrf-token'

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  const token = randomBytes(32).toString('hex')
  return token
}

/**
 * Create a signed CSRF token
 */
export function createSignedToken(token: string): string {
  const hmac = createHmac('sha256', CSRF_SECRET)
  hmac.update(token)
  const signature = hmac.digest('hex')
  return `${token}.${signature}`
}

/**
 * Verify a signed CSRF token
 */
export function verifySignedToken(signedToken: string): boolean {
  try {
    const [token, signature] = signedToken.split('.')
    if (!token || !signature) return false

    const hmac = createHmac('sha256', CSRF_SECRET)
    hmac.update(token)
    const expectedSignature = hmac.digest('hex')

    // Use timing-safe comparison
    if (signature.length !== expectedSignature.length) return false
    
    let result = 0
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
    }
    
    return result === 0
  } catch {
    return false
  }
}

/**
 * Get CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  return request.headers.get(CSRF_HEADER) || null
}

/**
 * Validate CSRF token from request
 * Checks both cookie and header token match
 */
export async function validateCSRFToken(request: Request): Promise<boolean> {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  const method = request.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true
  }

  // Get token from header
  const headerToken = getCSRFTokenFromRequest(request)
  if (!headerToken) {
    return false
  }

  // Get token from cookie
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    if (key && value) acc[key] = value
    return acc
  }, {} as Record<string, string>)

  const cookieToken = cookies[CSRF_TOKEN_COOKIE]
  if (!cookieToken) {
    return false
  }

  // Verify both tokens are valid and match
  if (!verifySignedToken(headerToken) || !verifySignedToken(cookieToken)) {
    return false
  }

  // Extract token part (without signature) and compare
  const headerTokenPart = headerToken.split('.')[0]
  const cookieTokenPart = cookieToken.split('.')[0]

  // Timing-safe comparison
  if (headerTokenPart.length !== cookieTokenPart.length) return false
  
  let result = 0
  for (let i = 0; i < headerTokenPart.length; i++) {
    result |= headerTokenPart.charCodeAt(i) ^ cookieTokenPart.charCodeAt(i)
  }

  return result === 0
}

/**
 * Create CSRF token cookie value
 * Returns both httpOnly cookie (for validation) and exposed token (for client to read)
 */
export function createCSRFTokenCookie(): { 
  httpOnlyCookie: { name: string; value: string; options: { httpOnly: boolean; secure: boolean; sameSite: 'strict' | 'lax' | 'none'; maxAge: number } },
  exposedToken: string
} {
  const token = generateCSRFToken()
  const signedToken = createSignedToken(token)
  
  return {
    httpOnlyCookie: {
      name: CSRF_TOKEN_COOKIE,
      value: signedToken,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      }
    },
    exposedToken: signedToken // Client can read this to send in header
  }
}

