import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { verifyCronRequest } from '@/lib/cron/verify-cron-request'
import type { SkdbBlogFactsDocument } from '@/lib/skdb/blog-facts-types'

const FACTS_PATH = join(process.cwd(), 'data/blog/skdb-facts-latest.json')

/**
 * GET /api/internal/blog-facts
 * Returns SKDB blog facts JSON for automation (cron-secret protected).
 */
export async function GET(request: Request) {
  const auth = verifyCronRequest(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  if (!existsSync(FACTS_PATH)) {
    return NextResponse.json(
      {
        error: 'skdb-facts-latest.json not found. Run pnpm sync:skdb-blog-facts first.',
      },
      { status: 404 }
    )
  }

  const skdbFacts = JSON.parse(
    readFileSync(FACTS_PATH, 'utf8')
  ) as SkdbBlogFactsDocument

  const domuStats: Record<string, unknown> = {}
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const statsRes = await fetch(`${base}/api/marketing/stats`, {
      next: { revalidate: 0 },
    })
    if (statsRes.ok) {
      const stats = await statsRes.json()
      domuStats.platform = {
        source: 'Domu Match platform data',
        ...stats,
      }
    }
  } catch {
    domuStats.platform = { source: 'Domu Match platform data', unavailable: true }
  }

  return NextResponse.json({
    skdb: skdbFacts,
    domu: domuStats,
    citationSkdb: `Source: ${skdbFacts.attribution}, release ${skdbFacts.skdbRelease}, peildatum ${skdbFacts.peildatum}`,
  })
}
