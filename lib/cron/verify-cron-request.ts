import { timingSafeEqual } from 'crypto'

export type CronAuthResult =
  | { ok: true }
  | { ok: false; status: number; error: string; logContext?: Record<string, unknown> }

export function getCronSecret(): string | null {
  const secret =
    process.env.CRON_SECRET?.trim() || process.env.VERCEL_CRON_SECRET?.trim() || ''
  return secret || null
}

function timingSafeSecretMatch(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(provided, 'utf8'), Buffer.from(expected, 'utf8'))
  } catch {
    return false
  }
}

function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

/**
 * Verifies cron invocations from Vercel Cron, Supabase pg_cron (Bearer or ?secret=),
 * or manual operators.
 */
export function verifyCronRequest(request: Request): CronAuthResult {
  const cronSecret = getCronSecret()
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL_ENV)

  if (isProd && !cronSecret) {
    return {
      ok: false,
      status: 500,
      error: 'Cron secret not configured',
    }
  }

  if (!cronSecret) {
    return { ok: true }
  }

  const authHeader = request.headers.get('authorization')
  const bearer = extractBearerToken(authHeader)
  if (bearer && timingSafeSecretMatch(bearer, cronSecret)) {
    return { ok: true }
  }

  const url = new URL(request.url)
  const querySecret = url.searchParams.get('secret')?.trim() ?? ''
  if (querySecret && timingSafeSecretMatch(querySecret, cronSecret)) {
    return { ok: true }
  }

  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const hasOnlyVercelCronSecret = Boolean(process.env.VERCEL_CRON_SECRET?.trim()) && !process.env.CRON_SECRET?.trim()

  return {
    ok: false,
    status: 401,
    error: 'Unauthorized',
    logContext: {
      hasHeader: Boolean(authHeader),
      hasBearer: Boolean(bearer),
      hasQuerySecret: querySecret.length > 0,
      hasSecret: true,
      isVercelCron,
      hasOnlyVercelCronSecret,
      hint: isVercelCron && !bearer && hasOnlyVercelCronSecret
        ? 'Vercel Cron auto-injects Authorization only when env CRON_SECRET is set; duplicate VERCEL_CRON_SECRET into CRON_SECRET or pass ?secret='
        : undefined,
    },
  }
}
