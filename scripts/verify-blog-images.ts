/**
 * Verifies all Unsplash URLs used in blog article-content files return HTTP 200.
 * Run: npm run verify:blog-images
 */
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const BLOG_DIR = join(process.cwd(), 'app/(marketing)/blog')
const UNSPLASH_PATTERN = /https:\/\/images\.unsplash\.com\/[^\s"'`]+/g

function collectBlogFiles(): string[] {
  const files: string[] = []
  for (const entry of readdirSync(BLOG_DIR)) {
    const full = join(BLOG_DIR, entry)
    if (!statSync(full).isDirectory()) continue
    const article = join(full, 'article-content.tsx')
    try {
      statSync(article)
      files.push(article)
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
  for (const file of collectBlogFiles()) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(UNSPLASH_PATTERN)) {
      urls.add(match[0])
    }
  }

  if (urls.size === 0) {
    console.log('No Unsplash URLs found in blog articles.')
    return
  }

  console.log(`Checking ${urls.size} Unsplash URL(s)…\n`)
  let failed = 0

  for (const url of [...urls].sort()) {
    const { status } = await checkUrl(url)
    const ok = status >= 200 && status < 400
    console.log(`${ok ? '✓' : '✗'} [${status}] ${url}`)
    if (!ok) failed++
  }

  if (failed > 0) {
    console.error(`\n${failed} URL(s) failed. Replace with keys from lib/blog/approved-images.ts`)
    process.exit(1)
  }

  console.log('\nAll blog image URLs OK.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
