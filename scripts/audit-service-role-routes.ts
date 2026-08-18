/**
 * Audit app/api routes that use service/admin Supabase clients.
 * Run: npx tsx scripts/audit-service-role-routes.ts
 */
import fs from 'fs'
import path from 'path'

const API_ROOT = path.join(process.cwd(), 'app/api')

type Classification =
  | 'user-authenticated'
  | 'admin-only'
  | 'cron-webhook'
  | 'public-aggregate'
  | 'public-form'
  | 'token-authenticated'
  | 'needs-review'

function walk(dir: string): string[] {
  const out: string[] = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walk(p))
    else if (ent.name === 'route.ts') out.push(p)
  }
  return out
}

function classify(filePath: string, content: string): Classification {
  const rel = path.relative(API_ROOT, filePath)
  const isCronRoute = rel.startsWith('cron/') || rel.includes('/cron/')
  if (
    isCronRoute ||
    rel.includes('webhook') ||
    content.includes('verifyCronRequest') ||
    (isCronRoute && (content.includes('CRON_SECRET') || content.includes('VERCEL_CRON_SECRET')))
  ) {
    return 'cron-webhook'
  }
  if (rel.startsWith('admin/')) return 'admin-only'
  if (rel === 'marketing/stats/route.ts') return 'public-aggregate'
  if (rel === 'careers/apply/route.ts' || rel === 'contact/route.ts') return 'public-form'
  // Token-authenticated routes use HMAC-signed tokens instead of session cookies.
  // The unsubscribe route verifies identity via verifyUnsubscribeToken() before any DB access.
  if (content.includes('verifyUnsubscribeToken') || content.includes('verifyToken')) {
    return 'token-authenticated'
  }
  if (
    content.includes('getUser()') ||
    content.includes('requireAdmin') ||
    content.includes('requireAuthenticatedUser') ||
    content.includes('requireVerifiedUser')
  ) {
    return 'user-authenticated'
  }
  return 'needs-review'
}

function main() {
  const routes = walk(API_ROOT)
  const rows: { path: string; usesService: boolean; classification: Classification }[] = []

  for (const file of routes) {
    const content = fs.readFileSync(file, 'utf8')
    const usesService =
      content.includes('createAdminClient') || content.includes('createServiceClient')
    if (!usesService) continue
    const rel = path.relative(process.cwd(), file)
    rows.push({
      path: rel,
      usesService: true,
      classification: classify(file, content),
    })
  }

  const needsReview = rows.filter((r) => r.classification === 'needs-review')
  console.log(`Service-role routes: ${rows.length}`)
  console.log(`Needs review (no getUser/requireAdmin): ${needsReview.length}\n`)
  for (const r of rows.sort((a, b) => a.path.localeCompare(b.path))) {
    const flag = r.classification === 'needs-review' ? ' ⚠️' : ''
    console.log(`[${r.classification}] ${r.path}${flag}`)
  }
  if (needsReview.length > 0) {
    process.exitCode = 1
  }
}

main()
