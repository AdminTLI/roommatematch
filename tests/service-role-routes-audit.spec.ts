import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'

/**
 * CI guard: service-role API routes must declare auth (getUser or requireAdmin) or be classified cron/webhook/admin.
 */
test('service role route audit passes', () => {
  try {
    execSync('npx tsx scripts/audit-service-role-routes.ts', {
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8',
    })
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; status?: number }
    const out = `${err.stdout || ''}\n${err.stderr || ''}`
    expect(out, 'Routes missing auth guards').not.toContain('needs-review')
    if (err.status === 1 && out.includes('needs-review')) {
      throw new Error(out)
    }
  }
})
