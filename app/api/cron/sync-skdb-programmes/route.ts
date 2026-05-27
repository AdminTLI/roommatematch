import { NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/cron/verify-cron-request'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/cron/sync-skdb-programmes
 * Triggers programme sync. On Vercel, run `pnpm sync:programmes` in CI or locally;
 * this endpoint records intent and validates cron auth for scheduled operators.
 *
 * For full sync, invoke locally or via deployment hook:
 *   pnpm sync:programmes
 */
export async function GET(request: Request) {
  const auth = verifyCronRequest(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  safeLogger.info('[Cron] sync-skdb-programmes ping received — run pnpm sync:programmes on a worker with Supabase access')

  return NextResponse.json({
    ok: true,
    message:
      'Programme sync must run via `pnpm sync:programmes` (requires Supabase write). Use this cron as a reminder or wire a CI job.',
    docs: '/docs/PROGRAMME_DATA.md',
  })
}
