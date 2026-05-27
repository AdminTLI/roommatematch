import { NextResponse } from 'next/server'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { verifyCronRequest } from '@/lib/cron/verify-cron-request'
import { buildSkdbBlogFactsDocument } from '@/lib/skdb/build-blog-facts'
import { getSkdbApiKey } from '@/lib/skdb/client'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/cron/sync-skdb-blog-facts
 * Refreshes data/blog/skdb-facts-latest.json from SKDB API V1.
 */
export async function GET(request: Request) {
  const auth = verifyCronRequest(request)
  if (!auth.ok) {
    safeLogger.warn('[Cron] sync-skdb-blog-facts unauthorized', auth.logContext)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  if (!getSkdbApiKey()) {
    return NextResponse.json({ error: 'SKDB_API_KEY not configured' }, { status: 500 })
  }

  try {
    const doc = await buildSkdbBlogFactsDocument()
    const outputPath = join(process.cwd(), 'data/blog/skdb-facts-latest.json')
    mkdirSync(join(process.cwd(), 'data/blog'), { recursive: true })
    writeFileSync(outputPath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8')

    safeLogger.info('[Cron] sync-skdb-blog-facts completed', {
      facts: doc.facts.length,
      release: doc.skdbRelease,
    })

    return NextResponse.json({
      ok: true,
      facts: doc.facts.length,
      skdbRelease: doc.skdbRelease,
      peildatum: doc.peildatum,
      generatedAt: doc.generatedAt,
    })
  } catch (error) {
    safeLogger.error('[Cron] sync-skdb-blog-facts failed', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
