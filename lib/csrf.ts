/**
 * CSRF Protection Utility
 * Generates and validates CSRF tokens for state-changing requests
 * Uses Web Crypto API for Edge runtime compatibility
 */

// Require CSRF_SECRET in all environments - no fallback allowed
// This prevents CSRF token forgery even in development or misconfigured environments
let CSRF_SECRET: string = process.env.CSRF_SECRET || ''
if (!CSRF_SECRET) {
  throw new Error(
    'CSRF_SECRET environment variable is required. ' +
    'Generate a secure random string (e.g., openssl rand -hex 32). ' +
    'Set it in your .env.local for development and environment variables for production. ' +
    'Without this secret, CSRF tokens can be forged by attackers.'
  )
}

const CSRF_TOKEN_COOKIE = 'csrf-token'
const CSRF_HEADER = 'x-csrf-token'

/**
 * Generate a CSRF token using Web Crypto API (Edge-compatible)
 */
export function generateCSRFToken(): string {
  // Generate 32 random bytes using Web Crypto API
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  
  // Convert to hex string
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Create a signed CSRF token using Web Crypto API
 */
export async function createSignedToken(token: string): Promise<string> {
  // Import secret as a key for HMAC
  const encoder = new TextEncoder()
  const keyData = encoder.encode(CSRF_SECRET)
  const tokenData = encoder.encode(token)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  // Sign the token
  const signature = await crypto.subtle.sign('HMAC', key, tokenData)
  
  // Convert signature to hex string
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return `${token}.${signatureHex}`
}

/**
 * Verify a signed CSRF token using Web Crypto API
 */
export async function verifySignedToken(signedToken: string): Promise<boolean> {
  try {
    const [token, signature] = signedToken.split('.')
    if (!token || !signature) return false

    // Import secret as a key for HMAC
    const encoder = new TextEncoder()
    const keyData = encoder.encode(CSRF_SECRET)
    const tokenData = encoder.encode(token)
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    // Sign the token to get expected signature
    const expectedSignature = await crypto.subtle.sign('HMAC', key, tokenData)
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Use timing-safe comparison
    if (signature.length !== expectedSignatureHex.length) return false
    
    let result = 0
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignatureHex.charCodeAt(i)
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
 * Supports both standard Request and NextRequest
 */
export async function validateCSRFToken(request: Request | { cookies: { get: (name: string) => { value: string } | undefined }, headers: Headers, method: string }): Promise<boolean> {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  const method = request.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true
  }

  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER)
  if (!headerToken) {
    return false
  }

  // Get token from cookie - prefer NextRequest cookies API if available
  let cookieToken: string | undefined
  
  // Check if this is a NextRequest with cookies API
  if ('cookies' in request && typeof request.cookies.get === 'function') {
    const cookie = request.cookies.get(CSRF_TOKEN_COOKIE)
    cookieToken = cookie?.value
  } else {
    // Fallback to manual cookie parsing for standard Request
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) acc[key] = value
      return acc
    }, {} as Record<string, string>)
    cookieToken = cookies[CSRF_TOKEN_COOKIE]
  }

  if (!cookieToken) {
    return false
  }

  // Verify both tokens are valid and match
  const headerValid = await verifySignedToken(headerToken)
  const cookieValid = await verifySignedToken(cookieToken)
  
  if (!headerValid || !cookieValid) {
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
export async function createCSRFTokenCookie(): Promise<{ 
  httpOnlyCookie: { name: string; value: string; options: { httpOnly: boolean; secure: boolean; sameSite: 'strict' | 'lax' | 'none'; maxAge: number } },
  exposedToken: string
}> {
  const token = generateCSRFToken()
  const signedToken = await createSignedToken(token)
  
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

