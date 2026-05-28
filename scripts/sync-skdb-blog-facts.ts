#!/usr/bin/env tsx

/**
 * Build aggregated SKDB statistics for weekly blog automation.
 * Writes data/blog/skdb-facts-latest.json and optionally upserts skdb_blog_facts.
 *
 * Usage:
 *   pnpm sync:skdb-blog-facts
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { getSkdbApiBase } from '@/lib/skdb/client'
import { buildSkdbBlogFactsDocument } from '@/lib/skdb/build-blog-facts'
import { validateSkdbSyncConfig } from '@/lib/skdb/validate-config'
import type { SkdbBlogFactsDocument } from '@/lib/skdb/blog-facts-types'
import { createAdminClient } from '@/lib/supabase/server'

const OUTPUT_PATH = join(process.cwd(), 'data/blog/skdb-facts-latest.json')

try {
  const envPath = join(process.cwd(), '.env.local')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0 && !process.env[key]) {
          process.env[key] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        }
      }
    }
  }
} catch {
  // optional .env.local
}

async function upsertToDatabase(doc: SkdbBlogFactsDocument): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('   Skipping DB upsert (Supabase env not set)')
    return
  }

  const supabase = createAdminClient()
  const rows = doc.facts.map((f) => ({
    fact_key: f.id,
    fact_value: { value: f.value, unit: f.unit, label: f.label, scope: f.scope },
    label: f.label,
    scope: f.scope || 'nl',
    source_table: f.source,
    peildatum: doc.peildatum,
    skdb_release: doc.skdbRelease,
  }))

  const { error } = await supabase.from('skdb_blog_facts').upsert(rows, {
    onConflict: 'fact_key,skdb_release,peildatum',
  })

  if (error) {
    console.warn('   ⚠️  DB upsert skipped:', error.message)
  } else {
    console.log(`   Upserted ${rows.length} facts to skdb_blog_facts`)
  }
}

async function main() {
  const skdbConfig = validateSkdbSyncConfig()
  if (!skdbConfig.ok || skdbConfig.source !== 'api') {
    console.error(`\n❌ ${skdbConfig.ok ? 'Blog facts require API mode.' : skdbConfig.message}\n`)
    if (!skdbConfig.ok) {
      for (const hint of skdbConfig.hints) console.error(`   • ${hint}`)
    } else {
      console.error('   • Blog facts aggregation uses the SKDB API (not CSV dump). Set a valid SKDB_API_KEY.')
    }
    console.error('')
    process.exit(1)
  }

  console.log(`📊 Building SKDB blog facts from ${getSkdbApiBase()}...`)
  const doc = await buildSkdbBlogFactsDocument()

  mkdirSync(join(process.cwd(), 'data/blog'), { recursive: true })
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(doc, null, 2)}\n`, 'utf8')
  console.log(`✅ Wrote ${OUTPUT_PATH}`)
  console.log(
    `   ${doc.facts.length} facts, ${doc.byCluster.length} clusters, ${doc.bySector.length} sectors`
  )

  await upsertToDatabase(doc)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
