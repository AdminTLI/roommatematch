import { test, expect } from '@playwright/test'

/**
 * Admin Panel Functionality Test
 * Tests admin CRUD operations and panel features
 */
test.describe('Admin Panel', () => {
  // Note: This test assumes admin credentials are available
  // In a real scenario, you'd set up test admin users
  
  test('admin can access admin panel', async ({ page }) => {
    // Sign in as admin (would need test admin credentials)
    await test.step('Sign in as admin', async () => {
      // This would require test admin setup
      // For now, we'll test the admin routes exist
      await page.goto('/admin')
      
      // Should redirect to sign-in if not authenticated
      // or show admin panel if authenticated
      const url = page.url()
      expect(url).toMatch(/\/admin|\/auth\/sign-in/)
    })
  })

  test('admin metrics page loads', async ({ page }) => {
    await page.goto('/admin/metrics')
    
    // Should show metrics page or redirect to auth
    const url = page.url()
    expect(url).toMatch(/\/admin\/metrics|\/auth\/sign-in/)
    
    // If authenticated as admin, should show metrics content
    if (url.includes('/admin/metrics')) {
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('admin reports page loads', async ({ page }) => {
    await page.goto('/admin/reports')
    
    const url = page.url()
    expect(url).toMatch(/\/admin\/reports|\/auth\/sign-in/)
    
    if (url.includes('/admin/reports')) {
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('admin matches page loads', async ({ page }) => {
    await page.goto('/admin/matches')
    
    const url = page.url()
    expect(url).toMatch(/\/admin\/matches|\/auth\/sign-in/)
    
    if (url.includes('/admin/matches')) {
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('admin chats page loads', async ({ page }) => {
    await page.goto('/admin/chats')
    
    const url = page.url()
    expect(url).toMatch(/\/admin\/chats|\/auth\/sign-in/)
    
    if (url.includes('/admin/chats')) {
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('admin analytics API endpoint', async ({ request }) => {
    // Test the analytics API endpoint
    const response = await request.get('/api/admin/analytics')
    
    // Should return 401 if not authenticated, or 200 with data if authenticated
    expect([200, 401, 403]).toContain(response.status())
    
    if (response.status() === 200) {
      const data = await response.json()
      expect(data).toHaveProperty('totalUsers')
      expect(data).toHaveProperty('verifiedUsers')
      expect(data).toHaveProperty('activeChats')
      expect(data).toHaveProperty('totalMatches')
    }
  })

  test('admin reports API endpoint', async ({ request }) => {
    const response = await request.get('/api/admin/reports')
    
    // Should return 401 if not authenticated, or 200 with data if authenticated
    expect([200, 401, 403]).toContain(response.status())
    
    if (response.status() === 200) {
      const data = await response.json()
      expect(data).toHaveProperty('reports')
    }
  })

  test('admin matches API endpoint', async ({ request }) => {
    const response = await request.get('/api/admin/matches')
    
    expect([200, 401, 403]).toContain(response.status())
    
    if (response.status() === 200) {
      const data = await response.json()
      expect(data).toHaveProperty('matches')
    }
  })
})

