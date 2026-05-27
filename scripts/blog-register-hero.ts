#!/usr/bin/env tsx

/**
 * Register a blog post slug with its BlogHeroImage key.
 *
 * Usage:
 *   pnpm blog:register-hero -- --slug=my-new-post --imageKey=quietRoommate --date=2026-05-27
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { BLOG_HERO_IMAGE_KEYS, type BlogHeroImageKey } from '@/lib/blog/approved-images'

const REGISTRY_PATH = join(process.cwd(), 'data/blog/hero-image-registry.json')

function parseArgs(): { slug: string; imageKey: BlogHeroImageKey; date: string } {
  const args = process.argv.slice(2)
  let slug = ''
  let imageKey = ''
  let date = new Date().toISOString().slice(0, 10)

  for (const arg of args) {
    if (arg.startsWith('--slug=')) slug = arg.slice('--slug='.length)
    if (arg.startsWith('--imageKey=')) imageKey = arg.slice('--imageKey='.length)
    if (arg.startsWith('--date=')) date = arg.slice('--date='.length)
  }

  if (!slug || !imageKey) {
    console.error(
      'Usage: pnpm blog:register-hero -- --slug=<slug> --imageKey=<key> [--date=YYYY-MM-DD]'
    )
    process.exit(1)
  }

  if (!BLOG_HERO_IMAGE_KEYS.includes(imageKey as BlogHeroImageKey)) {
    console.error(`Invalid imageKey. Allowed: ${BLOG_HERO_IMAGE_KEYS.join(', ')}`)
    process.exit(1)
  }

  return { slug, imageKey: imageKey as BlogHeroImageKey, date }
}

function main() {
  const { slug, imageKey, date } = parseArgs()

  const registry = existsSync(REGISTRY_PATH)
    ? JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'))
    : { description: '', entries: [] }

  const entries = Array.isArray(registry.entries) ? registry.entries : []
  const filtered = entries.filter((e: { slug: string }) => e.slug !== slug)
  filtered.push({ slug, imageKey, date })

  registry.entries = filtered
  writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf8')
  console.log(`Registered ${slug} → ${imageKey} (${date})`)
}

main()
