import { test, expect } from '@playwright/test'

/**
 * Response Time Tests
 * Verifies that critical pages and API endpoints respond within acceptable time limits
 */
test.describe('Response Time Tests', () => {
  test('homepage loads in under 2 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(2000)
  })

  test('sign-in page loads in under 1 second', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/auth/sign-in')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(1000)
  })

  test('sign-up page loads in under 1 second', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/auth/sign-up')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(1000)
  })

  test('onboarding page loads in under 2 seconds', async ({ page }) => {
    // This would require authentication in real scenario
    const startTime = Date.now()
    await page.goto('/onboarding')
    const loadTime = Date.now() - startTime
    
    // May redirect to auth, which is fine
    expect(loadTime).toBeLessThan(2000)
  })

  test('API health endpoint responds in under 500ms', async ({ request }) => {
    const startTime = Date.now()
    const response = await request.get('/api/public/health')
    const responseTime = Date.now() - startTime
    
    expect(responseTime).toBeLessThan(500)
    expect(response.status()).toBeLessThan(500) // Should not be server error
  })

  test('admin analytics API responds in under 1 second', async ({ request }) => {
    const startTime = Date.now()
    const response = await request.get('/api/admin/analytics')
    const responseTime = Date.now() - startTime
    
    // May return 401/403 if not authenticated, but should respond quickly
    expect(responseTime).toBeLessThan(1000)
    expect([200, 401, 403]).toContain(response.status())
  })

  test('matches page loads in under 2 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/matches')
    const loadTime = Date.now() - startTime
    
    // May redirect to auth, which is fine
    expect(loadTime).toBeLessThan(2000)
  })

  test('chat page loads in under 2 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/chat')
    const loadTime = Date.now() - startTime
    
    // May redirect to auth, which is fine
    expect(loadTime).toBeLessThan(2000)
  })

  test('dashboard page loads in under 2 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/dashboard')
    const loadTime = Date.now() - startTime
    
    // May redirect to auth, which is fine
    expect(loadTime).toBeLessThan(2000)
  })

  test('admin panel loads in under 2 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/admin')
    const loadTime = Date.now() - startTime
    
    // May redirect to auth, which is fine
    expect(loadTime).toBeLessThan(2000)
  })
})

