/**
 * Tiered API rate limits for Next.js middleware.
 * Uses @upstash/ratelimit when Upstash Redis is configured; otherwise falls back to
 * the same sliding-window semantics via lib/rate-limit (in-memory in dev).
 */

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createServerClient } from '@supabase/ssr'
import { checkCustomRateLimit, getClientIp, getIPRateLimitKey } from '@/lib/rate-limit'
import { hasUpstashRedisRestEnv } from '@/lib/upstash-env'
import { safeLogger } from '@/lib/utils/logger'

/** All /api/* traffic: per IP */
export const GLOBAL_API_LIMIT = 100
export const GLOBAL_API_WINDOW_SECONDS = 60

/** /api/auth/*: per IP */
export const AUTH_API_LIMIT = 5
export const AUTH_API_WINDOW_SECONDS = 600

/** When Upstash fails during /api/auth/* checks, in-memory fallback (per instance): 1 req/min per IP */
export const AUTH_UPSTASH_ERROR_FALLBACK_LIMIT = 1
export const AUTH_UPSTASH_ERROR_FALLBACK_WINDOW_SECONDS = 60

/** AI endpoints: per authenticated user (or per IP if anonymous) */
export const AI_API_LIMIT = 10
export const AI_API_WINDOW_SECONDS = 60

const AI_RATE_LIMIT_PATHS = new Set(['/api/domu/chat', '/api/chat/compatibility'])

let cachedRedis: Redis | null | undefined
let globalRatelimit: Ratelimit | null | undefined
let authRatelimit: Ratelimit | null | undefined
let aiRatelimit: Ratelimit | null | undefined

function getOptionalRedis(): Redis | null {
  if (cachedRedis !== undefined) {
    return cachedRedis
  }
  if (!hasUpstashRedisRestEnv()) {
    cachedRedis = null
    return null
  }
  try {
    cachedRedis = Redis.fromEnv()
    return cachedRedis
  } catch (e) {
    safeLogger.warn('[RateLimit] Upstash Redis init failed', { error: String(e) })
    cachedRedis = null
    return null
  }
}

function getUpstashLimiters(): {
  global: Ratelimit | null
  auth: Ratelimit | null
  ai: Ratelimit | null
} {
  const redis = getOptionalRedis()
  if (!redis) {
    return { global: null, auth: null, ai: null }
  }
  if (!globalRatelimit) {
    globalRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(GLOBAL_API_LIMIT, '1 m'),
      prefix: 'rl:mw:global',
    })
  }
  if (!authRatelimit) {
    authRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(AUTH_API_LIMIT, '10 m'),
      prefix: 'rl:mw:auth',
    })
  }
  if (!aiRatelimit) {
    aiRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(AI_API_LIMIT, '1 m'),
      prefix: 'rl:mw:ai',
    })
  }
  return { global: globalRatelimit, auth: authRatelimit, ai: aiRatelimit }
}

function drainPending(p: Promise<unknown>) {
  void p.catch(() => {})
}

type LimitOutcome =
  | { ok: true }
  | { ok: false; limit: number; resetMs: number; source: 'limit' | 'error' }

async function enforceStrictAuthMemoryFallback(
  memoryKey: string,
  limit: number,
  windowSec: number
): Promise<LimitOutcome> {
  const fallbackKey = `${memoryKey}:upstash_err_fb`
  try {
    const { allowed, result } = await checkCustomRateLimit(fallbackKey, limit, windowSec, {
      failClosed: true,
    })
    if (!allowed) {
      return { ok: false, limit, resetMs: result.resetTime, source: 'limit' }
    }
    return { ok: true }
  } catch (e) {
    safeLogger.error('[RateLimit] Auth strict memory fallback failed', { error: String(e) })
    return {
      ok: false,
      limit,
      resetMs: Date.now() + windowSec * 1000,
      source: 'error',
    }
  }
}

async function enforceUpstashOrMemory(args: {
  ratelimit: Ratelimit | null
  identifier: string
  memoryKey: string
  memoryLimit: number
  memoryWindowSec: number
  /** If Upstash `limit()` throws, use strict in-memory limits (e.g. /api/auth brute-force protection). */
  strictMemoryFallbackOnUpstashError?: { limit: number; windowSec: number }
}): Promise<LimitOutcome> {
  const {
    ratelimit,
    identifier,
    memoryKey,
    memoryLimit,
    memoryWindowSec,
    strictMemoryFallbackOnUpstashError,
  } = args
  try {
    if (ratelimit) {
      try {
        const r = await ratelimit.limit(identifier)
        drainPending(r.pending)
        if (!r.success) {
          return { ok: false, limit: r.limit, resetMs: r.reset, source: 'limit' }
        }
        return { ok: true }
      } catch (upstashErr) {
        safeLogger.error('[RateLimit] Upstash limit() failed', { error: String(upstashErr) })
        if (strictMemoryFallbackOnUpstashError) {
          return enforceStrictAuthMemoryFallback(
            memoryKey,
            strictMemoryFallbackOnUpstashError.limit,
            strictMemoryFallbackOnUpstashError.windowSec
          )
        }
        const resetMs = Date.now() + memoryWindowSec * 1000
        return { ok: false, limit: memoryLimit, resetMs, source: 'error' }
      }
    }
    const { allowed, result } = await checkCustomRateLimit(
      memoryKey,
      memoryLimit,
      memoryWindowSec,
      { failClosed: true }
    )
    if (!allowed) {
      return { ok: false, limit: memoryLimit, resetMs: result.resetTime, source: 'limit' }
    }
    return { ok: true }
  } catch (e) {
    safeLogger.error('[RateLimit] Middleware limit check failed', { error: String(e) })
    const resetMs = Date.now() + memoryWindowSec * 1000
    return { ok: false, limit: memoryLimit, resetMs, source: 'error' }
  }
}

export function isAiRateLimitedPath(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/'
  return AI_RATE_LIMIT_PATHS.has(p)
}

export function isAuthApiPath(pathname: string): boolean {
  return pathname === '/api/auth' || pathname.startsWith('/api/auth/')
}

function json429(message: string, limit: number, resetMs: number): NextResponse {
  const retryAfterSec = Math.max(1, Math.ceil((resetMs - Date.now()) / 1000))
  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message,
      retryAfter: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(resetMs).toISOString(),
        'Retry-After': String(retryAfterSec),
      },
    }
  )
}

function json503RateLimitUnavailable(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Service Unavailable',
      message: 'Rate limiting is temporarily unavailable. Please try again shortly.',
      retryAfter: retryAfterSec,
    },
    {
      status: 503,
      headers: {
        'Retry-After': String(retryAfterSec),
      },
    }
  )
}

async function getUserIdFromMiddlewareCookies(req: NextRequest): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    return null
  }
  const res = NextResponse.next()
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
      },
    },
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

/**
 * Enforces global, auth-prefix, and AI-specific limits. Returns a 429 response when blocked.
 */
export async function enforceMiddlewareApiRateLimits(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname
  const clientIp = getClientIp(req)
  const { global, auth, ai } = getUpstashLimiters()

  const globalKey = getIPRateLimitKey('mw_global', clientIp)
  const globalResult = await enforceUpstashOrMemory({
    ratelimit: global,
    identifier: globalKey,
    memoryKey: globalKey,
    memoryLimit: GLOBAL_API_LIMIT,
    memoryWindowSec: GLOBAL_API_WINDOW_SECONDS,
  })
  if (!globalResult.ok) {
    if (globalResult.source === 'error') {
      return json503RateLimitUnavailable(GLOBAL_API_WINDOW_SECONDS)
    }
    return json429(
      'Too many requests. You have exceeded the global API rate limit for this network.',
      globalResult.limit,
      globalResult.resetMs
    )
  }

  if (isAuthApiPath(pathname)) {
    const authKey = getIPRateLimitKey('mw_auth', clientIp)
    const isProdRuntime =
      process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL_ENV)
    // Production without working Upstash: same brute-force posture as when limit() throws  -  1 req/min per IP.
    const authMemoryLimit = isProdRuntime ? AUTH_UPSTASH_ERROR_FALLBACK_LIMIT : AUTH_API_LIMIT
    const authMemoryWindowSec = isProdRuntime
      ? AUTH_UPSTASH_ERROR_FALLBACK_WINDOW_SECONDS
      : AUTH_API_WINDOW_SECONDS
    const authResult = await enforceUpstashOrMemory({
      ratelimit: auth,
      identifier: authKey,
      memoryKey: authKey,
      memoryLimit: authMemoryLimit,
      memoryWindowSec: authMemoryWindowSec,
      strictMemoryFallbackOnUpstashError: {
        limit: AUTH_UPSTASH_ERROR_FALLBACK_LIMIT,
        windowSec: AUTH_UPSTASH_ERROR_FALLBACK_WINDOW_SECONDS,
      },
    })
    if (!authResult.ok) {
      if (authResult.source === 'error') {
        return json503RateLimitUnavailable(AUTH_UPSTASH_ERROR_FALLBACK_WINDOW_SECONDS)
      }
      return json429(
        'Too many authentication or account requests from this network. Please wait before trying again.',
        authResult.limit,
        authResult.resetMs
      )
    }
  }

  if (isAiRateLimitedPath(pathname)) {
    const userId = await getUserIdFromMiddlewareCookies(req)
    const aiIdentifier = userId ? `user:${userId}` : `anon:${clientIp}`
    const aiKey = getIPRateLimitKey('mw_ai', aiIdentifier)
    const aiResult = await enforceUpstashOrMemory({
      ratelimit: ai,
      identifier: aiIdentifier,
      memoryKey: aiKey,
      memoryLimit: AI_API_LIMIT,
      memoryWindowSec: AI_API_WINDOW_SECONDS,
    })
    if (!aiResult.ok) {
      if (aiResult.source === 'error') {
        return json503RateLimitUnavailable(AI_API_WINDOW_SECONDS)
      }
      return json429(
        'Too many AI requests. Please wait before sending another message or compatibility check.',
        aiResult.limit,
        aiResult.resetMs
      )
    }
  }

  return null
}
