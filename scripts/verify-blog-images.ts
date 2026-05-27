/**
 * Verifies blog image URLs: approved catalog + legacy inline Unsplash in articles.
 * Run: npm run verify:blog-images
 */
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { BLOG_HERO_IMAGES } from '../lib/blog/approved-images'
import { LEGACY_BLOG_SLUGS_WITH_INLINE_UNSPLASH } from '../lib/blog/legacy-blog-slugs'

const BLOG_DIR = join(process.cwd(), 'app/(marketing)/blog')
const UNSPLASH_PATTERN = /https:\/\/images\.unsplash\.com\/[^\s"'`]+/g

function collectBlogFiles(): { slug: string; path: string }[] {
  const files: { slug: string; path: string }[] = []
  for (const entry of readdirSync(BLOG_DIR)) {
    const full = join(BLOG_DIR, entry)
    if (!statSync(full).isDirectory()) continue
    const article = join(full, 'article-content.tsx')
    try {
      statSync(article)
      files.push({ slug: entry, path: article })
    } catch {
      // no article file
    }
  }
  return files
}

async function checkUrl(url: string): Promise<{ url: string; status: number }> {
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
  return { url, status: res.status }
}

async function main() {
  const urls = new Set<string>()

  for (const img of Object.values(BLOG_HERO_IMAGES)) {
    urls.add(img.src)
  }

  const violations: string[] = []

  for (const { slug, path } of collectBlogFiles()) {
    const text = readFileSync(path, 'utf8')
    const inlineMatches = [...text.matchAll(UNSPLASH_PATTERN)]

    if (inlineMatches.length > 0 && !LEGACY_BLOG_SLUGS_WITH_INLINE_UNSPLASH.has(slug)) {
      violations.push(
        `${slug}: uses inline Unsplash URLs. Use <BlogHeroImage imageKey="..." /> instead.`
      )
    }

    for (const match of inlineMatches) {
      urls.add(match[0])
    }

    if (
      text.includes('BlogHeroImage') &&
      !text.includes('imageKey=') &&
      !LEGACY_BLOG_SLUGS_WITH_INLINE_UNSPLASH.has(slug)
    ) {
      violations.push(`${slug}: BlogHeroImage without imageKey`)
    }
  }

  if (violations.length > 0) {
    console.error('Blog image policy violations:\n')
    for (const v of violations) console.error(`  ✗ ${v}`)
    process.exit(1)
  }

  if (urls.size === 0) {
    console.log('No image URLs to check.')
    return
  }

  console.log(`Checking ${urls.size} Unsplash URL(s)…\n`)
  let failed = 0
  let legacyFailed = 0

  const approvedUrls = new Set(Object.values(BLOG_HERO_IMAGES).map((i) => i.src))

  for (const url of [...urls].sort()) {
    const { status } = await checkUrl(url)
    const ok = status >= 200 && status < 400
    const isApproved = approvedUrls.has(url)
    console.log(`${ok ? '✓' : '✗'} [${status}] ${url}${isApproved ? ' (approved)' : ''}`)
    if (!ok) {
      if (isApproved) failed++
      else legacyFailed++
    }
  }

  if (legacyFailed > 0) {
    console.warn(
      `\n${legacyFailed} legacy inline URL(s) failed (non-blocking). Migrate posts to BlogHeroImage when editing.`
    )
  }

  if (failed > 0) {
    console.error(`\n${failed} approved catalog URL(s) failed. Update lib/blog/approved-images.ts`)
    process.exit(1)
  }

  console.log('\nAll blog image URLs OK.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
